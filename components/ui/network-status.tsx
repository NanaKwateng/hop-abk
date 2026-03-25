// components/ui/network-status.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./button";

export function NetworkStatus() {
    const [isOffline, setIsOffline] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => {
            setIsOffline(false);
            setIsRefreshing(false);
            // Optionally refresh the current route to fetch latest data on reconnect
            router.refresh();
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        // Check initial state gracefully
        if (typeof window !== "undefined" && !navigator.onLine) {
            setIsOffline(true);
        }

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, [router]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Force a hard reload if they want to manually retry
        window.location.reload();
    };

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 bg-zinc-900/95 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-2xl border border-white/10"
                >
                    <div className="flex items-center justify-center bg-red-500/20 p-2 rounded-full">
                        <WifiOff className="w-4 h-4 text-red-400" />
                    </div>

                    <div className="flex flex-col pr-2">
                        <span className="text-sm font-semibold tracking-wide">
                            Connection Lost
                        </span>
                        <span className="text-[11px] text-zinc-400 leading-tight">
                            Saving actions to queue. App may be slower.
                        </span>
                    </div>

                    <div className="w-[1px] h-8 bg-zinc-700 mx-1" />

                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-95 disabled:opacity-50 group"
                        title="Retry Connection"
                    >
                        <RefreshCcw
                            className={`w-4 h-4 text-white group-hover:text-blue-400 transition-colors ${isRefreshing ? "animate-spin text-blue-400" : ""
                                }`}
                        />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}