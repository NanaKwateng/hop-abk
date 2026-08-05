"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Lock, Sparkles } from "lucide-react";

interface SimplicityCoverProps {
    isOpen: boolean;
    onContinue: () => void;
}

export default function SimplicityCover({ isOpen, onContinue }: SimplicityCoverProps) {
    // State for tracking micro-interactions per shape
    const [hoveredShape, setHoveredShape] = useState<number | null>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="simplicity-cover"
                    initial={{ y: 0, opacity: 1 }}
                    exit={{
                        y: "-100%",
                        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
                    }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-slate-100 via-rose-50/40 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 select-none text-slate-900 dark:text-slate-100"
                >
                    {/* Background Radial Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.6),transparent_70%)] pointer-events-none" />

                    {/* --- Top Bar Navigation --- */}
                    <header className="relative z-20 flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase opacity-70"
                        >
                            <Sparkles className="h-4 w-4 text-emerald-500" />
                            <span>House of Power Ministry Int.</span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xs font-semibold tracking-widest uppercase opacity-50"
                        >
                            System Gateway v2.1
                        </motion.div>
                    </header>

                    {/* --- Center Composition: 7 Interactive Geometric Elements --- */}
                    <div className="relative z-10 flex h-full w-full max-w-6xl items-center justify-center px-4">
                        {/* 1. Frosted Glass Plate (Top-Left) */}
                        <motion.div
                            onHoverStart={() => setHoveredShape(1)}
                            onHoverEnd={() => setHoveredShape(null)}
                            animate={{
                                rotate: hoveredShape === 1 ? -12 : -6,
                                scale: hoveredShape === 1 ? 1.05 : 1,
                                y: [0, -8, 0]
                            }}
                            transition={{
                                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                                rotate: { duration: 0.3 }
                            }}
                            className="absolute left-[5%] top-[12%] h-48 w-36 md:h-64 md:w-48 rounded-2xl border border-white/60 bg-gradient-to-br from-emerald-300/40 via-teal-200/20 to-lime-200/40 backdrop-blur-md shadow-xl"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-pulse" />
                        </motion.div>

                        {/* 2. Emerald Fan/Fin Cluster (Center-Left Background) */}
                        <motion.div
                            onHoverStart={() => setHoveredShape(2)}
                            onHoverEnd={() => setHoveredShape(null)}
                            animate={{
                                rotate: hoveredShape === 2 ? 45 : 0,
                                scale: hoveredShape === 2 ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute left-[18%] top-[18%] h-56 w-56 md:h-72 md:w-72"
                        >
                            <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-lg">
                                {[...Array(12)].map((_, i) => (
                                    <path
                                        key={i}
                                        d="M100 100 L100 10 A90 90 0 0 1 123 13 Z"
                                        fill="#10B981"
                                        transform={`rotate(${i * 30} 100 100)`}
                                        opacity={0.85 - (i % 3) * 0.15}
                                    />
                                ))}
                            </svg>
                        </motion.div>

                        {/* 3. Pink Capsules (Bottom Left) */}
                        <motion.div
                            onHoverStart={() => setHoveredShape(3)}
                            onHoverEnd={() => setHoveredShape(null)}
                            animate={{
                                y: hoveredShape === 3 ? -10 : 0,
                                rotate: hoveredShape === 3 ? -35 : -30,
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute left-[8%] bottom-[15%] flex flex-col gap-3"
                        >
                            <div className="h-12 w-36 md:h-14 md:w-44 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 shadow-lg" />
                            <div className="h-12 w-36 md:h-14 md:w-44 rounded-full bg-gradient-to-r from-pink-300 to-rose-300 shadow-md ml-4" />
                        </motion.div>

                        {/* 4. Blue Split Sphere / "S" Sculpt (Main Center Hero) */}
                        <motion.div
                            onHoverStart={() => setHoveredShape(4)}
                            onHoverEnd={() => setHoveredShape(null)}
                            animate={{
                                rotateY: hoveredShape === 4 ? 25 : 0,
                                scale: hoveredShape === 4 ? 1.04 : 1,
                                y: [0, -10, 0]
                            }}
                            transition={{
                                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                                rotateY: { duration: 0.4 }
                            }}
                            className="relative z-20 h-64 w-64 md:h-96 md:w-96"
                        >
                            <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-2xl">
                                <defs>
                                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3B82F6" />
                                        <stop offset="100%" stopColor="#1D4ED8" />
                                    </linearGradient>
                                    <linearGradient id="blueLight" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#60A5FA" />
                                        <stop offset="100%" stopColor="#2563EB" />
                                    </linearGradient>
                                </defs>
                                {/* Upper Hemisphere Shell */}
                                <path d="M100 20 A80 80 0 0 1 180 100 L100 100 Z" fill="url(#blueGrad)" />
                                {/* Fan Slices */}
                                <path d="M100 100 A80 80 0 0 1 100 180 C120 150 120 120 100 100 Z" fill="url(#blueLight)" />
                                <path d="M100 100 A80 80 0 0 1 125 176 C135 150 130 120 100 100 Z" fill="#93C5FD" opacity="0.8" />
                                <path d="M100 100 A80 80 0 0 1 150 162 C150 140 140 120 100 100 Z" fill="#BFDBFE" opacity="0.6" />
                                {/* Lower Inverse Dome */}
                                <path d="M100 100 A80 80 0 0 1 20 100 C20 60 60 20 100 100 Z" fill="#1E40AF" />
                            </svg>
                        </motion.div>

                        {/* 5. Orange Torus / Ring Sculpt (Top Right) */}
                        <motion.div
                            onHoverStart={() => setHoveredShape(5)}
                            onHoverEnd={() => setHoveredShape(null)}
                            animate={{
                                rotate: hoveredShape === 5 ? 180 : 0,
                                scale: hoveredShape === 5 ? 1.08 : 1,
                            }}
                            transition={{ duration: 0.8, ease: "anticipate" }}
                            className="absolute right-[12%] top-[10%] h-48 w-48 md:h-64 md:w-64"
                        >
                            <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-xl">
                                <circle cx="100" cy="100" r="70" fill="none" stroke="#FB923C" strokeWidth="35" />
                                <circle cx="100" cy="100" r="70" fill="none" stroke="#F97316" strokeWidth="35" strokeDasharray="220 100" />
                                <circle cx="80" cy="80" r="20" fill="rgba(255,255,255,0.4)" />
                            </svg>
                        </motion.div>

                        {/* 6. Yellow Speckled Cylinder (Bottom Right) */}
                        <motion.div
                            onHoverStart={() => setHoveredShape(6)}
                            onHoverEnd={() => setHoveredShape(null)}
                            animate={{
                                rotate: hoveredShape === 6 ? 65 : 55,
                                y: hoveredShape === 6 ? -8 : 0
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute right-[8%] bottom-[12%] h-40 w-28 md:h-56 md:w-40 rounded-3xl bg-amber-400 shadow-xl overflow-hidden"
                            style={{
                                backgroundImage: `radial-gradient(#d97706 15%, transparent 16%)`,
                                backgroundSize: "12px 12px"
                            }}
                        >
                            <div className="h-full w-full bg-gradient-to-tr from-amber-500/50 to-transparent" />
                        </motion.div>

                        {/* 7. Glass Sphere Accent (Foreground Glass Ring) */}
                        <motion.div
                            onHoverStart={() => setHoveredShape(7)}
                            onHoverEnd={() => setHoveredShape(null)}
                            animate={{
                                x: hoveredShape === 7 ? 15 : 0,
                                y: hoveredShape === 7 ? -15 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute left-[15%] bottom-[8%] z-30 h-24 w-24 md:h-32 md:w-32 rounded-full border border-white/80 bg-white/20 backdrop-blur-md shadow-2xl"
                        >
                            <div className="absolute top-2 left-4 h-6 w-10 rounded-full bg-white/60 blur-[1px]" />
                        </motion.div>

                        {/* --- Main Overlay Text Typography --- */}
                        <div className="absolute z-30 text-center pointer-events-none">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-md"
                            >
                                Simplicity<span className="text-blue-600 dark:text-blue-400">21</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="mt-2 text-sm md:text-lg font-medium tracking-wide text-slate-600 dark:text-slate-300"
                            >
                                Administration & Control Environment
                            </motion.p>
                        </div>
                    </div>

                    {/* --- Bottom Action Bar --- */}
                    <footer className="relative z-20 flex w-full flex-col items-center justify-center gap-4 pb-10">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onContinue}
                            className="group relative flex items-center gap-3 rounded-full bg-slate-900 dark:bg-white px-8 py-4 text-base font-semibold text-white dark:text-slate-900 shadow-2xl hover:shadow-blue-500/25 transition-all"
                        >
                            <span>Continue to Dashboard</span>
                            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </motion.button>

                        <p className="text-xs text-slate-400">
                            Press continue to unveil system workspace
                        </p>
                    </footer>
                </motion.div>
            )}
        </AnimatePresence>
    );
}