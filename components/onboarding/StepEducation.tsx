// src/components/onboarding/Step2Education.tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, ShieldCheck } from "lucide-react";

const features = [
    { icon: Sparkles, title: "Intelligent Insights", desc: "Our system analyzes your workflow to provide tailored recommendations." },
    { icon: Zap, title: "Lightning Fast", desc: "Experience a dashboard optimized for speed and maximum efficiency." },
    { icon: ShieldCheck, title: "Bank-Grade Security", desc: "Your data is encrypted at rest and in transit. Total peace of mind." },
];

export default function Step2Education() {
    return (
        <div className="flex flex-col items-center text-center max-w-4xl space-y-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">How it works</h2>
                <p className="text-lg text-zinc-400 font-light">Everything you need, beautifully integrated into one platform.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {features.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 + 0.2, type: "spring" }}
                        className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                    >
                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10">
                            <item.icon className="w-6 h-6 text-zinc-100" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-3">{item.title}</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}