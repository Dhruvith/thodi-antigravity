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

export function LoginForm() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Login failed');
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast.success("Logged in successfully!");
            // Store token in localStorage (or cookie)
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard'; // Force reload to update state
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
                <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                    Login to access your ThodiBaat account
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        {mutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/signup" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
