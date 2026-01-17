"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function BusinessRegistrationForm() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Please login to register a business");

            // Transform data to match API expectation structure
            const payload = {
                name: data.businessName,
                category: data.category,
                description: data.description,
                contact: {
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    website: data.website
                },
                logo: "" // Handle file upload in a real scenario
            };

            const res = await fetch("/api/v1/businesses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to submit");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Business submitted for approval!");
            router.push("/vyapar");
        },
        onError: (err: any) => {
            toast.error(err.message);
            if (err.message.includes("login")) {
                router.push("/login");
            }
        }
    });

    const onSubmit = (data: any) => mutation.mutate(data);

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl border-t-4 border-t-primary">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Register with ThodiBaat Vyapar</CardTitle>
                <CardDescription className="text-center">Join India's growing network of trusted businesses.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Business Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input id="businessName" placeholder="e.g. Sharma Sweets" {...register("businessName", { required: true })} />
                                {errors.businessName && <span className="text-red-500 text-xs">Required</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" placeholder="e.g. Retail, Food, Services" {...register("category", { required: true })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Max 200 words)</Label>
                            <Textarea id="description" placeholder="Tell us about your business..." className="h-24" {...register("description", { required: true })} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-t pt-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Business Email</Label>
                                <Input id="email" type="email" placeholder="contact@business.com" {...register("email", { required: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" placeholder="+91 98765 43210" {...register("phone", { required: true })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" placeholder="Shop No, Street, City, State" {...register("address", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website (Optional)</Label>
                            <Input id="website" placeholder="https://..." {...register("website")} />
                        </div>
                    </div>

                    <Button type="submit" className="w-full text-lg h-12" disabled={mutation.isPending}>
                        {mutation.isPending ? "Submitting..." : "Submit Listing"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
