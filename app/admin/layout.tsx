"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import SimplicityCover from "@/components/dashboard/simplicity-cover";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCoverOpen, setIsCoverOpen] = useState(true);

    // Re-open cover page when navigating to root /admin route directly
    useEffect(() => {
        if (pathname === "/admin") {
            setIsCoverOpen(true);
        }
    }, [pathname]);

    // Keydown handler for shortcut combinations
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Option 1: Ctrl + L or Cmd + L
        const isLockCombo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l";

        // Option 2: Escape key (uncomment if desired)
        // const isEscapeKey = event.key === "Escape";

        if (isLockCombo) {
            event.preventDefault(); // Prevent browser default (e.g., focusing address bar on Ctrl+L)
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
        <div className="relative min-h-screen bg-background">
            {/* Simplicity 21 Cover Layer */}
            <SimplicityCover
                isOpen={isCoverOpen}
                onContinue={() => setIsCoverOpen(false)}
            />

            {/* Main Admin Application Content */}
            <motion.div
                initial={false}
                animate={{
                    scale: isCoverOpen ? 0.96 : 1,
                    opacity: isCoverOpen ? 0.4 : 1,
                    filter: isCoverOpen ? "blur(4px)" : "blur(0px)"
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full min-h-screen"
            >
                {children}
            </motion.div>

            {/* Floating Lock Button */}
            {!isCoverOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCoverOpen(true)}
                    className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xl border border-white/20"
                    title="Lock screen (Ctrl + L)"
                >
                    <Lock className="h-5 w-5" />
                </motion.button>
            )}
        </div>
    );
}