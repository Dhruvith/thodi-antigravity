"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { MessageCircle, Store, ShieldCheck, Zap, Users, Globe, ArrowRight, LayoutDashboard, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
    {
        icon: MessageCircle,
        title: "Real-time Messaging",
        description: "Experience lag-free, secure conversations with friends, family, and businesses. Our optimized socket connection ensures you never miss a beat.",
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        icon: Store,
        title: "Vyapar Business Hub",
        description: "List your local business or discover services nearby. From plumbers to home chefs, find trusted professionals in your community.",
        color: "text-orange-500",
        bg: "bg-orange-500/10"
    },
    {
        icon: ShieldCheck,
        title: "Enterprise-Grade Security",
        description: "Your privacy is our priority. With robust encryption and strictly enforced access controls, your data stays yours.",
        color: "text-green-500",
        bg: "bg-green-500/10"
    },
    {
        icon: LayoutDashboard,
        title: "Smart Dashboard",
        description: "Track your interactions, manage your business listings, and view analytics all from a centralized, intuitive dashboard.",
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    {
        icon: Search,
        title: "Intelligent Discovery",
        description: "Find businesses and services instantly with our location-aware search engine optimized for local Indian contexts.",
        color: "text-pink-500",
        bg: "bg-pink-500/10"
    },
    {
        icon: Globe,
        title: "Made for India",
        description: "Built with the diversity of India in mind. A platform that bridges the gap between digital convenience and local trust.",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
                    <div className="container px-4 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                                Everything you need to <br className="hidden md:block" />
                                <span className="text-primary">Connect & Grow</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10">
                                ThodiBaat isn't just a chat app; it's a complete ecosystem for social connection and local commerce.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href="/signup">
                                    <Button size="lg" className="rounded-full h-12 px-8 text-base">
                                        Get Started
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="outline" size="lg" className="rounded-full h-12 px-8 text-base">
                                        Contact Sales
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-muted/50">
                    <div className="container px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group p-8 rounded-2xl bg-background border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Integration Section */}
                <section className="py-24">
                    <div className="container px-4">
                        <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-3xl md:text-5xl font-bold">
                                    Seamless integration with your daily life
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    Whether you're a student keeping up with friends, or a shop owner managing customer queries, ThodiBaat adapts to your needs effortlessly.
                                </p>
                                <ul className="space-y-4">
                                    {['Instant Notifications', 'Offline Support', 'Media Sharing', 'Location Services'].map((item) => (
                                        <li key={item} className="flex items-center gap-3 font-medium">
                                            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
                                <div className="relative bg-card border shadow-2xl rounded-2xl p-6 md:p-10 max-w-lg mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Store className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Sharma General Store</h4>
                                            <p className="text-sm text-green-600">Online • Typically replies in 5m</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-6">
                                        <div className="bg-muted p-3 rounded-lg rounded-tl-none w-3/4">
                                            <p className="text-sm">Hi! Do you have the new batch of organic pulses?</p>
                                        </div>
                                        <div className="bg-primary/10 p-3 rounded-lg rounded-tr-none w-3/4 ml-auto">
                                            <p className="text-sm text-foreground">Yes, just arrived today morning! Shall I keep a packet aside for you?</p>
                                        </div>
                                    </div>
                                    <Button className="w-full">Start Chat</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-primary/5">
                    <div className="container px-4 text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6">Ready to experience the future?</h2>
                        <p className="text-lg text-muted-foreground mb-10">
                            Join thousands of users who are already building stronger communities with ThodiBaat.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/signup">
                                <Button size="lg" className="h-12 px-8 text-base">
                                    Create Free Account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
