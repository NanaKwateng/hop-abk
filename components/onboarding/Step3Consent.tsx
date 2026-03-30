"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Step3Terms({ setCanContinue }: { setCanContinue: (val: boolean) => void }) {
    const [agreedAnalytics, setAgreedAnalytics] = useState(true);
    const [agreedTerms, setAgreedTerms] = useState(false);

    // Only allow Continue if mandatory terms are accepted
    useEffect(() => {
        setCanContinue(agreedTerms);
    }, [agreedTerms, setCanContinue]);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-white">Data & Privacy</h2>
            <p className="text-gray-400">Configure your sharing settings and agree to our terms.</p>

            <div className="space-y-6 border-t border-white/10 pt-6">
                {/* Analytics Checkbox (Optional but checked by default) */}
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => setAgreedAnalytics(!agreedAnalytics)}
                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${agreedAnalytics ? 'bg-sky-500 border-sky-500' : 'bg-transparent border-gray-600'}`}
                    >
                        {agreedAnalytics && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div>
                        <p className="font-medium text-white cursor-pointer" onClick={() => setAgreedAnalytics(!agreedAnalytics)}>
                            Use the default settings for sharing Analytics data.
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-gray-500">
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-gray-600" /> Share data to improve products</li>
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-gray-600" /> Enable Benchmarking</li>
                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-gray-600" /> Enable Technical Support</li>
                        </ul>
                    </div>
                </div>

                {/* Mandatory Terms Checkbox */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/10">
                    <button
                        onClick={() => setAgreedTerms(!agreedTerms)}
                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${agreedTerms ? 'bg-sky-500 border-sky-500' : 'bg-transparent border-gray-600 hover:border-sky-400'}`}
                    >
                        {agreedTerms && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-4 h-4 text-white" /></motion.div>}
                    </button>
                    <div>
                        <p className="font-medium text-white cursor-pointer" onClick={() => setAgreedTerms(!agreedTerms)}>
                            I accept the <span className="text-sky-400 underline decoration-sky-400/30 underline-offset-4">Terms of Service</span> and <span className="text-sky-400 underline decoration-sky-400/30 underline-offset-4">Privacy Policy</span>.
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Required to create your workspace.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}