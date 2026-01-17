'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function MadeInIndiaBanner() {
    return (
        <section className="w-full bg-[#FFF5E6] dark:bg-zinc-900 border-y border-orange-100 py-12 overflow-hidden relative">
            <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center md:justify-start gap-3"
                    >
                        <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                            Proudly Made in
                        </span>
                        <span className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-[#FF9933] via-[#ffaa55] to-[#138808] bg-clip-text text-transparent drop-shadow-sm">
                            Bharat
                        </span>
                        <Image
                            src="https://flagcdn.com/w80/in.png"
                            alt="India Flag"
                            width={40}
                            height={30}
                            className="rounded-sm shadow-md"
                        />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-[#2D2D2D] dark:text-white tracking-tighter"
                    >
                        THODI<span className="text-[#3b82f6]">BAAT</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                    >
                        Karo Apno Se Baat, <span className="text-[#9333EA]">Aab ThodiBaat Pe</span>
                    </motion.p>
                </div>

                {/* Visuals/Decoration */}
                <div className="flex-1 relative flex justify-center items-center">
                    {/* Abstract circular representation or collage placeholders */}
                    <div className="relative w-72 h-72 md:w-96 md:h-96">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9933]/20 to-[#138808]/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative z-10 grid grid-cols-2 gap-2 p-4 rotate-3 hover:rotate-0 transition-all duration-500">
                            <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-xl transform translate-y-4">
                                <div className="h-full w-full bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                                    <span className="text-4xl">🧘</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-xl transform -translate-y-4">
                                <div className="h-full w-full bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                                    <span className="text-4xl">🚜</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-xl transform translate-y-2">
                                <div className="h-full w-full bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                                    <span className="text-4xl">🚀</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-xl transform -translate-y-6">
                                <div className="h-full w-full bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                                    <span className="text-4xl">🕉️</span>
                                </div>
                            </div>
                        </div>

                        {/* Stamp */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-10 -right-10 md:-right-0 bg-white/90 dark:bg-black/90 p-4 rounded-full shadow-lg border-2 border-dashed border-[#FF9933] flex items-center justify-center w-32 h-32"
                        >
                            <div className="text-center">
                                <p className="text-[10px] font-bold tracking-widest text-[#FF9933]">MADE IN</p>
                                <p className="text-xl font-black text-[#138808]">INDIA</p>
                                <p className="text-[8px] text-gray-500">100% SECURE</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Decoration: Monuments Outline */}
            <div className="absolute bottom-0 left-0 w-full h-16 opacity-30 pointer-events-none flex items-end justify-between px-10 text-[#FF9933]">
                {/* Simplified SVGs or shapes representing monuments */}
                <div className="w-10 h-20 bg-current opacity-20 rounded-t-lg mx-1"></div>
                <div className="w-16 h-12 bg-current opacity-30 rounded-t-full mx-1"></div>
                <div className="w-8 h-24 bg-current opacity-40 rounded-t-xl mx-1"></div>
                <div className="w-20 h-16 bg-current opacity-20 rounded-t-full mx-1"></div>
                <div className="flex-1"></div>
                <div className="w-14 h-18 bg-current opacity-30 rounded-t-lg mx-1"></div>
                <div className="w-12 h-24 bg-current opacity-20 rounded-t-md mx-1"></div>
            </div>
        </section>
    );
}
