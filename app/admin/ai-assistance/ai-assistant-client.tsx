"use client";

import React, { useState } from "react";
import { GlowingOrb } from "@/components/ai-assistant/glowing-orb";
import {
    Sparkles,
    Paperclip,
    Settings,
    SlidersHorizontal,
    ArrowUp,
    Image as ImageIcon,
    Lightbulb,
    ListTodo,
    Presentation,
    Code,
    ChevronDown,
    User,
    Bot,
} from "lucide-react";

interface Message {
    id: string;
    sender: "user" | "ai";
    text: string;
}

export default function AIAssistantClient() {
    const [inputQuery, setInputQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState("ChatGPT v4.0");

    const handleSend = (textToSend?: string) => {
        const query = textToSend || inputQuery;
        if (!query.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: query,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputQuery("");
        setIsLoading(true);

        // Simulated AI response stream/delay
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: `Here is the insights on "${query}": Everything is running smoothly according to your latest workflow data.`,
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsLoading(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#0d0914] text-slate-100 dark:bg-[#0d0914] light:bg-slate-50 light:text-slate-900 transition-colors duration-300 p-4 md:p-8 flex flex-col justify-between">
            {/* Top Header Bar */}
            <header className="flex items-center justify-between w-full max-w-6xl mx-auto mb-6">
                <div className="relative inline-block">
                    <button className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs md:text-sm px-3 py-1.5 rounded-full transition-all">
                        <span>{selectedModel}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs md:text-sm px-3 py-1.5 rounded-full transition-all">
                        <Settings className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Configuration</span>
                    </button>
                    <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs md:text-sm px-3 py-1.5 rounded-full transition-all">
                        <span>Export</span>
                    </button>
                </div>
            </header>

            {/* Hero Section / Chat Window */}
            <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center my-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center text-center my-auto transition-all duration-500 animate-in fade-in">
                        <GlowingOrb isThinking={isLoading} />
                        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-white mb-6">
                            Ready to Create Something New?
                        </h1>
                    </div>
                ) : (
                    <div className="w-full space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {msg.sender === "ai" && (
                                    <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-purple-300" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.sender === "user"
                                        ? "bg-purple-600/30 text-purple-100 border border-purple-500/30 rounded-tr-none"
                                        : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.sender === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-xs text-purple-400">
                                <GlowingOrb isThinking={true} />
                                <span>Thinking...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Input Interface Area */}
                <div className="w-full max-w-3xl space-y-3">
                    {/* Quick Action Chips Above Input */}
                    <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <button
                            onClick={() => handleSend("Create Image: ")}
                            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                        >
                            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                            <span>Create Image</span>
                        </button>
                        <button
                            onClick={() => handleSend("Brainstorm ideas for ")}
                            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                        >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            <span>Brainstorm</span>
                        </button>
                        <button
                            onClick={() => handleSend("Make a plan for ")}
                            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                        >
                            <ListTodo className="w-3.5 h-3.5 text-blue-400" />
                            <span>Make a plan</span>
                        </button>
                    </div>

                    {/* Central Input Box */}
                    <div className="relative bg-[#161124]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl transition-all focus-within:border-purple-500/50">
                        <div className="flex items-center gap-2 px-2 pb-2">
                            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                            <input
                                type="text"
                                value={inputQuery}
                                onChange={(e) => setInputQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Ask Anything..."
                                className="w-full bg-transparent text-sm md:text-base text-white placeholder-slate-500 focus:outline-none"
                            />
                        </div>

                        {/* Bottom Controls inside input box */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-slate-400">
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1 hover:text-white transition-colors">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>Attach</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-white transition-colors">
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>Settings</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-white transition-colors">
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>Options</span>
                                </button>
                            </div>

                            <button
                                onClick={() => handleSend()}
                                disabled={!inputQuery.trim()}
                                className={`p-2 rounded-full transition-all ${inputQuery.trim()
                                    ? "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                                    : "bg-white/5 text-slate-600 cursor-not-allowed"
                                    }`}
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Feature Showcase Grid Cards (Bottom Layout) */}
            <footer className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {/* Card 1 */}
                <div
                    onClick={() => handleSend("Generate high quality images")}
                    className="group cursor-pointer bg-[#140f21]/60 hover:bg-[#1a142b] border border-white/5 hover:border-purple-500/30 p-4 rounded-xl transition-all duration-300 flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 group-hover:text-white">
                            Create Image
                        </span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                            Image Generator
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2">
                            Create high-quality images instantly from text prompt descriptions.
                        </p>
                    </div>
                </div>

                {/* Card 2 */}
                <div
                    onClick={() => handleSend("Turn ideas into presentation slides")}
                    className="group cursor-pointer bg-[#140f21]/60 hover:bg-[#1a142b] border border-white/5 hover:border-purple-500/30 p-4 rounded-xl transition-all duration-300 flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
                            <Presentation className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 group-hover:text-white">
                            Make Slides
                        </span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                            AI Presentation
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2">
                            Turn raw ideas into engaging, professional presentations in seconds.
                        </p>
                    </div>
                </div>

                {/* Card 3 */}
                <div
                    onClick={() => handleSend("Write clean production code for ")}
                    className="group cursor-pointer bg-[#140f21]/60 hover:bg-[#1a142b] border border-white/5 hover:border-purple-500/30 p-4 rounded-xl transition-all duration-300 flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Code className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400 group-hover:text-white">
                            Generate Code
                        </span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                            Dev Assistant
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2">
                            Generate clean, production ready code and architectural patterns.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}