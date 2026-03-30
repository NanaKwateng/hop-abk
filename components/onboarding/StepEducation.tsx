"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Step2Features({ setCanContinue }: { setCanContinue: (val: boolean) => void }) {
    useEffect(() => setCanContinue(true), [setCanContinue]);

    const features = [
        "Plan and design your application seamlessly.",
        "Debug and troubleshoot issues with AI assistance.",
        "Get insights and recommendations to engage users.",
        "Generate schemas and explore data intuitively."
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
                        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center z-10 shadow-lg shadow-black">
                            <Check className="w-5 h-5 text-sky-400" />
                        </div>
                        <p className="text-gray-300 text-base flex-1 bg-white/5 border border-white/5 p-4 rounded-xl">{text}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}