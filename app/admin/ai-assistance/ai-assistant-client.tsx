// app/admin/ai-assistant/ai-assistant-client.tsx
"use client";

import { AIChat } from "@/components/ai-assistant/ai-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIAssistantClient() {
    // Utility to centrally fire custom chat trigger events safely
    const handleQuickQuery = (query: string) => {
        if (typeof window !== "undefined") {
            const event = new CustomEvent("ai-query", { detail: { query } });
            document.dispatchEvent(event);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
                <p className="text-muted-foreground">
                    Ask questions about members, payments, tasks, and more.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* ── Quick Actions Card (With Top-Right Geometric SVG Shards) ── */}
                <Card className="relative overflow-hidden transition-all duration-300 shadow-md border bg-card text-card-foreground">
                    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-transparent via-background/30 to-background dark:via-background/50 dark:to-background z-10" />
                        <svg
                            xmlns="http://w3.org"
                            viewBox="0 0 400 400"
                            className="absolute -top-10 -right-10 w-[70%] h-auto opacity-[0.15] dark:opacity-[0.1] rotate-12 transform-gpu"
                        >
                            <polygon points="200,0 275,25 240,75" fill="#00b4d8" />
                            <polygon points="275,25 340,10 310,80" fill="#0077b6" />
                            <polygon points="240,75 310,80 260,140" fill="#7209b7" />
                            <polygon points="340,10 400,0 390,60" fill="#d90429" />
                            <polygon points="200,0 240,75 175,55" fill="#ffb703" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <CardHeader>
                            <CardTitle className="text-sm">Quick Actions</CardTitle>
                            <CardDescription>Try these sample questions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <button
                                onClick={() => handleQuickQuery("How many members do we have?")}
                                className="w-full text-left text-sm p-2 rounded-md hover:bg-muted/80 bg-background/40 backdrop-blur-xs transition-colors border border-transparent hover:border-border"
                            >
                                How many members do we have?
                            </button>
                            <button
                                onClick={() => handleQuickQuery("Show me payment trends for this month")}
                                className="w-full text-left text-sm p-2 rounded-md hover:bg-muted/80 bg-background/40 backdrop-blur-xs transition-colors border border-transparent hover:border-border"
                            >
                                Show me payment trends for this month
                            </button>
                            <button
                                onClick={() => handleQuickQuery("Who hasn't paid this month?")}
                                className="w-full text-left text-sm p-2 rounded-md hover:bg-muted/80 bg-background/40 backdrop-blur-xs transition-colors border border-transparent hover:border-border"
                            >
                                Who hasn't paid this month?
                            </button>
                            <button
                                onClick={() => handleQuickQuery("What tasks are overdue?")}
                                className="w-full text-left text-sm p-2 rounded-md hover:bg-muted/80 bg-background/40 backdrop-blur-xs transition-colors border border-transparent hover:border-border"
                            >
                                What tasks are overdue?
                            </button>
                        </CardContent>
                    </div>
                </Card>

                {/* ── Main Chat Interface Container (With Lower-Left SVG Balanced Accents) ── */}
                <div className="md:col-span-2">
                    <Card className="relative h-[600px] overflow-hidden shadow-md border bg-card text-card-foreground">
                        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-transparent via-background/40 to-background dark:via-background/60 dark:to-background z-10" />
                            <svg
                                xmlns="http://w3.org"
                                viewBox="0 0 600 400"
                                className="absolute -bottom-16 -left-16 w-[50%] h-auto opacity-[0.14] dark:opacity-[0.1] -rotate-6 transform-gpu"
                            >
                                <polygon points="0,400 90,310 130,390" fill="#fb8500" />
                                <polygon points="90,310 160,280 130,390" fill="#ffb703" />
                                <polygon points="90,310 110,240 160,280" fill="#f72585" />
                                <polygon points="110,240 200,260 160,280" fill="#06d6a0" />
                            </svg>
                        </div>

                        <div className="relative h-full flex flex-col z-10">
                            <CardHeader className="flex-shrink-0">
                                <CardTitle>Chat with AI Assistant</CardTitle>
                                <CardDescription>
                                    Ask anything about your church data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 h-[calc(100%-90px)] overflow-hidden">
                                <AIChat />
                            </CardContent>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
