// components/ai-assistant/ai-chat.tsx

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, MotionProps } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AIResponse } from "./ai-response";
import { AIVoiceInput } from "./ai-voice-input";
import { AISuggestions } from "./ai-suggstions";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import { PiUserLight } from "react-icons/pi";
import { TfiInfinite } from "react-icons/tfi";
import {
    Sparkles,
    X,
    Minimize2,
    Maximize2,
    Loader2,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GrSend } from "react-icons/gr";

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

type AnimatedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    MotionProps & {
        children?: React.ReactNode;
        as?: any;
    };

/**
 * AnimatedButton (Integrated Trigger Button)
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    children,
    className = "",
    as = "button",
    ...rest
}) => {
    const Component = (motion as any)[as] || motion.button;

    return (
        <Component
            {...rest}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.5,
            }}
            className={cn(
                "group inline-flex items-center justify-center rounded-full relative overflow-hidden bg-transparent dark:bg-transparent backdrop-blur-md border border-neutral-200 dark:border-neutral-200",
                "text-neutral-900 dark:text-neutral-100 font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                "[--shine:rgba(0,0,0,.66)] dark:[--shine:rgba(255,255,255,.66)]",
                className
            )}
        >
            {/* Content with shine mask */}
            <motion.span
                className="tracking-wide font-light flex items-center justify-center h-full w-full relative z-10"
                style={{
                    WebkitMaskImage:
                        "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
                    maskImage:
                        "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
                }}
                initial={{ ["--mask-x" as any]: "100%" } as any}
                animate={{ ["--mask-x" as any]: "-100%" } as any}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                    repeatDelay: 1,
                }}
            >
                {children}
            </motion.span>

            {/* Border shine effect */}
            <motion.span
                className="block absolute inset-0 rounded-full p-px pointer-events-none"
                style={{
                    background:
                        "linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMask:
                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                }}
                initial={{ backgroundPosition: "100% 0", opacity: 0 }}
                animate={{ backgroundPosition: ["100% 0", "0% 0"], opacity: [0, 1, 0] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1,
                }}
            />
        </Component>
    );
};

// Meta-AI animated orb icon
function MetaAITriggerLogo() {
    return (
        <div className="relative flex items-center justify-center w-8 h-8">
            <motion.div
                animate={{
                    rotate: 360,
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute inset-0 rounded-full bg-transparent blur-[2px]"
            />
            <div className="relative w-7 h-7 rounded-full bg-transparent p-[2px] shadow-sm">
                <div className="w-full h-full bg-transparent rounded-full flex items-center justify-center">
                    <TfiInfinite className="w-3.5 h-3.5 text-pink-300" />
                </div>
            </div>
        </div>
    );
}

// Wide Meta-AI Hero Animated Graphic for the chat header
function MetaAIHeroGraphic() {
    return (
        <div className="relative w-full h-24 flex items-center justify-center overflow-hidden my-2 select-none pointer-events-none">
            <motion.div
                animate={{
                    scale: [1, 1.08, 1],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="relative flex items-center justify-center w-20 h-20"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 opacity-70 blur-md"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 opacity-50 blur-sm"
                />
                <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-xl">
                    <defs>
                        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" fill="url(#heroGrad)" />
                    <path
                        d="M 50,20 Q 55,50 80,50 Q 55,50 50,80 Q 45,50 20,50 Q 45,50 50,20 Z"
                        fill="#ffffff"
                        opacity="0.85"
                    />
                </svg>
            </motion.div>
        </div>
    );
}

export function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
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

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { processQuery } = useAIAssistant();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

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

    return (
        <>
            {/* Animated Floating Trigger Button */}
            {!isOpen && (
                <AnimatedButton
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 h-14 w-14 p-0 shadow-2xl"
                >
                    <MetaAITriggerLogo />
                </AnimatedButton>
            )}

            {/* Main Floating Chat Window with Frosted Glass UI */}
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
                            "fixed z-50 w-[420px] max-w-[calc(100vw-2rem)] rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col font-sans",
                            isMinimized ? "bottom-6 right-6 h-auto" : "bottom-6 right-6"
                        )}
                    >
                        {/* Header Toolbar */}
                        <div className="flex items-center justify-between px-4 py-3 bg-transparent border-b border-slate-200/50 dark:border-slate-800/60 shrink-0">
                            <div className="flex items-center gap-2">
                                <MetaAITriggerLogo />
                                <span className="text-xs font-semibold tracking-wide text-slate-800 dark:text-slate-200">
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
                                {/* Scrollable Message List */}
                                <ScrollArea className="flex-1 min-h-0 w-full px-4">
                                    <div className="py-4">
                                        <MetaAIHeroGraphic />
                                        <h3 className="text-center text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                            Ready to Explore?
                                        </h3>

                                        <div className="space-y-3.5">
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
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 mt-0.5">
                                                            <TfiInfinite className="h-3.5 w-3.5" />
                                                        </div>
                                                    )}
                                                    <div
                                                        className={cn(
                                                            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs backdrop-blur-sm",
                                                            message.role === "user"
                                                                ? "bg-slate-900/90 text-white dark:bg-purple-600/90 rounded-tr-xs"
                                                                : "bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs"
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
                                                                        className="mt-2 text-[10px] bg-slate-50/50 dark:bg-slate-900/50"
                                                                    >
                                                                        {message.intent.replace("_", " ")}
                                                                    </Badge>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                    {message.role === "user" && (
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 mt-0.5">
                                                            <PiUserLight className="h-3.5 w-3.5" />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}

                                            {isLoading && (
                                                <div className="flex items-center gap-2 text-slate-500 ml-9 text-xs">
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    <span>Generating response...</span>
                                                </div>
                                            )}

                                            <div ref={messagesEndRef} />
                                        </div>
                                    </div>
                                </ScrollArea>

                                {/* Suggestions Section */}
                                {messages.length > 0 &&
                                    messages[messages.length - 1].suggestions && (
                                        <div className="px-4 py-2 border-t border-slate-200/50 dark:border-slate-800/50 shrink-0">
                                            <AISuggestions
                                                suggestions={
                                                    messages[messages.length - 1].suggestions!
                                                }
                                                onSelect={handleSuggestionClick}
                                            />
                                        </div>
                                    )}

                                {/* Bottom Input Area */}
                                <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2 bg-transparent shrink-0">
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
                                        className="flex-1 h-9 text-xs bg-white/60 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800/80 rounded-xl focus-visible:ring-1 focus-visible:ring-purple-500"
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="h-9 w-9 bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-600 dark:hover:bg-purple-500 rounded-xl shrink-0"
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