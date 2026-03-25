// src/components/onboarding/Step1Welcome.tsx
"use client";

import { motion } from "framer-motion";

export default function Step1Welcome() {
    return (
        <div className="flex flex-col items-center text-center max-w-3xl space-y-12">
            {/* Google-Inspired Abstract Geometry */}
            <div className="relative w-48 h-48 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0, x: -50, y: 50 }} animate={{ scale: 1, x: 0, y: 0 }} transition={{ type: "spring", delay: 0.1 }}
                    className="absolute top-0 right-4 w-20 h-20 bg-[#EA4335] rounded-full mix-blend-screen blur-[2px]"
                />
                <motion.div
                    initial={{ scale: 0, x: 50, y: 50 }} animate={{ scale: 1, x: 0, y: 0 }} transition={{ type: "spring", delay: 0.2 }}
                    className="absolute bottom-4 left-4 w-24 h-24 bg-[#4285F4] rounded-2xl mix-blend-screen blur-[2px] rotate-12"
                />
                <motion.div
                    initial={{ scale: 0, y: -50 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", delay: 0.3 }}
                    className="absolute -bottom-2 right-6 w-16 h-16 bg-[#FBBC05] rounded-tl-full rounded-br-full mix-blend-screen blur-[2px] -rotate-12"
                />
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.4 }}
                    className="absolute top-6 left-6 w-14 h-14 bg-[#34A853] rounded-full mix-blend-screen blur-[2px]"
                />
            </div>

            <div className="space-y-6">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-semibold tracking-tight text-white"
                >
                    Let&apos;s get started.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease: "easeOut" }}
                    className="text-lg md:text-xl text-zinc-400 font-light max-w-xl mx-auto"
                >
                    Welcome to your new workspace. We've crafted a seamless environment to help you connect, build, and scale faster than ever.
                </motion.p>
            </div>
        </div>
    );
}