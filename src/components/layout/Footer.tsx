import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-12 md:py-16 lg:py-20">
            <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-4">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
                        <div className="relative h-8 w-8 mr-2">
                            <Image src="/logo.png" alt="ThodiBaat Logo" fill className="object-contain" />
                        </div>
                        <span><span className="text-primary">Thodi</span>Baat</span>
                    </Link>
                    <p className="text-sm text-foreground/60">
                        Secure, human-centric communication platform for everyone.
                        Made with ❤️ in India.
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold">Product</h3>
                    <Link href="/features" className="text-sm text-foreground/60 hover:text-foreground">Features</Link>
                    <Link href="/pricing" className="text-sm text-foreground/60 hover:text-foreground">Pricing</Link>
                    <Link href="/roadmap" className="text-sm text-foreground/60 hover:text-foreground">Roadmap</Link>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold">Company</h3>
                    <Link href="/about" className="text-sm text-foreground/60 hover:text-foreground">About</Link>
                    <Link href="/contact" className="text-sm text-foreground/60 hover:text-foreground">Contact</Link>
                    <Link href="/privacy" className="text-sm text-foreground/60 hover:text-foreground">Privacy</Link>
                    <Link href="/terms" className="text-sm text-foreground/60 hover:text-foreground">Terms</Link>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="font-semibold">Connect</h3>
                    <Link href="#" className="text-sm text-foreground/60 hover:text-foreground">Twitter</Link>
                    <Link href="#" className="text-sm text-foreground/60 hover:text-foreground">LinkedIn</Link>
                    <Link href="#" className="text-sm text-foreground/60 hover:text-foreground">Instagram</Link>
                </div>
            </div>
            <div className="container mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-foreground/60">
                    © {new Date().getFullYear()} ThodiBaat. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
