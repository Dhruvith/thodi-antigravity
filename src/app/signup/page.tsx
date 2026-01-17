import { SignupForm } from '@/components/auth/SignupForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function SignupPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <SignupForm />
            </div>
            <Footer />
        </div>
    );
}
