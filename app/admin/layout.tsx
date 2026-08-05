"use client";

import React, { useState, useEffect, useCallback } from "react";
import SimplicityCover from "@/components/dashboard/simplicity-cover";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { CustomizationProviderWrapper } from "@/components/providers/customization-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // 1. Force the cover state to be TRUE by default on every mount/refresh
    const [isCoverOpen, setIsCoverOpen] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // 2. Ensure hydration alignment
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 3. Global Key combination listener (Ctrl + L / Cmd + L)
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const isLockCombo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l";

        if (isLockCombo) {
            event.preventDefault();
            setIsCoverOpen(true);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div className="relative min-h-screen bg-background overflow-x-hidden">
            {/* 4. Simplicity 21 Cover Component (Always rendered on mount) */}
            <SimplicityCover
                isOpen={isCoverOpen}
                onContinue={() => setIsCoverOpen(false)}
            />

            {/* 5. Main Dashboard Content (Hidden visually until unlocked) */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isCoverOpen ? 0 : 1,
                    scale: isCoverOpen ? 0.95 : 1,
                    pointerEvents: isCoverOpen ? "none" : "auto",
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full min-h-screen ${isCoverOpen ? "h-screen overflow-hidden pointer-events-none select-none" : ""}`}
                aria-hidden={isCoverOpen}
            >
                <CustomizationProviderWrapper>
                    {children}
                </CustomizationProviderWrapper>
            </motion.div>

            {/* 6. Lock Button floating in the bottom-right corner when unlocked */}
            {isMounted && !isCoverOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCoverOpen(true)}
                    className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xl border border-white/20 focus:outline-none"
                    title="Lock App (Ctrl + L / Cmd + L)"
                >
                    <Lock className="h-5 w-5" />
                </motion.button>
            )}
        </div>
    );
}