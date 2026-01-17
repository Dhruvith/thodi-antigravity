import { LoginForm } from '@/components/auth/LoginForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <LoginForm />
            </div>
            <Footer />
        </div>
    );
}
