// components/ai-assistant/ai-chat.tsx

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIResponse } from "./ai-response";
import { AIVoiceInput } from "./ai-voice-input";
import { AISuggestions } from "./ai-suggstions";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import {
    Send,
    Mic,
    Sparkles,
    X,
    Minimize2,
    Maximize2,
    MessageSquare,
    Loader2,
    Bot,
    User,
    History,
    Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const spring = {
    type: "spring" as const,
    stiffness: 350,
    damping: 25,
};

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    data?: any;
    chart?: any;
    timestamp: Date;
    isLoading?: boolean;
    suggestions?: string[];
    intent?: string;
}

export function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "👋 Hello! I'm your AI assistant for HOP. I can help you with members, payments, tasks, and more. What would you like to know?",
            timestamp: new Date(),
            suggestions: [
                "How many members do we have?",
                "Show me payment trends for this month",
                "Who hasn't paid this month?",
                "What tasks are overdue?",
            ],
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}`);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { processQuery } = useAIAssistant();

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current;
            setTimeout(() => {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }, 100);
        }
    }, [messages]);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `user_${Date.now()}`,
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        try {
            const result = await processQuery({
                query: currentInput,
                type: "text",
                sessionId,
                context: {
                    previousMessages: messages.slice(-3).map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                },
            });

            const assistantMessage: Message = {
                id: `assistant_${Date.now()}`,
                role: "assistant",
                content: result.message || "I processed your request.",
                data: result.data,
                chart: result.chart,
                timestamp: new Date(),
                suggestions: result.suggestions || result.followUp,
                intent: result.intent,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: `error_${Date.now()}`,
                role: "assistant",
                content: "I'm sorry, I encountered an error. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, processQuery, sessionId]);

    const handleVoiceInput = useCallback(async (transcript: string) => {
        if (!transcript.trim()) return;
        setInput(transcript);
        // Auto-send after voice input
        setTimeout(() => handleSend(), 300);
    }, [handleSend]);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        setInput(suggestion);
        setTimeout(() => handleSend(), 100);
    }, [handleSend]);

    const clearHistory = useCallback(() => {
        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content: "👋 Hello! I'm your AI assistant. How can I help you today?",
                timestamp: new Date(),
                suggestions: [
                    "How many members do we have?",
                    "Show me payment trends",
                    "Who hasn't paid this month?",
                    "What tasks are overdue?",
                ],
            },
        ]);
    }, []);

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                >
                    <Bot className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? "auto" : "600px",
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={spring}
                        className={cn(
                            "fixed z-50 w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl bg-background border shadow-2xl overflow-hidden",
                            isMinimized ? "bottom-6 right-6 h-auto" : "bottom-6 right-6"
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        AI Assistant
                                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                            Beta
                                        </Badge>
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Powered by Gemini AI
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={clearHistory}
                                    title="Clear chat"
                                >
                                    <History className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                >
                                    {isMinimized ? (
                                        <Maximize2 className="h-4 w-4" />
                                    ) : (
                                        <Minimize2 className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={spring}
                                                className={cn(
                                                    "flex gap-3",
                                                    message.role === "user" ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                {message.role === "assistant" && (
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                        <Bot className="h-4 w-4 text-primary" />
                                                    </div>
                                                )}
                                                <div
                                                    className={cn(
                                                        "max-w-[85%] rounded-2xl px-4 py-2.5",
                                                        message.role === "user"
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted"
                                                    )}
                                                >
                                                    {message.isLoading ? (
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span>Thinking...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                                {message.content}
                                                            </p>
                                                            {message.data && (
                                                                <AIResponse
                                                                    data={message.data}
                                                                    chart={message.chart}
                                                                />
                                                            )}
                                                            {message.intent && (
                                                                <Badge variant="outline" className="mt-2 text-[10px]">
                                                                    {message.intent.replace('_', ' ')}
                                                                </Badge>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                {message.role === "user" && (
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                        <User className="h-4 w-4 text-primary" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex items-center gap-2 text-muted-foreground ml-11">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm">AI is analyzing...</span>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                {/* Suggestions */}
                                {messages.length > 0 && messages[messages.length - 1].suggestions && (
                                    <div className="px-4 py-2 border-t">
                                        <AISuggestions
                                            suggestions={messages[messages.length - 1].suggestions!}
                                            onSelect={handleSuggestionClick}
                                        />
                                    </div>
                                )}

                                {/* Input */}
                                <div className="flex items-center gap-2 border-t p-3">
                                    <AIVoiceInput
                                        onResult={handleVoiceInput}
                                        isProcessing={isLoading}
                                    />
                                    <Input
                                        ref={inputRef}
                                        placeholder="Ask me anything..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="flex-1"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-1.5 border-t bg-muted/20">
                                    <small className="text-muted-foreground text-center">
                                        AI responses are generated and may not always be accurate
                                    </small>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}