import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function PricingPage() {
    const plans = [
        {
            name: "Free",
            price: "₹0",
            description: "For personal use",
            features: ["Unlimited Messages", "1GB Storage", "Group Chats", "Basic Support"],
            cta: "Get Started",
        },
        {
            name: "Pro",
            price: "₹99",
            description: "For power users",
            features: ["Everything in Free", "10GB Storage", "HD Video Calls", "Priority Support", "No Ads"],
            cta: "Upgrade to Pro",
        },
        {
            name: "Business",
            price: "₹499",
            description: "For teams",
            features: ["Everything in Pro", "Unlimited Storage", "Admin Controls", "24/7 Support", "Custom Branding"],
            cta: "Contact Sales",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 container py-16">
                <h1 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h1>
                <p className="text-muted-foreground text-center mb-12">Choose the plan that's right for you</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card key={plan.name} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="text-3xl font-bold mb-6">{plan.price}<span className="text-base font-normal text-muted-foreground">/month</span></div>
                                <ul className="space-y-2">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center">
                                            <Check className="h-4 w-4 text-primary mr-2" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">{plan.cta}</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
