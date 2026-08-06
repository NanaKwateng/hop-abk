"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
} from "@/components/ui/conversation";
import { Message, MessageContent } from "@/components/ui/message";
import { Orb } from "@/components/ui/orb";
import { Response } from "@/components/ui/response";
import { AIResponse } from "./ai-response";
import { AIVoiceInput } from "./ai-voice-input";
import { AISuggestions } from "./ai-suggstions";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import { PiUserLight } from "react-icons/pi";
import { X, Minimize2, Maximize2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GrSend } from "react-icons/gr";

const spring = { type: "spring" as const, stiffness: 350, damping: 25 };

type OrbState = "idle" | "thinking" | "talking" | null;

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    data?: any;
    chart?: any;
    timestamp: Date;
    suggestions?: string[];
    intent?: string;
    isStreaming?: boolean;
}

// Reveals real text word-by-word so the reply feels live, without
// pretending the underlying data (already fetched from Supabase) is fake.
function useWordReveal(fullText: string, active: boolean, onDone: () => void) {
    const [revealed, setRevealed] = useState("");

    useEffect(() => {
        if (!active) return;
        const words = fullText.split(" ");
        let i = 0;
        setRevealed("");
        const interval = setInterval(() => {
            i++;
            setRevealed(words.slice(0, i).join(" "));
            if (i >= words.length) {
                clearInterval(interval);
                onDone();
            }
        }, 35);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullText, active]);

    return revealed;
}

function StreamingBubble({ message, onDone }: { message: Message; onDone: () => void }) {
    const revealed = useWordReveal(message.content, !!message.isStreaming, onDone);
    const text = message.isStreaming ? revealed : message.content;

    return (
        <>
            <Response>{text || "\u200B"}</Response>
            {!message.isStreaming && message.data && (
                <AIResponse data={message.data} chart={message.chart} />
            )}
            {!message.isStreaming && message.intent && (
                <Badge variant="outline" className="mt-2 text-[10px] bg-slate-50/50 dark:bg-slate-900/50">
                    {message.intent.replace("_", " ")}
                </Badge>
            )}
        </>
    );
}

export function AIChat() {
    const [isOpen, setIsOpen] = useState(false);

    const [isMinimized, setIsMinimized] = useState(false);
    const [orbState, setOrbState] = useState<OrbState>("idle");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "👋 Heaven ooo! I'm your AI assistant for HOP. I can help you with members, payments, tasks, and more. What would you like to know?",
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

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { processQuery } = useAIAssistant();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: `user_${Date.now()}`, role: "user", content: input, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);
        setOrbState("thinking");

        try {
            const result = await processQuery({
                query: currentInput,
                type: "text",
                sessionId,
                context: {
                    previousMessages: messages.slice(-3).map((m) => ({ role: m.role, content: m.content })),
                },
            });

            const assistantId = `assistant_${Date.now()}`;
            setOrbState("talking");
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantId,
                    role: "assistant",
                    content: result.message || "I processed your request.",
                    data: result.data,
                    chart: result.chart,
                    timestamp: new Date(),
                    suggestions: result.suggestions || result.followUp,
                    intent: result.intent,
                    isStreaming: true,

                },
            ]);
        } catch {
            setOrbState("talking");
            setMessages((prev) => [
                ...prev,
                {
                    id: `error_${Date.now()}`,
                    role: "assistant",
                    content: "I'm sorry, I encountered an error. Please try again.",
                    timestamp: new Date(),
                    isStreaming: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, processQuery, sessionId]);

    const handleStreamDone = useCallback((id: string) => {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m)));
        setOrbState(null);
    }, []);

    const handleVoiceInput = useCallback(
        async (transcript: string) => {
            if (!transcript.trim()) return;
            setInput(transcript);
            setTimeout(() => handleSend(), 300);
        },
        [handleSend]
    );

    const handleSuggestionClick = useCallback((suggestion: string) => {
        setInput(suggestion);
        setTimeout(() => handleSend(), 100);
    }, [handleSend]);

    const clearHistory = useCallback(() => {
        setOrbState("idle");
        setMessages([{
            id: "welcome",
            role: "assistant",
            content: "👋 Heaven ooo! I'm your AI assistant. How can I help you today?",
            timestamp: new Date(),
            suggestions: ["How many members do we have?", "Show me payment trends", "Who hasn't paid this month?", "What tasks are overdue?"],
        }]);
    }, []);

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-background"
                >
                    <Orb className="h-full w-full" agentState={null} />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? "auto" : "620px" }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={spring}
                        className={cn(
                            "fixed z-50 w-[420px] max-w-[calc(100vw-2rem)] rounded-3xl bg-background/90 backdrop-blur-md text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col font-sans",
                            "bottom-6 right-6"
                        )}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/60 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-border">
                                    <Orb className="h-full w-full" agentState={null} />
                                </div>
                                <span className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-200">
                                    AI Assistant
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-500 rounded-full" onClick={clearHistory} title="Clear chat history">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setIsMinimized(!isMinimized)}>
                                    {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setIsOpen(false)}>
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                <div className="flex-1 min-h-0">
                                    <Conversation>
                                        <ConversationContent>
                                            {messages.length === 0 ? (
                                                <ConversationEmptyState
                                                    icon={<Orb className="size-12" agentState={null} />}
                                                    title="Ready to explore?"
                                                    description="Ask about members, payments, tasks, or trends"
                                                />
                                            ) : (
                                                messages.map((message) => (
                                                    <Message from={message.role} key={message.id}>
                                                        <MessageContent>
                                                            {message.role === "assistant" ? (
                                                                <StreamingBubble
                                                                    message={message}
                                                                    onDone={() => handleStreamDone(message.id)}
                                                                />
                                                            ) : (
                                                                <Response>{message.content}</Response>
                                                            )}
                                                        </MessageContent>
                                                        {message.role === "assistant" && (
                                                            <div className="ring-border size-7 overflow-hidden rounded-full ring-1 shrink-0">
                                                                <Orb className="h-full w-full" agentState={message.isStreaming ? "talking" : null} />
                                                            </div>
                                                        )}
                                                        {message.role === "user" && (
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                                                                <PiUserLight className="h-3.5 w-3.5" />
                                                            </div>
                                                        )}
                                                    </Message>
                                                ))
                                            )}
                                            {isLoading && (
                                                <Message from="assistant">
                                                    <MessageContent>
                                                        <Response>{"\u200B"}</Response>
                                                    </MessageContent>
                                                    <div className="ring-border size-7 overflow-hidden rounded-full ring-1 shrink-0">
                                                        <Orb className="h-full w-full" agentState="thinking" />
                                                    </div>
                                                </Message>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </ConversationContent>
                                        <ConversationScrollButton />
                                    </Conversation>
                                </div>

                                {messages.length > 0 && messages[messages.length - 1].suggestions && !isLoading && (
                                    <div className="px-4 py-2 border-t border-slate-200/50 dark:border-slate-800/50 shrink-0">
                                        <AISuggestions
                                            suggestions={messages[messages.length - 1].suggestions!}
                                            onSelect={handleSuggestionClick}
                                        />
                                    </div>
                                )}

                                <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2 shrink-0">
                                    <AIVoiceInput onResult={handleVoiceInput} isProcessing={isLoading} />
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
                                        className="flex-1 h-9 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="h-9 w-9 rounded-xl shrink-0"
                                    >
                                        <GrSend className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}