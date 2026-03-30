"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Step4Verify({ setCanContinue }: { setCanContinue: (val: boolean) => void }) {
    useEffect(() => setCanContinue(true), [setCanContinue]);

    const [activeIndex, setActiveIndex] = useState(0);

    const candidates = [
        { id: 1, image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop", score: 84 },
        { id: 2, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop", score: 92 },
        { id: 3, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop", score: 76 },
        { id: 4, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop", score: 89 },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % candidates.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white mb-2">Verify Identity</h2>
            <p className="text-sm text-gray-400 mb-8">
                Provide the perfect look for your portrait to secure your account.
            </p>

            {/* The Bento Grid Card */}
            <div className="w-full max-w-sm mx-auto bg-[#131313] border border-white/5 shadow-2xl overflow-hidden rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-3 relative">
                    {candidates.map((candidate, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <div
                                key={candidate.id}
                                className="relative aspect-[3/4] p-3 cursor-pointer group"
                                onClick={() => setActiveIndex(index)}
                            >
                                <div className="w-full h-full relative rounded-lg overflow-hidden bg-zinc-900 shadow-inner">
                                    <motion.img
                                        src={candidate.image} alt="Portrait" className="w-full h-full object-cover"
                                        initial={false}
                                        animate={{ filter: isActive ? "grayscale(0%)" : "grayscale(100%)", scale: isActive ? 1.1 : 1, opacity: isActive ? 1 : 0.4 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    />
                                    {isActive && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />}
                                </div>

                                {isActive && (
                                    <motion.div layoutId="scanner-frame" className="absolute inset-0 z-10 pointer-events-none" transition={{ type: "spring", stiffness: 200, damping: 24 }}>
                                        <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-sky-400 rounded-tl-xl drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                                        <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-sky-400 rounded-tr-xl drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-sky-400 rounded-bl-xl drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-sky-400 rounded-br-xl drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                                        <AnimatePresence>
                                            <motion.div initial={{ opacity: 0, y: 15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: 0.15, duration: 0.3 }} className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1.5 shadow-xl">
                                                <span className="text-zinc-600 font-medium tracking-tight">score</span>
                                                <span className="font-bold text-black">{candidate.score}</span>
                                            </motion.div>
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}