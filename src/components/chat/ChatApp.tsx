'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, Phone, Video, Paperclip, Image as ImageIcon, MoreVertical, Search, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// Helper to fetch data
const fetcher = async (url: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
};

export function ChatApp() {
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messageInput, setMessageInput] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const queryClient = useQueryClient();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Conversations
    const { data: conversations, isLoading: loadingConvs } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => fetcher('/api/v1/conversations'),
        refetchInterval: 3000 // Polling for new chats
    });

    // Fetch Messages for selected conversation
    const { data: messages } = useQuery({
        queryKey: ['messages', selectedConversation?.id],
        queryFn: () => fetcher(`/api/v1/conversations/${selectedConversation.id}/messages`),
        enabled: !!selectedConversation,
        refetchInterval: 2000 // Polling for real-time messaging
    });

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Send Message Mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            const token = localStorage.getItem('token');
            await fetch(`/api/v1/conversations/${selectedConversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content, type: 'text' })
            });
        },
        onSuccess: () => {
            setMessageInput('');
            queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
        }
    });

    const handleSend = () => {
        if (!messageInput.trim()) return;
        sendMessageMutation.mutate(messageInput);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] border rounded-lg overflow-hidden bg-background shadow-lg">
            {/* Sidebar: Conversation List */}
            <div className="w-80 border-r flex flex-col bg-muted/10">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold text-lg">Messages</h2>
                    <Button size="icon" variant="ghost" onClick={() => setShowNewChatModal(true)}>
                        <PlusCircle className="h-5 w-5 text-primary" />
                    </Button>
                </div>
                <div className="p-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search chats..." className="pl-8" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-1 p-2">
                        {loadingConvs ? (
                            <p className="p-4 text-center text-muted-foreground text-sm">Loading...</p>
                        ) : conversations?.map((conv: any) => {
                            const other = conv.otherParticipants[0] || { name: 'Unknown', avatar: '' };
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
                                >
                                    <Avatar>
                                        <AvatarImage src={other.avatar} />
                                        <AvatarFallback>{other.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-semibold truncate">{other.name}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            {selectedConversation ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{selectedConversation.otherParticipants[0]?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold">{selectedConversation.otherParticipants[0]?.name}</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-muted-foreground">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" onClick={() => toast.info('Voice calls coming soon (Q1 2025)')}>
                                <Phone className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => toast.info('Video calls coming soon (Q1 2025)')}>
                                <Video className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="ghost">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4 bg-muted/5">
                        <div className="space-y-4">
                            {messages?.map((msg: any) => {
                                const isMe = msg.senderId === JSON.parse(localStorage.getItem('user') || '{}').id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 text-right opacity-70`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 bg-background border-t">
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground">
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Input
                                placeholder="Type a message..."
                                className="rounded-full bg-muted/20 border-0 focus-visible:ring-1"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                autoFocus
                            />
                            <Button
                                size="icon"
                                className="rounded-full h-10 w-10 shrink-0"
                                onClick={handleSend}
                                disabled={!messageInput.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                    <div className="w-24 h-24 bg-muted mb-4 rounded-full flex items-center justify-center">
                        <Send className="h-10 w-10 opacity-20" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                    <p className="max-w-xs text-center">Select a conversation or start a new one to connect with your team.</p>
                    {showNewChatModal && <NewChatModal onClose={() => setShowNewChatModal(false)} onSelect={(u) => {
                        // Create conversation logic here (simplified)
                        // In real app, we'd hit API to create conv, then select it
                        setShowNewChatModal(false);
                    }} />}
                </div>
            )}
        </div>
    );
}

function NewChatModal({ onClose, onSelect }: { onClose: () => void, onSelect: (u: any) => void }) {
    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: () => fetcher('/api/v1/users'),
    });

    const createConvMutation = useMutation({
        mutationFn: async (recipientId: string) => {
            const token = localStorage.getItem('token');
            return fetch('/api/v1/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ recipientId, message: 'Hi!' })
            }).then(r => r.json());
        },
        onSuccess: () => {
            // Invalidate convs to refresh list
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96 p-4">
                <h3 className="font-bold mb-4">New Message</h3>
                <ScrollArea className="h-64">
                    {users?.map((u: any) => (
                        <div key={u.id}
                            className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                            onClick={() => createConvMutation.mutate(u.id)}
                        >
                            <Avatar>
                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{u.name}</span>
                        </div>
                    ))}
                </ScrollArea>
                <Button variant="outline" className="w-full mt-4" onClick={onClose}>Cancel</Button>
            </Card>
        </div>
    );
}
