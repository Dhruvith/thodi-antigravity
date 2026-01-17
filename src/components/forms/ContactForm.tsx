'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

export function ContactForm() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            // In a real app, this would be an API call
            // const res = await fetch('/api/v1/contact', ...);
            // For now we simulate success or implement the API
            return new Promise((resolve) => setTimeout(resolve, 1000));
        },
        onSuccess: () => {
            toast.success("Message sent successfully!");
            reset();
        },
        onError: () => {
            toast.error("Failed to send message.");
        }
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    return (
        <Card className="w-full max-w-lg mx-auto p-6 bg-card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" {...register('name', { required: true })} />
                    {errors.name && <span className="text-red-500 text-sm">Required</span>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your email" {...register('email', { required: true })} />
                    {errors.email && <span className="text-red-500 text-sm">Required</span>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                        id="message"
                        placeholder="How can we help?"
                        className="min-h-[120px]"
                        {...register('message', { required: true })}
                    />
                    {errors.message && <span className="text-red-500 text-sm">Required</span>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                    {mutation.isPending ? "Sending..." : "Send Message"}
                </Button>
            </form>
        </Card>
    );
}
