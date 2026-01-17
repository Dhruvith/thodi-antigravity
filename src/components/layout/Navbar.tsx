'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Navbar() {
    const pathname = usePathname();
    const { setTheme, theme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    const routes = [
        { href: '/', label: 'Home' },
        { href: '/chat', label: 'Chat' },
        { href: '/vyapar', label: 'Vyapar' },
        { href: '/features', label: 'Features' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
                        <span className="text-primary">Thodi</span>Baat
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    pathname === route.href ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/signup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className="mr-2"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col space-y-4 mt-8">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium"
                                    >
                                        {route.label}
                                    </Link>
                                ))}
                                <div className="flex flex-col gap-2 mt-4">
                                    <Link href="/login" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full">Login</Button>
                                    </Link>
                                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full">Get Started</Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
