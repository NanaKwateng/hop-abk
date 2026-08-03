"use client";

import React from "react";

export function GlowingOrb({ isThinking = false }: { isThinking?: boolean }) {
    return (
        <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 my-4">
            {/* Outer ambient glow */}
            <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-400 blur-xl opacity-60 transition-all duration-700 ${isThinking ? "animate-ping opacity-80" : "animate-pulse"
                    }`}
            />

            {/* Main Siri-like Animated Sphere */}
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl bg-slate-950 flex items-center justify-center border border-white/20">
                <svg
                    viewBox="0 0 200 200"
                    className={`w-full h-full transform transition-transform duration-1000 ${isThinking ? "rotate-180 scale-110" : "animate-spin-slow"
                        }`}
                >
                    <defs>
                        <radialGradient id="orbGrad1" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#f472b6" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </radialGradient>
                        <radialGradient id="orbGrad2" cx="70%" cy="70%" r="60%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#06b6d4" opacity="0.8" />
                        </radialGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Dynamic dynamic gradient waves */}
                    <circle cx="100" cy="100" r="90" fill="url(#orbGrad1)" />
                    <path
                        d="M 20 100 Q 60 40, 100 100 T 180 100"
                        fill="none"
                        stroke="url(#orbGrad2)"
                        strokeWidth="12"
                        filter="url(#glow)"
                        className="animate-pulse"
                    />
                    <circle
                        cx="70"
                        cy="70"
                        r="30"
                        fill="#ffffff"
                        className="opacity-30 blur-sm"
                    />
                </svg>
            </div>
        </div>
    );
}