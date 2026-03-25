// src/components/onboarding/Step4Verification.tsx
"use client";

import { motion } from "framer-motion";
import BentoCard from "./BentoCard";
import { Fingerprint } from "lucide-react";

export default function Step4Verification() {
    return (
        <div className="flex flex-col lg:flex-row items-center justify-between max-w-5xl w-full gap-12 lg:gap-20">
            {/* Right Side - UI Mockup */}
            <motion.div
                initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", damping: 20 }}
                className="w-full lg:w-1/2 flex justify-center"
            >
                <BentoCard />
            </motion.div>

            {/* Left Side - Text */}
            <div className="w-full lg:w-1/2 flex flex-col items-start space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30"
                >
                    <Fingerprint className="w-6 h-6" />
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight"
                >
                    Seamless AI Verification.
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-lg text-zinc-400 font-light leading-relaxed"
                >
                    Experience real-time candidate processing. Our smart systems analyze and score criteria instantly, removing bottlenecks from your daily workflow. It's smart, secure, and incredibly fast.
                </motion.p>
            </div>
        </div>
    );
}