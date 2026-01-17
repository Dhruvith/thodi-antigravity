import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 container py-16">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h1 className="text-4xl font-bold">About ThodiBaat</h1>
                    <p className="text-xl text-muted-foreground">
                        ThodiBaat is a secure, Indian communication platform designed to bring people together.
                    </p>
                    <div className="prose dark:prose-invert">
                        <p>
                            Born from the need for a privacy-focused, locally relevant communication tool, ThodiBaat aims to empower users with seamless connectivity.
                        </p>
                        <h3>Our Mission</h3>
                        <p>
                            To create a digital space where conversations flow freely, securely, and authentically.
                        </p>
                        <h3>Our Vision</h3>
                        <p>
                            To be the leading communication platform that respects user privacy while offering world-class features.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
