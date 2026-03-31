"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Step2Features({ setCanContinue }: { setCanContinue: (val: boolean) => void }) {
    useEffect(() => setCanContinue(true), [setCanContinue]);

    const features = [
        "View all metrics, analyze your workspace and track progress seamlessly",
        "Set up your account, create new workspaces and then monitor progess steadily",
        "Get insights and recommendations for all usecases, enjoy the best as you move along",
        "A platform built just to cover all your needs with regards to the usage of our services."
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-white">What to expect</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {features.map((text, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="relative flex items-center gap-6"
                    >
                        <div className="w-8 h-8 rounded-full bg-black border-2 border-sky-800 flex items-center justify-center z-10 shadow-lg shadow-black">
                            <Check className="w-5 h-5 text-sky-400" />
                        </div>
                        <p className="w-full max-w-sm text-gray-300 text-base flex-1 p-3 rounded-xl">{text}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}