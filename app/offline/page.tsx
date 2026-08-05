// app/offline/page.tsx
"use client";

import { useState } from "react";
import { IoCloudOfflineOutline, IoRefreshOutline } from "react-icons/io5";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { LAST_ROUTE_KEY } from "@/components/route-tracker";

const FALLBACK_ROUTE = "/admin";

export default function OfflinePage() {
    const { status, reason, recheck } = useOnlineStatus();
    const [retrying, setRetrying] = useState(false);

    const handleRetry = async () => {
        setRetrying(true);
        const isOnline = await recheck();
        setRetrying(false);

        if (isOnline) {
            const target = sessionStorage.getItem(LAST_ROUTE_KEY) || FALLBACK_ROUTE;
            sessionStorage.removeItem(LAST_ROUTE_KEY);
            // Hard navigation so the app re-fetches everything fresh
            // rather than resuming a stale client-side cache.
            window.location.href = target;
        }
    };

    return (
        <div className="min-h-[100dvh] bg-background flex items-center justify-center px-6">
            <div className="text-center max-w-sm space-y-4">
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center">
                        <IoCloudOfflineOutline className="h-8 w-8 text-muted-foreground" />
                    </div>
                </div>
                <h1 className="text-xl font-bold tracking-tight">You're Offline</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {reason === "server"
                        ? "We can reach the internet, but our server isn't responding right now. Please try again shortly."
                        : "It looks like you've lost your internet connection. Check your connection and try again."}
                </p>
                <button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60 transition-colors"
                >
                    <IoRefreshOutline className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
                    {retrying ? "Checking connection..." : "Try Again"}
                </button>
                {status === "offline" && (
                    <p className="text-xs text-muted-foreground/70">Still offline — this button will take you back in the moment it reconnects.</p>
                )}
            </div>
        </div>
    );
}