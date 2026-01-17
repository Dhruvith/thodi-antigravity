"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function WaitlistForm() {
    const [isOpen, setIsOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/v1/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to join");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Successfully joined the waitlist!");
            reset();
            setIsOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const onSubmit = (data: any) => mutation.mutate(data);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="lg" className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 shadow-lg hover:shadow-accent/20 transition-all">
                    Join Waitlist <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Join ThodiBaat Waitlist</DialogTitle>
                    <DialogDescription>
                        Be the first to experience the future of secure communication and business networking.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="Email address"
                            type="email"
                            {...register("email", { required: true })}
                        />
                        {errors.email && <span className="text-red-500 text-xs">Required</span>}
                    </div>
                    <div className="space-y-2">
                        <Input
                            placeholder="Business Name (Optional)"
                            {...register("businessName")}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Join Now"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
