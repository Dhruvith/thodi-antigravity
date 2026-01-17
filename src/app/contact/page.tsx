import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/forms/ContactForm';

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 container py-16 flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                <p className="text-muted-foreground mb-8 text-center max-w-xl">
                    We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
                </p>
                <ContactForm />
            </div>
            <Footer />
        </div>
    );
}
