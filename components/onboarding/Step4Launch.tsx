// src/components/onboarding/steps/Step4Verify.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";

export default function Step4Verify() {
    const [step, setStep] = useState<"email" | "details">("email");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsVerified(true);
            setTimeout(() => setStep("details"), 500);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
            {/* Left Side - Aceternity Style Component */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full lg:w-1/2 flex items-center justify-center relative"
            >
                <div className="relative w-full max-w-sm">
                    {/* Card Container */}
                    <motion.div
                        className="relative rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl p-8 shadow-2xl overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        {/* Animated Background Gradient */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20"
                            animate={{
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            style={{ pointerEvents: "none" }}
                        />

                        {/* Content */}
                        <div className="relative z-10 space-y-6">
                            {/* Header */}
                            <motion.div variants={containerVariants} className="space-y-2">
                                <motion.h3 variants={itemVariants} className="text-2xl font-bold text-white">
                                    Verify Your Account
                                </motion.h3>
                                <motion.p variants={itemVariants} className="text-gray-400 text-sm">
                                    {step === "email"
                                        ? "We'll send a verification link to your email"
                                        : "Complete your profile information"}
                                </motion.p>
                            </motion.div>

                            {/* Form */}
                            <motion.form
                                onSubmit={step === "email" ? handleEmailSubmit : undefined}
                                className="space-y-4"
                                variants={containerVariants}
                            >
                                {step === "email" ? (
                                    <motion.div
                                        variants={itemVariants}
                                        className="relative group"
                                    >
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                                required
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        <motion.div variants={itemVariants} className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-400">
                                                First Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    placeholder="John"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                                    required
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-400">
                                                Last Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    placeholder="Doe"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </motion.form>

                            {/* Status Indicator */}
                            {isVerified && step === "email" && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                                >
                                    <motion.svg
                                        className="w-5 h-5 text-green-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </motion.svg>
                                    <span className="text-sm text-green-400">Email verified successfully</span>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Information */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-full lg:w-1/2 flex flex-col space-y-8"
            >
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-white">Secure Your Account</h2>
                    <p className="text-lg text-gray-400">
                        We take your security seriously. Complete the verification process to unlock full access to hop.
                    </p>
                </div>

                {/* Security Features */}
                <motion.div className="space-y-4">
                    {[
                        {
                            icon: Mail,
                            title: "Email Verification",
                            desc: "Confirm your email address to secure your account",
                        },
                        {
                            icon: Lock,
                            title: "Data Protection",
                            desc: "Your information is encrypted and securely stored",
                        },
                        {
                            icon: User,
                            title: "Profile Setup",
                            desc: "Complete your profile to enhance your experience",
                        },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="flex gap-4 p-4 rounded-lg bg-gray-900/30 border border-gray-800 hover:border-gray-700 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{item.title}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center gap-3 p-4 rounded-lg border border-green-500/20 bg-green-500/5"
                >
                    <span className="text-2xl">🔒</span>
                    <div>
                        <p className="text-sm font-semibold text-green-400">Enterprise-grade Security</p>
                        <p className="text-xs text-gray-400 mt-1">ISO 27001 certified & SOC 2 compliant</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}