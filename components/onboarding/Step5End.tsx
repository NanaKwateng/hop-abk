// src/components/onboarding/steps/Step5Celebrate.tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Step5Celebrate() {
    const confetti = Array.from({ length: 30 });

    return (
        <div className="flex flex-col items-center justify-center gap-12 w-full relative">
            {/* Confetti Animation */}
            {confetti.map((_, idx) => (
                <motion.div
                    key={idx}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: [
                            "#3b82f6",
                            "#a855f7",
                            "#ec4899",
                            "#f59e0b",
                        ][Math.floor(Math.random() * 4)],
                    }}
                    initial={{ opacity: 1, y: -20 }}
                    animate={{ opacity: 0, y: 600 }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        delay: Math.random() * 0.5,
                    }}
                />
            ))}

            {/* Main Content */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 0.8,
                    type: "spring",
                    bounce: 0.5,
                }}
                className="relative w-32 h-32 flex items-center justify-center"
            >
                {/* Outer ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner circle */}
                <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl"
                    animate={{
                        boxShadow: [
                            "0 0 40px rgba(59, 130, 246, 0.5)",
                            "0 0 80px rgba(168, 85, 247, 0.5)",
                            "0 0 40px rgba(59, 130, 246, 0.5)",
                        ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <motion.svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </motion.svg>
                </motion.div>
            </motion.div>

            {/* Text Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-4 max-w-2xl"
            >
                <h1 className="text-5xl lg:text-6xl font-bold text-white">
                    You're all set! 🎉
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed">
                    Congratulations on completing the onboarding process. Your account is now fully set up and ready to go.
                    We're excited to have you as part of our community!
                </p>
            </motion.div>

            {/* Features List */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-8"
            >
                {[
                    {
                        icon: "👥",
                        title: "Connect",
                        desc: "Start engaging with community members",
                    },
                    {
                        icon: "📈",
                        title: "Grow",
                        desc: "Track your progress and achievements",
                    },
                    {
                        icon: "⭐",
                        title: "Succeed",
                        desc: "Reach your goals with our tools",
                    },
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        className="p-6 rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/20 text-center hover:border-gray-700 transition-colors"
                    >
                        <div className="text-4xl mb-3">{item.icon}</div>
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-4 mt-8"
            >
                <p className="text-gray-400 text-center max-w-md">
                    You'll be redirected to your dashboard in a moment. Get ready to make an impact!
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Welcome to hop</span>
                    <Sparkles className="w-4 h-4" />
                </div>
            </motion.div>
        </div>
    );
}