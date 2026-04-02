// components/pwa/notification-prompt.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { IoNotificationsOutline, IoCloseOutline } from "react-icons/io5";

const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
const DISMISS_KEY = "notif-prompt-dismissed";

export function NotificationPrompt() {
    const { isSupported, permission, isSubscribed, subscribe } = usePushNotifications();
    const [visible, setVisible] = useState(() => {
        if (typeof window === "undefined") return false;
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            // Show again after 7 days
            if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return false;
        }
        return true;
    });
    const [loading, setLoading] = useState(false);

    // Don't show if not supported, already subscribed, denied, or dismissed
    if (!isSupported || isSubscribed || permission === "denied" || !visible) {
        return null;
    }

    async function handleEnable() {
        setLoading(true);
        await subscribe();
        setLoading(false);
        setVisible(false);
    }

    function handleDismiss() {
        setVisible(false);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    transition={SPRING_SNAPPY}
                    className="fixed top-4 inset-x-4 z-[100] sm:left-auto sm:right-4 sm:max-w-sm"
                >
                    <div className="rounded-2xl border bg-card shadow-lg p-4">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 h-6 w-6 rounded-full bg-muted/60 flex items-center justify-center"
                        >
                            <IoCloseOutline className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>

                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                <IoNotificationsOutline className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 pr-4">
                                <p className="text-sm font-semibold">Stay Updated</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Get notified about payment reminders and church announcements.
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        size="sm"
                                        onClick={handleEnable}
                                        disabled={loading}
                                        className="h-8 rounded-xl text-xs font-semibold"
                                    >
                                        {loading ? "Enabling..." : "Enable"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDismiss}
                                        className="h-8 rounded-xl text-xs"
                                    >
                                        Later
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}