'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, MessageCircle, Users } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative overflow-hidden py-20 md:py-32 bg-background">
            <div className="container relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-8"
                >
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                    ThodiBaat v1.0 is Live
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                >
                    Connect Deeply with <br className="hidden md:block" />
                    <span className="text-primary">ThodiBaat</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 mb-8"
                >
                    A secure, Indian communication platform designed for seamless collaboration.
                    Trustworthy, intuitive, and built for you.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link href="/signup">
                        <Button size="lg" className="h-12 px-8 text-lg rounded-full">
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/about">
                        <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full">
                            Learn More
                        </Button>
                    </Link>
                </motion.div>

                {/* Floating Icons Animation (Background) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
                    {/* Add subtle floating blobs or icons here if needed */}
                </div>
            </div>

            {/* Background Gradient Blob */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 dark:opacity-20" />
        </section>
    );
}
