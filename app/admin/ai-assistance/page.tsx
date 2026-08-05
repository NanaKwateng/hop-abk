// app/admin/ai-assistant/page.tsx
// Server Component - Handles metadata and layout

import ClientWrapper from "./client-wrapper";

export const metadata = {
    title: "AI Assistant & User Guide",
    description: "Get help with your church management tasks and learn how to use the HOP system.",
};

export default function AIAssistantPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">AI Assistant & User Guide</h1>
                <p className="text-muted-foreground mt-2">
                    Learn how to use HOP and get AI-powered assistance
                </p>
            </div>

            {/* Client Component with all interactive features */}
            <ClientWrapper />
        </div>
    );
}