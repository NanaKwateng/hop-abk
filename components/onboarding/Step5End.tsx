// src/components/onboarding/Step5End.tsx
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Step5End() {
    return (
        <div className="flex flex-col items-center justify-center text-center max-w-2xl space-y-10">
            <div className="relative flex justify-center items-center">
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                    className="absolute w-64 h-64 bg-green-500/20 rounded-full blur-[80px]"
                />

                <motion.div
                    initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.4)] z-10"
                >
                    <Check className="w-12 h-12 text-black" strokeWidth={3} />
                </motion.div>
            </div>

            <div className="space-y-4 z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="text-5xl font-semibold tracking-tight text-white"
                >
                    You're all set!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="text-xl text-zinc-400 font-light"
                >
                    Thank you for completing the setup. Click finish to enter your dashboard.
                </motion.p>
            </div>
        </div>
    );
}