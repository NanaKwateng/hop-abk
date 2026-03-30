"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Step5Celebrate({ setCanContinue }: { setCanContinue: (val: boolean) => void }) {
    useEffect(() => setCanContinue(true), [setCanContinue]);

    const confetti = Array.from({ length: 40 });

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 relative">
            {/* Confetti Explosion */}
            {confetti.map((_, idx) => (
                <motion.div
                    key={idx}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        left: `${50 + (Math.random() * 40 - 20)}%`, // start near center
                        top: "50%",
                        backgroundColor: ["#ec4899", "#0ea5e9", "#f472b6", "#38bdf8"][Math.floor(Math.random() * 4)],
                    }}
                    initial={{ opacity: 1, scale: 0 }}
                    animate={{
                        opacity: 0,
                        scale: Math.random() * 2 + 1,
                        x: (Math.random() - 0.5) * 400,
                        y: (Math.random() - 0.5) * 400 - 100
                    }}
                    transition={{ duration: 2 + Math.random(), ease: "easeOut" }}
                />
            ))}

            <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30"
            >
                <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-4xl font-bold text-white mb-3">You're all set!</h2>
                <p className="text-gray-400 max-w-sm mx-auto">
                    Your profile is ready. Click the button below to complete setup and head to your dashboard.
                </p>
            </motion.div>
        </div>
    );
}