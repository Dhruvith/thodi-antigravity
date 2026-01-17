"use client";

import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BusinessCard } from "@/components/vyapar/BusinessCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const fetchBusinesses = async (search: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);

    const res = await fetch(`/api/v1/businesses?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch businesses");
    return res.json();
};

export default function VyaparPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data, isLoading } = useQuery({
        queryKey: ["businesses", searchTerm],
        queryFn: () => fetchBusinesses(searchTerm),
    });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-b from-secondary/20 to-background flex flex-col items-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                        <span className="text-primary">ThodiBaat</span> <span className="text-secondary">Vyapar</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-xl text-muted-foreground mb-8">
                        Discover local businesses, services, and craftsmen. Connected securely.
                    </p>

                    <div className="flex gap-4 justify-center mb-12">
                        <Link href="/vyapar/register">
                            <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">List Your Business</Button>
                        </Link>
                        <Link href="#listings">
                            <Button variant="outline" size="lg" className="rounded-full">Browse Listings</Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Listings Section */}
            <section id="listings" className="container py-12 flex-1">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-2xl font-bold">Featured Businesses</h2>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search businesses..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.businesses.length > 0 ? (
                            data.businesses.map((business: any) => (
                                <BusinessCard key={business.id} business={business} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-muted-foreground">
                                <p>No listings found. Be the first to list your business!</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}
