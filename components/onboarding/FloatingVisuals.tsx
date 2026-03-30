"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Rocket, Zap } from "lucide-react";

export default function FloatingVisuals({ currentStep }: { currentStep: number }) {
    // Icons that match the branding and reduce cognitive load
    const icons = [
        { Icon: Sparkles, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", delay: 0, yOffset: -20 },
        { Icon: ShieldCheck, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", delay: 0.2, yOffset: 40 },
        { Icon: Rocket, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", delay: 0.4, yOffset: 10 },
        { Icon: Zap, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", delay: 0.6, yOffset: -30 },
    ];

    return (
        <div className="hidden lg:flex w-2/5 xl:w-1/3 bg-[#111111] border-l border-white/5 relative items-center justify-center overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-pink-500/10 to-sky-500/10 blur-[100px] rounded-full" />

            <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
                {icons.map((item, i) => {
                    const isFocus = currentStep % icons.length === i;

                    return (
                        <motion.div
                            key={i}
                            className={`absolute p-6 rounded-2xl border ${item.border} ${item.bg} backdrop-blur-xl shadow-2xl`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: isFocus ? 1 : 0.4,
                                scale: isFocus ? 1.1 : 0.9,
                                y: [item.yOffset, item.yOffset - 15, item.yOffset],
                                rotateX: [10, 20, 10],
                                rotateY: [-15, -5, -15],
                                zIndex: isFocus ? 10 : 1
                            }}
                            transition={{
                                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                                rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                                rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                                opacity: { duration: 0.8 },
                                scale: { duration: 0.8 }
                            }}
                            style={{
                                transformStyle: "preserve-3d",
                                left: `${20 + (i * 15)}%`,
                                top: `${30 + (i * 10)}%`,
                            }}
                        >
                            <item.Icon className={`w-16 h-16 ${item.color}`} strokeWidth={1.5} />
                        </motion.div>
                    );
                })}
            </div>

            {/* Firebase style angled gradient accent at the bottom right */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-tl from-pink-600/30 to-sky-600/30 blur-3xl rounded-full" />
        </div>
    );
}