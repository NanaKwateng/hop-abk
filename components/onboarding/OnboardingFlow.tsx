// src/components/onboarding/OnboardingFlow.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Step1Welcome from "./StepWelcome";
import Step2Learn from "./StepEducation";
import Step3Terms from "./Step3Consent";
import Step4Verify from "./Step4Launch";
import Step5Celebrate from "./Step5End";
import { completeOnboarding } from "@/actions/onboarding";

const steps = [Step1Welcome, Step2Learn, Step3Terms, Step4Verify, Step5Celebrate];

export default function OnboardingFlow() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
            return;
        }

        // Final Step - Complete Onboarding
        setIsPending(true);
        try {
            const redirectPath = await completeOnboarding();
            if (redirectPath) {
                window.location.href = redirectPath;
            } else {
                throw new Error("No redirect path returned");
            }
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
            setIsPending(false);
            alert("Failed to complete onboarding. Please try again.");
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const CurrentComponent = steps[currentStep];
    const progressPercent = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col overflow-hidden relative">
            {/* Animated background gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, 50, -30, 0],
                        y: [0, -50, 30, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, -50, 30, 0],
                        y: [0, 50, -30, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
            </div>

            {/* Top Header with Progress */}
            <header className="relative z-20 px-6 lg:px-12 py-8 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">H</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">hop</span>
                </motion.div>

                {/* Step indicator text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hidden md:flex items-center gap-3"
                >
                    <span className="text-sm text-gray-400">
                        Step <span className="font-bold text-white">{currentStep + 1}</span> of{" "}
                        <span className="font-bold text-white">{steps.length}</span>
                    </span>
                    <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                    </div>
                </motion.div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-12 py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full max-w-5xl"
                    >
                        <CurrentComponent />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation Buttons */}
            <footer className="relative z-20 px-6 lg:px-12 py-8 flex items-center justify-between">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    disabled={currentStep === 0 || isPending}
                    className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </motion.button>

                {/* Next Button / Circular Progress */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={!isPending ? { scale: 1.05 } : {}}
                    whileTap={!isPending ? { scale: 0.95 } : {}}
                    onClick={handleNext}
                    disabled={isPending}
                    className="relative group flex items-center justify-center outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {/* Circular Progress SVG */}
                    <svg className="w-24 h-24 transform -rotate-90 absolute" viewBox="0 0 60 60">
                        <circle
                            cx="30"
                            cy="30"
                            r="24"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2"
                            fill="none"
                        />
                        <motion.circle
                            cx="30"
                            cy="30"
                            r="24"
                            stroke="url(#gradientProgress)"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "0 150" }}
                            animate={{ strokeDasharray: `${progressPercent * 1.5} 150` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="gradientProgress" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Inner Button */}
                    <motion.div
                        className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-shadow duration-300"
                        whileHover={{ boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" }}
                    >
                        {isPending ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                            />
                        ) : currentStep === steps.length - 1 ? (
                            <motion.svg
                                className="w-7 h-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </motion.svg>
                        ) : (
                            <motion.svg
                                className="w-7 h-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </motion.svg>
                        )}
                    </motion.div>
                </motion.button>
            </footer>
        </div>
    );
}