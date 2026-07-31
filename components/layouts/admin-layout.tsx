// components/layouts/admin-layout.tsx (add the AI chat)

import { AIChat } from "@/components/ai-assistant/ai-chat";

export function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar, header, etc. */}
            <main className="flex-1">
                {children}
            </main>
            {/* AI Chat Floating Button */}
            <AIChat />
        </div>
    );
}