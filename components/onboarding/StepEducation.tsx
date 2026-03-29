// src/components/onboarding/steps/Step2Learn.tsx
"use client";

import { motion } from "framer-motion";
import { Heart, MessageSquare, Users, Zap } from "lucide-react";

export default function Step2Learn() {
    const features = [
        {
            icon: Users,
            title: "Connect",
            description: "Build meaningful relationships with community members",
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: MessageSquare,
            title: "Collaborate",
            description: "Share ideas and work together on projects",
            color: "from-purple-500 to-purple-600",
        },
        {
            icon: Zap,
            title: "Grow",
            description: "Develop your skills and track your progress",
            color: "from-pink-500 to-pink-600",
        },
        {
            icon: Heart,
            title: "Engage",
            description: "Participate in events and community activities",
            color: "from-orange-500 to-orange-600",
        },
    ];

    return (
        <div className="flex flex-col gap-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4"
            >
                <h2 className="text-4xl lg:text-5xl font-bold text-white">How hop works</h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Discover the core features that make our community thrive and help you succeed
                </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group relative p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/20 backdrop-blur-sm hover:border-gray-700 transition-all duration-300"
                        >
                            {/* Gradient background on hover */}
                            <div
                                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                            />

                            {/* Content */}
                            <div className="relative z-10 space-y-4">
                                <motion.div
                                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </motion.div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>

                            {/* Animated border on hover */}
                            <motion.div
                                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-xl pointer-events-none`}
                                animate={{ opacity: 0 }}
                                whileHover={{ opacity: 0.1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Bottom CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 backdrop-blur-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="text-3xl">🎯</div>
                    <div>
                        <h4 className="text-white font-semibold text-lg">Ready to get started?</h4>
                        <p className="text-gray-400 text-sm mt-1">Let's verify your account in the next step</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}