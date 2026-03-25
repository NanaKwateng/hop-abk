// src/components/onboarding/Step3Consent.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { FileText, Check } from "lucide-react";

export default function Step3Consent({
    setCanProceed
}: {
    setCanProceed: (val: boolean) => void
}) {
    // Disable Next button initially when landing on this step
    useEffect(() => {
        setCanProceed(false);
    }, [setCanProceed]);

    const handleAgree = () => {
        setCanProceed(true);
    };

    return (
        <div className="flex flex-col items-center max-w-3xl w-full space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-semibold tracking-tight text-white">Review our Terms</h2>
                <p className="text-zinc-400 font-light">Please accept our Terms of Service and Privacy Policy to continue.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="w-full bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 h-[300px] overflow-y-auto text-sm text-zinc-400 space-y-4 custom-scrollbar shadow-inner"
            >
                <h3 className="text-white font-medium text-lg">1. Acceptance of Terms</h3>
                <p>By accessing and using our application, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our service.</p>

                <h3 className="text-white font-medium text-lg pt-4">2. Privacy Policy & Data Usage</h3>
                <p>We respect your privacy. We collect minimal data necessary to provide you with a tailored experience. Your data is never sold to third parties. Our encryption ensures that your personal identifiable information remains secure.</p>

                <h3 className="text-white font-medium text-lg pt-4">3. User Responsibilities</h3>
                <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity occurring under your account is your responsibility. We reserve the right to suspend accounts that violate community guidelines.</p>
                <p>Please read our full policies on our main website for extended legal disclosures.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <button
                    onClick={handleAgree}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-full font-medium transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                >
                    <span>I have read and agree</span>
                    <Check className="w-5 h-5" />
                </button>
                <p className="text-xs text-zinc-500 mt-4 text-center">Clicking agree will unlock the Next button.</p>
            </motion.div>
        </div>
    );
}