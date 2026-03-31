"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Step1Welcome({ setCanContinue }: { setCanContinue: (val: boolean) => void }) {
    useEffect(() => setCanContinue(true), [setCanContinue]);

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl lg:text-5xl font-semibold text-white">
                    Heaven oo <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-sky-400">
                        Welcome to HOP..
                    </span>
                </h1>
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-lg text-gray-400 max-w-lg"
            >
                Let's get your account set up. This will only take a few moments. We'll secure your profile and get you ready for the ultimate experience.
            </motion.p>

            {/* Firebase style "Get started" card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-8 p-1 rounded-2xl bg-gradient-to-r from-pink-500 to-sky-500"
            >
                <div className="bg-[#111] p-8 rounded-[14px] flex flex-col items-center text-center space-y-4 h-full">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500/20 to-sky-500/20 flex items-center justify-center border border-white/10">
                        <span className="text-2xl">🔥</span>
                    </div>
                    <h3 className="text-xl font-medium text-white">Get started by setting up your profile</h3>
                    <p className="text-sm text-gray-400">Configure your security, verify your identity, and personalize your workspace.</p>
                </div>
            </motion.div>
        </div>
    );
}