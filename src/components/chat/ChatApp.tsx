'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
    Send, Phone, Video, Paperclip, Image as ImageIcon,
    MoreVertical, Search, PlusCircle, Check, CheckCheck, FileText, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
interface User {
    id: string;
    name: string;
    avatar?: string;
    email: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    type: 'text' | 'image' | 'file';
    fileUrl?: string;
    readBy?: string[];
    pending?: boolean;
}

interface Conversation {
    id: string;
    lastMessage: { content: string; senderId: string } | null; // Updated to match API object
    lastMessageAt: string | null;
    otherParticipants: User[];
}

// --- API Helper ---
const fetcher = async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem('token');
    const headers = {
        ...options?.headers,
        Authorization: `Bearer ${token}`
    };

    // If body is FormData, don't set Content-Type header (browser sets it with boundary)
    if (!(options?.body instanceof FormData)) {
        Object.assign(headers, { 'Content-Type': 'application/json' });
    }

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'An error occurred');
    }
    return res.json();
};

export function ChatApp() {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [myId, setMyId] = useState<string>('');

    const queryClient = useQueryClient();
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get current user ID
    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.id) setMyId(user.id);
        } catch (e) { }
    }, []);

    // --- Queries ---

    const { data: conversationsData, isLoading: loadingConvs } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => fetcher('/api/v1/conversations'),
        refetchInterval: 5000 // Polling for new conversations/updates
    });

    const conversations = conversationsData?.conversations || [];

    const { data: messagesData } = useQuery({
        queryKey: ['messages', selectedConversation?.id],
        queryFn: () => fetcher(`/api/v1/conversations/${selectedConversation!.id}/messages`),
        enabled: !!selectedConversation,
        refetchInterval: 3000 // Realtime polling
    });

    // The API returns { messages: [...], pagination: {...} }
    // Optimistic UI updates might have pushed directly to query cache, so we handle both array (legacy cache) and object
    const messages = Array.isArray(messagesData) ? messagesData : (messagesData?.messages || []);

    // --- Mutations ---

    const markReadMutation = useMutation({
        mutationFn: async (convId: string) => {
            return fetcher(`/api/v1/conversations/${convId}/messages`, { method: 'PATCH' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (payload: { content: string, type: 'text' | 'image' | 'file', fileUrl?: string }) => {
            return fetcher(`/api/v1/conversations/${selectedConversation!.id}/messages`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        },
        onMutate: async (newMsg) => {
            await queryClient.cancelQueries({ queryKey: ['messages', selectedConversation?.id] });
            const previousMessages = queryClient.getQueryData(['messages', selectedConversation?.id]);

            // Optimistic update
            const optimisticMsg: Message = {
                id: `temp-${Date.now()}`,
                content: newMsg.content,
                senderId: myId,
                createdAt: new Date().toISOString(),
                type: newMsg.type,
                fileUrl: newMsg.fileUrl,
                readBy: [myId],
                pending: true
            };

            queryClient.setQueryData(['messages', selectedConversation?.id], (old: Message[] = []) => [...old, optimisticMsg]);
            return { previousMessages };
        },
        onError: (err, newMsg, context: any) => {
            queryClient.setQueryData(['messages', selectedConversation?.id], context.previousMessages);
            toast.error('Failed to send message');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            // We pass FormData directly, fetcher handles headers
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (!res.ok) throw new Error('Upload failed');
            return res.json();
        },
        onSuccess: (data) => {
            // After upload, send message with file
            const type = data.type?.startsWith('image/') ? 'image' : 'file';
            sendMessageMutation.mutate({
                content: type === 'image' ? 'Sent an image' : 'Sent a file',
                type,
                fileUrl: data.url
            });
        },
        onError: () => toast.error('Failed to upload file')
    });

    // --- Effects ---

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, selectedConversation]);

    // Mark as read when messages load or conversation changes
    useEffect(() => {
        if (selectedConversation && messages.length > 0) {
            // Check if there are unread messages
            const hasUnread = messages.some((m: Message) => m.senderId !== myId && !m.readBy?.includes(myId));
            if (hasUnread) {
                markReadMutation.mutate(selectedConversation.id);
            }
        }
    }, [messages, selectedConversation]);

    // --- Handlers ---

    const handleSend = () => {
        if (!messageInput.trim()) return;
        sendMessageMutation.mutate({ content: messageInput, type: 'text' });
        setMessageInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            uploadMutation.mutate(e.target.files[0]);
        }
    };

    // --- Helpers ---

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
    };

    const isSameDay = (d1: string, d2: string) => {
        return new Date(d1).toDateString() === new Date(d2).toDateString();
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] border rounded-xl overflow-hidden bg-background shadow-2xl ring-1 ring-border/50">
            {/* Sidebar */}
            <div className="w-80 md:w-96 border-r flex flex-col bg-muted/5 backdrop-blur-xl">
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur z-10">
                    <h2 className="font-bold text-xl tracking-tight">Messages</h2>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setShowNewChatModal(true)}>
                        <PlusCircle className="h-6 w-6" />
                    </Button>
                </div>
                <div className="p-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input placeholder="Search chats..." className="pl-9 bg-background/50 border-input/50 focus:bg-background transition-all" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-1 p-2">
                        {loadingConvs ? (
                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="text-xs">Loading conversations...</span>
                            </div>
                        ) : conversations?.length === 0 ? (
                            <p className="p-4 text-center text-muted-foreground text-sm">No conversations yet.</p>
                        ) : conversations?.map((conv: any) => {
                            const other = conv.otherParticipants[0] || { name: 'Unknown', avatar: '' };
                            const isActive = selectedConversation?.id === conv.id;
                            const hasUnread = conv.lastMessage &&
                                new Date(conv.lastMessageAt) > new Date(Date.now() - 86400000) && /* heuristic */
                                false; // Doing real unread count is complex without returning it from API

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent
                                        ${isActive ? 'bg-primary/10 border-primary/10 shadow-sm' : 'hover:bg-muted/60 hover:border-border/50'}
                                    `}
                                >
                                    <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                                        <AvatarImage src={other.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                                            {other.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className={`text-sm truncate ${isActive ? 'font-bold' : 'font-semibold'}`}>{other.name}</span>
                                            {conv.lastMessageAt && (
                                                <span className="text-[10px] text-muted-foreground shrink-0">
                                                    {formatTime(conv.lastMessageAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {typeof conv.lastMessage === 'string' ? conv.lastMessage : (conv.lastMessage?.content || 'Start a conversation')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            {selectedConversation ? (
                <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-3xl relative">
                    {/* Chat Header */}
                    <div className="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur sticky top-0 z-20 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {selectedConversation.otherParticipants[0]?.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-sm leading-none mb-1">{selectedConversation.otherParticipants[0]?.name}</h3>
                                <div className="flex items-center gap-1.5 status-indicator">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                    <span className="text-xs text-muted-foreground font-medium">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => toast.info('Video calls coming soon')}>
                                <Video className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => toast.info('Voice calls coming soon')}>
                                <Phone className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {/* Group messages by day could be added here, for now just list */}
                            {messages.map((msg: Message, i: number) => {
                                const isMe = msg.senderId === myId;
                                const showAvatar = !isMe && (i === 0 || messages[i - 1].senderId !== msg.senderId);
                                const isPending = msg.pending;
                                const isRead = msg.readBy && msg.readBy.length > 1; // Simplistic read check

                                return (
                                    <div key={msg.id} className={`flex gap-3 group animate-in slide-in-from-bottom-2 duration-300 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        {!isMe && (
                                            <div className="w-8 flex-shrink-0 flex items-end">
                                                {showAvatar ? (
                                                    <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                                                        <AvatarFallback className="text-xs">{selectedConversation.otherParticipants[0]?.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                ) : <div className="w-8" />}
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                            <div
                                                className={`
                                                    px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words relative transition-all
                                                    ${isMe
                                                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                        : 'bg-white dark:bg-slate-800 border border-border/50 dark:border-border rounded-bl-sm'}
                                                    ${isPending ? 'opacity-70' : 'opacity-100'}
                                                `}
                                            >
                                                {msg.type === 'image' && msg.fileUrl ? (
                                                    <div className="mb-2 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                                                        <img src={msg.fileUrl} alt="Shared image" className="max-w-xs max-h-60 object-cover" />
                                                    </div>
                                                ) : msg.type === 'file' && msg.fileUrl ? (
                                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded mb-1 hover:bg-black/20 transition-colors">
                                                        <FileText className="h-4 w-4" />
                                                        <span className="underline decoration-dotted text-xs">Attachment</span>
                                                    </a>
                                                ) : null}

                                                <p className="leading-relaxed">{msg.content}</p>

                                                <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70 ${isMe ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                                    {formatTime(msg.createdAt)}
                                                    {isMe && (
                                                        <span>
                                                            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> :
                                                                isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 bg-background/80 backdrop-blur border-t z-20">
                        <div className="flex items-end gap-2 max-w-4xl mx-auto container">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <div className="flex gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors h-10 w-10"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadMutation.isPending}
                                >
                                    {uploadMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                                </Button>
                                <Button size="icon" variant="ghost" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors h-10 w-10 hidde md:flex">
                                    <ImageIcon className="h-5 w-5" />
                                </Button>
                            </div>

                            <Input
                                placeholder="Type a message..."
                                className="flex-1 min-h-[44px] py-2.5 rounded-full bg-muted/40 border-transparent focus:border-primary/20 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                autoFocus
                            />

                            <Button
                                size="icon"
                                className={`rounded-full h-11 w-11 shadow-lg transition-all transform hover:scale-105 active:scale-95 ${!messageInput.trim() ? 'opacity-50' : 'hover:shadow-primary/30'}`}
                                onClick={handleSend}
                                disabled={!messageInput.trim()}
                            >
                                <Send className="h-5 w-5 ml-0.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur-3xl animate-in fade-in duration-500">
                    <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                        <Send className="h-14 w-14 text-primary opacity-20" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground tracking-tight">Your Messages</h3>
                    <p className="max-w-md text-center text-muted-foreground mb-8">
                        Select a conversation from the sidebar or start a new one to connect with your team in real-time.
                    </p>
                    <Button onClick={() => setShowNewChatModal(true)} size="lg" className="rounded-full px-8 shadow-lg hover:shadow-primary/25 transition-all">
                        Start New Conversation
                    </Button>

                    {/* Render modal if needed */}
                    {showNewChatModal && <NewChatModal onClose={() => setShowNewChatModal(false)} />}
                </div>
            )}
        </div>
    );
}

function NewChatModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();

    // We need to fetch users
    const { data: userData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => fetcher('/api/v1/users'),
    });

    const users = userData?.users || [];

    const createConvMutation = useMutation({
        mutationFn: async (recipientId: string) => {
            return fetcher('/api/v1/conversations', {
                method: 'POST',
                body: JSON.stringify({ recipientId, message: '👋 Started a conversation' })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <Card className="w-96 p-0 overflow-hidden shadow-2xl border-0 ring-1 ring-border/50">
                <div className="p-4 border-b bg-muted/30">
                    <h3 className="font-bold text-lg">New Message</h3>
                    <p className="text-xs text-muted-foreground">Select a user to start chatting</p>
                </div>
                <ScrollArea className="h-80 p-2">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading users...</div>
                    ) : users?.map((u: User) => (
                        <div key={u.id}
                            className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors"
                            onClick={() => createConvMutation.mutate(u.id)}
                        >
                            <Avatar className="h-10 w-10 border border-border/50">
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback className="bg-secondary text-secondary-foreground">{u.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
                <div className="p-4 border-t bg-muted/10 flex justify-end">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </div>
            </Card>
        </div>
    );
}
