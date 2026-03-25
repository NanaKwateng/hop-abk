// src/components/onboarding/OnboardingFlow.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import Step1Welcome from "./StepWelcome";
import Step2Education from "./StepEducation";
import Step3Consent from "./Step3Consent";
import Step4Verification from "./Step4Launch";
import Step5End from "./Step5End";
import { completeOnboarding } from "@/actions/onboarding";
import { Fa500Px } from "react-icons/fa";

const steps = [
    { id: "welcome", Component: Step1Welcome },
    { id: "education", Component: Step2Education },
    { id: "consent", Component: Step3Consent },
    { id: "verification", Component: Step4Verification },
    { id: "end", Component: Step5End },
];

export default function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPending, setIsPending] = useState(false);

    // Step 3 (Consent) will lock this until agreed
    const [canProceed, setCanProceed] = useState(true);

    const handleNext = async () => {
        if (!canProceed || isPending) return;

        if (currentStep < steps.length - 1) {
            // Reset proceed permission for the next step, except if it's the consent step, 
            // the consent component itself handles disabling it on mount.
            setCanProceed(true);
            setCurrentStep((prev) => prev + 1);
            return;
        }

        // Final Step - Complete Onboarding
        setIsPending(true);
        try {
            const redirectPath = await completeOnboarding();
            if (redirectPath) {
                window.location.href = redirectPath; // Hard redirect
            } else {
                throw new Error("No redirect path returned");
            }
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
            setIsPending(false);
            alert("Failed to complete onboarding. Please check your console.");
        }
    };

    const handlePrev = () => {
        if (currentStep > 0 && !isPending) {
            setCanProceed(true); // Always can go back
            setCurrentStep((prev) => prev - 1);
        }
    };

    const CurrentComponent = steps[currentStep].Component;
    const isFinalStep = currentStep === steps.length - 1;

    return (
        <div className="fixed inset-0 flex flex-col text-white font-sans selection:bg-white/30">

            {/* Top Navigation Bar - Windows 11 Inspired (Top Right Focus) */}
            <header className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
                {/* Logo / Brand Indicator */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 text-white text-black rounded-lg flex items-center justify-center font-bold">
                        <Fa500Px size={24} />
                    </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-4">
                    {currentStep > 0 && (
                        <button
                            onClick={handlePrev}
                            disabled={isPending}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={!canProceed || isPending}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${canProceed && !isPending
                            ? "bg-white text-black hover:bg-zinc-200 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                            : "bg-white/10 text-white/40 cursor-not-allowed"
                            }`}
                    >
                        {isPending ? (
                            <>Processing <Loader2 className="w-4 h-4 animate-spin" /></>
                        ) : isFinalStep ? (
                            "Finish Setup"
                        ) : (
                            <>Next <ChevronRight className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </header>

            {/* Progress Indicator - Minimal Bottom Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
                {steps.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ease-out ${idx === currentStep ? "w-8 bg-white" : "w-2 bg-white/20"
                            }`}
                    />
                ))}
            </div>

            {/* Main Center Content */}
            <main className="flex-1 flex items-center justify-center w-full px-6 relative">
                {/* Subtle global background radial gradient for depth */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
                        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                        exit={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full flex items-center justify-center"
                    >
                        <CurrentComponent setCanProceed={setCanProceed} />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}