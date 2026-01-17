'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function SignupForm() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('/api/v1/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Signup failed');
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast.success("Account created successfully!");
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
        },
        onError: (error: any) => {
            toast.error(error.message);
        }
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    return (
        <Card className="w-full max-w-sm mx-auto bg-card shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                    Join ThodiBaat today
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...register('name', { required: true })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            {...register('email', { required: true })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password', { required: true })}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? "Creating account..." : "Sign Up"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
                        Login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
