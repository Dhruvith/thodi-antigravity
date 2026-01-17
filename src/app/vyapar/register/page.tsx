import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BusinessRegistrationForm } from "@/components/vyapar/BusinessRegistrationForm";

export default function RegisterVyaparPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 container py-12">
                <div className="max-w-2xl mx-auto mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Grow Your Business with Vyapar</h1>
                    <p className="text-muted-foreground">List your business for free and reach millions of ThodiBaat users.</p>
                </div>
                <BusinessRegistrationForm />
            </div>
            <Footer />
        </div>
    );
}
