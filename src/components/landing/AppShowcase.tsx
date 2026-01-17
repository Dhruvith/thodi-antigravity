'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, MessageCircle, Calendar, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

// Since we don't have the actual images, I will create a layout that LOOKS like the screenshot
// using CSS and HTML structure to mock the "App UI"

const MockChatScreen = () => (
    <div className="relative w-[300px] h-[600px] bg-black rounded-[40px] border-8 border-gray-800 overflow-hidden shadow-2xl mx-auto">
        {/* Status Bar */}
        <div className="h-8 bg-black w-full flex justify-between items-center px-6 pt-2">
            <span className="text-white text-xs font-bold">9:41</span>
            <div className="flex gap-1">
                <div className="w-4 h-2 bg-white rounded-sm"></div>
                <div className="w-4 h-2 bg-white rounded-sm"></div>
            </div>
        </div>

        {/* App Header */}
        <div className="bg-background p-4 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent"></div>
                <span className="font-bold text-sm">Athalia Putri</span>
            </div>
            <MessageCircle className="w-5 h-5 text-primary" />
        </div>

        {/* Chat Area */}
        <div className="p-4 space-y-4 h-full bg-background/50">
            {/* Received Message */}
            <div className="flex gap-2">
                <div className="bg-muted p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                    <img src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&auto=format&fit=crop&q=60" alt="Cat" className="rounded-lg mb-2 h-32 w-full object-cover" />
                    <p className="text-xs">Look at how chocho sleep in my arms!</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">16:46</span>
                </div>
            </div>

            {/* Sent Message */}
            <div className="flex flex-col items-end gap-1">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                    <p className="text-xs">Can I come over?</p>
                </div>
                <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                    <p className="text-xs">Of course, let me know if you're on your way</p>
                </div>
            </div>

            {/* Task/Event Bubble (Feature Highlight) */}
            <div className="flex justify-center my-4">
                <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/50 flex items-center gap-3 max-w-[90%]">
                    <Calendar className="w-8 h-8 text-secondary" />
                    <div>
                        <p className="text-xs font-bold text-secondary-foreground">Project Meeting</p>
                        <p className="text-[10px] text-muted-foreground">Today at 4:00 PM</p>
                    </div>
                    <Badge className="ml-2 bg-secondary text-[10px] h-5">Join</Badge>
                </div>
            </div>
        </div>
    </div>
);

const MockTaskScreen = () => (
    <div className="relative w-[300px] h-[600px] bg-white dark:bg-black rounded-[40px] border-8 border-gray-800 overflow-hidden shadow-2xl mx-auto shadow-primary/20">
        <div className="h-8 bg-transparent w-full flex justify-between items-center px-6 pt-2 z-10 relative">
            <span className="dark:text-white text-black text-xs font-bold">9:41</span>
        </div>
        <div className="p-6 pt-10">
            <h3 className="text-2xl font-bold mb-6">My <span className="text-primary">Tasks</span></h3>

            <div className="space-y-4">
                {[
                    { title: "Design Landing Page", tag: "UI/UX", color: "bg-orange-100 text-orange-600", checked: true },
                    { title: "Update Database", tag: "Dev", color: "bg-blue-100 text-blue-600", checked: false },
                    { title: "Client Meeting", tag: "Meeting", color: "bg-green-100 text-green-600", checked: false },
                ].map((task, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.checked ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                            {task.checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                            <p className={`text-sm font-semibold ${task.checked ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${task.color} mt-1 inline-block`}>{task.tag}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-2xl">
                <h4 className="font-bold text-sm mb-2">Team Progress</h4>
                <div className="h-2 w-full bg-muted rounded-full">
                    <div className="h-full w-[70%] bg-gradient-to-r from-primary to-accent rounded-full"></div>
                </div>
                <p className="text-xs text-right mt-1 text-muted-foreground">70% Completed</p>
            </div>
        </div>
    </div>
);

export function AppShowcase() {
    return (
        <section className="py-24 overflow-hidden">
            <div className="container">

                {/* Section 1: Chat & Media */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className="mb-4 border-primary text-primary px-4 py-1">Communication Reimagined</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Chat, Share, and <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Connect deeply.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Experience high-quality voice/video calls and seamless media sharing.
                            ThodiBaat ensures your memories are shared in their original quality,
                            securely and instantly.
                        </p>
                        <ul className="space-y-4">
                            {['End-to-End Encrypted', 'High Quality Media', 'Group Stories'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative flex justify-center"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-10" />
                        <MockChatScreen />
                    </motion.div>
                </div>

                {/* Section 2: Task Management */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        className="order-2 lg:order-1 relative flex justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="absolute inset-0 bg-secondary/20 blur-[100px] rounded-full -z-10" />
                        <MockTaskScreen />
                    </motion.div>

                    <motion.div
                        className="order-1 lg:order-2"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className="mb-4 border-secondary text-secondary px-4 py-1">Productivity</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Manage Tasks <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-orange-600">Within Chat.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Why switch apps? Create shared to-do lists, assign tasks to friends or colleagues,
                            and track progress directly within your conversation threads.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <Card className="p-4 border-l-4 border-l-secondary">
                                <h4 className="font-bold text-lg mb-2">Assign Tasks</h4>
                                <p className="text-sm text-muted-foreground">Delegate responsibilities in group chats instantly.</p>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-primary">
                                <h4 className="font-bold text-lg mb-2">Track Progress</h4>
                                <p className="text-sm text-muted-foreground">Real-time updates on task completion status.</p>
                            </Card>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
