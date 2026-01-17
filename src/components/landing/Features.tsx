'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Globe, Lock, Smile, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        title: "End-to-End Encryption",
        description: "Your conversations are private and secure. No one else can read them.",
        icon: Lock,
    },
    {
        title: "Seamless Collaboration",
        description: "Share files, documents, and media instantly with your team.",
        icon: Zap,
    },
    {
        title: "Global Connectivity",
        description: "Connect with friends and family across the globe with high quality.",
        icon: Globe,
    },
    {
        title: "Indian at Heart",
        description: "Designed with the Indian user in mind. Simple, efficient, and reliable.",
        icon: Smile,
    },
    {
        title: "Group Chats",
        description: "Create groups for family, friends, or work. Stay connected effortlessly.",
        icon: Users,
    },
    {
        title: "Premium Experience",
        description: "Ad-free, cluttered-free, and designed for a smooth user experience.",
        icon: Shield,
    },
];

import { Users } from 'lucide-react';

export function Features() {
    return (
        <section className="py-20 bg-muted/50">
            <div className="container">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose ThodiBaat?</h2>
                    <p className="text-muted-foreground text-lg">
                        Experience the next generation of communication with features built for modern needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full border-none shadow-md bg-background/60 backdrop-blur hover:bg-background/80 transition-colors">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
