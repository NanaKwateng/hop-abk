// src/components/onboarding/steps/Step1Welcome.tsx
"use client";

import { motion } from "framer-motion";

export default function Step1Welcome() {
    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            {/* Left Side - Animated Visual */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full lg:w-1/2 flex justify-center items-center relative min-h-[350px]"
            >
                {/* SVG Illustration */}
                <svg
                    viewBox="0 0 300 300"
                    className="w-full max-w-sm drop-shadow-2xl"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Gradient Background Circle */}
                    <defs>
                        <linearGradient id="welcomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>

                    {/* Decorative circles */}
                    <motion.circle
                        cx="150"
                        cy="150"
                        r="120"
                        fill="none"
                        stroke="url(#welcomeGradient)"
                        strokeWidth="2"
                        opacity="0.3"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.3 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    />

                    <motion.circle
                        cx="150"
                        cy="150"
                        r="90"
                        fill="none"
                        stroke="url(#welcomeGradient)"
                        strokeWidth="2"
                        opacity="0.2"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.2 }}
                        transition={{ duration: 1, delay: 0.4 }}
                    />

                    {/* Center icon - stylized wave/connection */}
                    <motion.g
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.5 }}
                    >
                        <circle cx="150" cy="150" r="50" fill="url(#welcomeGradient)" opacity="0.1" />
                        <path
                            d="M 130 150 Q 150 130 170 150 T 210 150"
                            stroke="url(#welcomeGradient)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <path
                            d="M 125 165 Q 150 145 175 165 T 220 165"
                            stroke="url(#welcomeGradient)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            opacity="0.6"
                        />
                        <path
                            d="M 120 180 Q 150 160 180 180 T 230 180"
                            stroke="url(#welcomeGradient)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            opacity="0.3"
                        />
                    </motion.g>
                </svg>

                {/* Floating elements */}
                <motion.div
                    className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/20 rounded-2xl blur-2xl"
                    animate={{
                        y: [0, -15, 0],
                        x: [0, 10, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>

            {/* Right Side - Text Content */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="w-full lg:w-1/2 flex flex-col items-start justify-center space-y-6"
            >
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold"
                >
                    Welcome to hop
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl lg:text-6xl font-bold text-white leading-tight"
                >
                    Hello there! 👋
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-gray-400 leading-relaxed max-w-lg"
                >
                    We're thrilled to have you join our community. In the next few steps, we'll help you set up your profile and
                    get you connected with amazing people.
                </motion.p>

                {/* Feature bullets */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col gap-3 mt-8"
                >
                    {[
                        { icon: "✨", text: "Set up your personalized profile" },
                        { icon: "🔐", text: "Secure your account with ease" },
                        { icon: "🚀", text: "Start connecting with members" },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + idx * 0.1 }}
                            className="flex items-center gap-3"
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-gray-300">{item.text}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}