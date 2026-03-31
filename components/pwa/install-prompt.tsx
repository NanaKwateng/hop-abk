// components/pwa/install-prompt.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import {
    IoDownloadOutline,
    IoCloseOutline,
    IoShareOutline,
    IoAddOutline,
    IoPhonePortraitOutline,
} from "react-icons/io5";
import { cn } from "@/lib/utils";

const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
const SPRING_BOUNCY = { type: "spring" as const, stiffness: 300, damping: 20 };

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days

export function InstallPrompt() {
    const { canInstall, isIOS, isInstalled, install } = usePWAInstall();
    const [visible, setVisible] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);

    useEffect(() => {
        // Don't show if already installed
        if (isInstalled) return;

        // Check if user previously dismissed
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            if (Date.now() - dismissedAt < DISMISS_DURATION) return;
        }

        // Show after a short delay for better UX
        const timer = setTimeout(() => {
            if (canInstall || isIOS) {
                setVisible(true);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [canInstall, isIOS, isInstalled]);

    function handleDismiss() {
        setVisible(false);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
    }

    async function handleInstall() {
        const success = await install();
        if (success) {
            setVisible(false);
        }
    }

    function handleIOSGuide() {
        setShowIOSGuide(true);
    }

    if (isInstalled) return null;

    return (
        <>
            {/* ── Main Install Banner ── */}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={SPRING_SNAPPY}
                        className="fixed bottom-0 inset-x-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
                    >
                        <div className="max-w-lg mx-auto">
                            <div className="relative rounded-2xl border bg-card shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
                                {/* Subtle gradient accent */}
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-violet-500" />

                                <div className="p-4 pt-5">
                                    {/* Close button */}
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={handleDismiss}
                                        className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                                    >
                                        <IoCloseOutline className="h-4 w-4 text-muted-foreground" />
                                    </motion.button>

                                    <div className="flex items-start gap-3.5">
                                        {/* App icon */}
                                        <motion.div
                                            initial={{ scale: 0, rotate: -20 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ ...SPRING_BOUNCY, delay: 0.1 }}
                                            className="shrink-0"
                                        >
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                                                <IoPhonePortraitOutline className="h-7 w-7 text-primary-foreground" />
                                            </div>
                                        </motion.div>

                                        <div className="flex-1 min-w-0 pr-6">
                                            <h3 className="text-sm font-bold tracking-tight text-foreground">
                                                Install HOP Church
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                Add to your home screen for instant access — no app
                                                store needed. Works offline too.
                                            </p>

                                            <div className="flex items-center gap-2 mt-3">
                                                {isIOS ? (
                                                    <motion.div whileTap={{ scale: 0.97 }}>
                                                        <Button
                                                            onClick={handleIOSGuide}
                                                            size="sm"
                                                            className="h-9 rounded-xl text-xs font-semibold gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                                                        >
                                                            <IoShareOutline className="h-3.5 w-3.5" />
                                                            Show Me How
                                                        </Button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div whileTap={{ scale: 0.97 }}>
                                                        <Button
                                                            onClick={handleInstall}
                                                            size="sm"
                                                            className="h-9 rounded-xl text-xs font-semibold gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                                                        >
                                                            <IoDownloadOutline className="h-3.5 w-3.5" />
                                                            Install App
                                                        </Button>
                                                    </motion.div>
                                                )}

                                                <motion.div whileTap={{ scale: 0.97 }}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleDismiss}
                                                        className="h-9 rounded-xl text-xs font-medium"
                                                    >
                                                        Not Now
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── iOS Guide Modal ── */}
            <AnimatePresence>
                {showIOSGuide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                        onClick={() => setShowIOSGuide(false)}
                    >
                        <motion.div
                            initial={{ y: 100, scale: 0.95 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 100, scale: 0.95 }}
                            transition={SPRING_SNAPPY}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm rounded-3xl bg-card border shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 pt-6 pb-4 text-center border-b">
                                <div className="flex justify-center mb-3">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <IoPhonePortraitOutline className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <h3 className="text-base font-bold tracking-tight">
                                    Install on iOS
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Follow these steps to add the app
                                </p>
                            </div>

                            {/* Steps */}
                            <div className="px-6 py-5 space-y-4">
                                <IOSStep
                                    step={1}
                                    icon={
                                        <IoShareOutline className="h-5 w-5 text-blue-500" />
                                    }
                                    title="Tap the Share button"
                                    description="Find the share icon in Safari&apos;s toolbar (bottom bar on iPhone)"
                                />
                                <IOSStep
                                    step={2}
                                    icon={
                                        <IoAddOutline className="h-5 w-5 text-emerald-500" />
                                    }
                                    title="Add to Home Screen"
                                    description="Scroll down in the share menu and tap this option"
                                />
                                <IOSStep
                                    step={3}
                                    icon={
                                        <IoDownloadOutline className="h-5 w-5 text-violet-500" />
                                    }
                                    title="Tap Add"
                                    description="Confirm the name and the app will appear on your home screen"
                                />
                                <IOSStep
                                    step={2}
                                    icon={
                                        <IoAddOutline className="h-5 w-5 text-emerald-500" />
                                    }
                                    title='"Add to Home Screen"'
                                    description="Scroll down in the share menu and tap this option"
                                />
                                <IOSStep
                                    step={3}
                                    icon={
                                        <IoDownloadOutline className="h-5 w-5 text-violet-500" />
                                    }
                                    title='Tap "Add"'
                                    description="Confirm the name and the app will appear on your home screen"
                                />
                            </div>

                            {/* Close */}
                            <div className="px-6 pb-6">
                                <motion.div whileTap={{ scale: 0.97 }}>
                                    <Button
                                        onClick={() => {
                                            setShowIOSGuide(false);
                                            handleDismiss();
                                        }}
                                        className="w-full h-11 rounded-2xl font-semibold text-sm bg-foreground text-background hover:bg-foreground/90"
                                    >
                                        Got It
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function IOSStep({
    step,
    icon,
    title,
    description,
}: {
    step: number;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING_SNAPPY, delay: step * 0.1 }}
            className="flex items-start gap-3"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}