// components/ai-assistant/ai-chat.tsx

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AIResponse } from "./ai-response";
import { AIVoiceInput } from "./ai-voice-input";
import { AISuggestions } from "./ai-suggstions";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import {
    Send,
    Sparkles,
    X,
    Minimize2,
    Maximize2,
    Loader2,
    Bot,
    User,
    Trash2,
    Zap,
    Gift,
    UserPlus,
    Copy,
    Check,
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

// Meta-AI / Siri style animated ring for the collapsed trigger
function MetaAILogo() {
    return (
        <div className="relative flex items-center justify-center w-8 h-8">
            <motion.div
                animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 opacity-80 blur-[2px]"
            />
            <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-[2px] shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                </div>
            </div>
        </div>
    );
}

// Organic 3D Flower/Spark graphic matching the reference image header
function HeaderGraphic() {
    return (
        <div className="relative w-16 h-16 flex items-center justify-center select-none pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <defs>
                    <linearGradient id="flowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                </defs>
                {/* Flower Petals */}
                <path
                    d="M 50,15 C 60,15 65,30 75,25 C 85,20 90,35 85,45 C 80,55 95,60 90,75 C 85,90 70,85 60,90 C 50,95 40,85 30,90 C 20,95 15,80 10,70 C 5,60 20,50 15,35 C 10,20 25,20 35,25 C 45,30 40,15 50,15 Z"
                    fill="url(#flowerGrad)"
                    opacity="0.9"
                />
                {/* Glossy inner star */}
                <path
                    d="M 50,30 Q 50,50 70,50 Q 50,50 50,70 Q 50,50 30,50 Q 50,50 50,30 Z"
                    fill="#ffffff"
                    opacity="0.9"
                />
            </svg>
        </div>
    );
}

export function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [copied, setCopied] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "👋 Heaven ooo! I'm your AI assistant for HOP. I can help you with members, payments, tasks, and more. What would you like to know?",
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
                    previousMessages: messages.slice(-3).map((m) => ({
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

    const handleVoiceInput = useCallback(
        async (transcript: string) => {
            if (!transcript.trim()) return;
            setInput(transcript);
            setTimeout(() => handleSend(), 300);
        },
        [handleSend]
    );

    const handleSuggestionClick = useCallback(
        (suggestion: string) => {
            setInput(suggestion);
            setTimeout(() => handleSend(), 100);
        },
        [handleSend]
    );

    const clearHistory = useCallback(() => {
        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content:
                    "👋 Heaven ooo! I'm your AI assistant. How can I help you today?",
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

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText("https://www.lovable.dev/felix");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            {/* Floating Animated Button (Meta-AI style) */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-slate-700/60 text-white shadow-2xl hover:border-purple-500/50 transition-colors"
                >
                    <MetaAILogo />
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500" />
                    </span>
                </motion.button>
            )}

            {/* Chat Container Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? "auto" : "620px",
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={spring}
                        className={cn(
                            "fixed z-50 w-[420px] max-w-[calc(100vw-2rem)] rounded-3xl bg-[#FAF8F5] dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col font-sans",
                            isMinimized
                                ? "bottom-6 right-6 h-auto"
                                : "bottom-6 right-6"
                        )}
                    >
                        {/* Top Minimal Toolbar */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-transparent border-b border-slate-200/50 dark:border-slate-800/60">
                            <div className="flex items-center gap-2">
                                <MetaAILogo />
                                <span className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                                    AI Assistant
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                                    onClick={clearHistory}
                                    title="Clear chat history"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-full"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                >
                                    {isMinimized ? (
                                        <Maximize2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <Minimize2 className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Header Banner (Matches Reference Image UI) */}
                                <div className="p-4 mx-4 mt-3 rounded-2xl bg-[#F5F2EC] dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 relative overflow-hidden flex items-center justify-between">
                                    <div>
                                        <span className="inline-block px-2.5 py-0.5 mb-2 rounded-full text-[11px] font-medium bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs border border-slate-200/80 dark:border-slate-600">
                                            Earn 10+ credits
                                        </span>
                                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                                            Refer & Earn
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            for each friend that you invite
                                        </p>
                                    </div>
                                    <HeaderGraphic />
                                </div>

                                {/* Main Scroll Content Area */}
                                <ScrollArea
                                    className="flex-1 px-4 py-3 space-y-4"
                                    ref={scrollRef}
                                >
                                    {/* How it works info list (Ref visual component) */}
                                    <div className="space-y-2.5 py-1 mb-2">
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            How it works:
                                        </p>
                                        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-2.5">
                                                <Zap className="w-4 h-4 text-slate-800 dark:text-slate-200 shrink-0" />
                                                <span>Share your invite link</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <Gift className="w-4 h-4 text-slate-800 dark:text-slate-200 shrink-0" />
                                                <span>
                                                    Your friend gets <strong>10 credits</strong> when they subscribe
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <UserPlus className="w-4 h-4 text-slate-800 dark:text-slate-200 shrink-0" />
                                                <span>
                                                    You receive <strong>10 credits</strong> for each referral
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages Loop */}
                                    <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={spring}
                                                className={cn(
                                                    "flex gap-2.5",
                                                    message.role === "user"
                                                        ? "justify-end"
                                                        : "justify-start"
                                                )}
                                            >
                                                {message.role === "assistant" && (
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                                        <Bot className="h-3.5 w-3.5" />
                                                    </div>
                                                )}
                                                <div
                                                    className={cn(
                                                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs",
                                                        message.role === "user"
                                                            ? "bg-slate-900 text-white dark:bg-purple-600 rounded-tr-xs"
                                                            : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs"
                                                    )}
                                                >
                                                    {message.isLoading ? (
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            <span>Thinking...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="whitespace-pre-wrap break-words">
                                                                {message.content}
                                                            </p>
                                                            {message.data && (
                                                                <AIResponse
                                                                    data={message.data}
                                                                    chart={message.chart}
                                                                />
                                                            )}
                                                            {message.intent && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="mt-2 text-[10px] bg-slate-50 dark:bg-slate-900"
                                                                >
                                                                    {message.intent.replace("_", " ")}
                                                                </Badge>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                {message.role === "user" && (
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        <User className="h-3.5 w-3.5" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex items-center gap-2 text-slate-500 ml-9 text-xs">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                <span>AI is processing...</span>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                {/* Suggestions Component */}
                                {messages.length > 0 &&
                                    messages[messages.length - 1].suggestions && (
                                        <div className="px-4 py-2 border-t border-slate-200/50 dark:border-slate-800">
                                            <AISuggestions
                                                suggestions={
                                                    messages[messages.length - 1].suggestions!
                                                }
                                                onSelect={handleSuggestionClick}
                                            />
                                        </div>
                                    )}

                                {/* Referral Link Box (Reference Design inspired) */}
                                <div className="px-4 py-1.5">
                                    <div className="p-1.5 pl-3 rounded-xl bg-[#F5F2EC] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
                                        <span className="text-slate-600 dark:text-slate-300 truncate mr-2 font-mono text-[11px]">
                                            https://www.lovable.dev/felix
                                        </span>
                                        <Button
                                            size="sm"
                                            onClick={handleCopyLink}
                                            className="h-7 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg shrink-0 font-medium transition-all"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-3 h-3 mr-1" /> Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3 mr-1" /> Copy Link
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Input Controls */}
                                <div className="p-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
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
                                        className="flex-1 h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="h-9 w-9 bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-500 rounded-xl shrink-0"
                                    >
                                        <Send className="h-3.5 w-3.5" />
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