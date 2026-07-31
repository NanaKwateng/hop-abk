// app/admin/ai-assistant/page.tsx

import { AIChat } from "@/components/ai-assistant/ai-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
    title: "AI Assistant",
    description: "Get help with your church management tasks using AI",
};

export default function AIAssistantPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
                <p className="text-muted-foreground">
                    Ask questions about members, payments, tasks, and more.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Quick Actions</CardTitle>
                        <CardDescription>Try these sample questions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <button
                            onClick={() => {
                                // This will trigger the AI chat
                                document.dispatchEvent(new CustomEvent('ai-query', {
                                    detail: { query: "How many members do we have?" }
                                }));
                            }}
                            className="w-full text-left text-sm p-2 rounded-md hover:bg-muted transition-colors"
                        >
                            📊 How many members do we have?
                        </button>
                        <button
                            onClick={() => {
                                document.dispatchEvent(new CustomEvent('ai-query', {
                                    detail: { query: "Show me payment trends for this month" }
                                }));
                            }}
                            className="w-full text-left text-sm p-2 rounded-md hover:bg-muted transition-colors"
                        >
                            💰 Show me payment trends for this month
                        </button>
                        <button
                            onClick={() => {
                                document.dispatchEvent(new CustomEvent('ai-query', {
                                    detail: { query: "Who hasn't paid this month?" }
                                }));
                            }}
                            className="w-full text-left text-sm p-2 rounded-md hover:bg-muted transition-colors"
                        >
                            🔍 Who hasn't paid this month?
                        </button>
                        <button
                            onClick={() => {
                                document.dispatchEvent(new CustomEvent('ai-query', {
                                    detail: { query: "What tasks are overdue?" }
                                }));
                            }}
                            className="w-full text-left text-sm p-2 rounded-md hover:bg-muted transition-colors"
                        >
                            ✅ What tasks are overdue?
                        </button>
                    </CardContent>
                </Card>

                {/* Main Chat */}
                <div className="md:col-span-2">
                    <Card className="h-[600px]">
                        <CardHeader>
                            <CardTitle>Chat with AI Assistant</CardTitle>
                            <CardDescription>
                                Ask anything about your church data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-80px)]">
                            <AIChat />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}