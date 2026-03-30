"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Step1Welcome from "./StepWelcome";
import Step2Features from "./StepEducation";
import Step3Terms from "./Step3Consent";
import Step4Verify from "./Step4Launch";
import Step5Celebrate from "./Step5End";
import FloatingVisuals from "./FloatingVisuals";
import { completeOnboarding } from "@/actions/onboarding";

const steps = [Step1Welcome, Step2Features, Step3Terms, Step4Verify, Step5Celebrate];

export default function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const [canContinue, setCanContinue] = useState(true); // Let steps control the Next button

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
            return;
        }

        // Final Step
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
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    };

    const CurrentComponent = steps[currentStep];

    return (
        <div className="min-h-screen bg-[#0d0d0d] flex font-sans text-gray-200 selection:bg-pink-500/30">
            {/* LEFT PANE - Content Area */}
            <div className="flex-1 flex flex-col relative z-10 w-full lg:w-3/5 xl:w-2/3">
                {/* Header (Logo / Exit) */}
                <header className="px-8 py-6 flex items-center gap-3 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-sky-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
                        <span className="text-white font-bold text-sm">H</span>
                    </div>
                    <span className="font-semibold text-white tracking-wide">hop</span>
                </header>

                {/* Main Step Content */}
                <main className="flex-1 overflow-y-auto px-8 py-10 lg:px-16 lg:py-16 custom-scrollbar">
                    <div className="max-w-2xl mx-auto h-full flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                {/* Pass down setCanContinue so steps like "Terms" can lock the button */}
                                <CurrentComponent setCanContinue={setCanContinue} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* Footer Navigation (Firebase Style) */}
                <footer className="px-8 py-6 lg:px-16 border-t border-white/5 bg-[#0d0d0d]/80 backdrop-blur-md flex items-center justify-between">
                    {currentStep > 0 && currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleBack}
                            disabled={isPending}
                            className="text-sky-400 font-medium hover:text-sky-300 transition-colors disabled:opacity-50"
                        >
                            Previous
                        </button>
                    ) : (
                        <div /> // Spacer
                    )}

                    <button
                        onClick={handleNext}
                        disabled={!canContinue || isPending}
                        className={`px-8 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center min-w-[140px]
                            ${canContinue && !isPending
                                ? "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20"
                                : "bg-white/10 text-white/40 cursor-not-allowed"
                            }`}
                    >
                        {isPending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : currentStep === steps.length - 1 ? (
                            "Go to Dashboard"
                        ) : (
                            "Continue"
                        )}
                    </button>
                </footer>
            </div>

            {/* RIGHT PANE - Animated 3D Visuals */}
            <FloatingVisuals currentStep={currentStep} />
        </div>
    );
}