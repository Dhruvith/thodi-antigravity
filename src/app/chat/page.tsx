import { ChatApp } from '@/components/chat/ChatApp';
import { Navbar } from '@/components/layout/Navbar';

export default function ChatPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <div className="flex-1 container py-6">
                <ChatApp />
            </div>
        </div>
    );
}
