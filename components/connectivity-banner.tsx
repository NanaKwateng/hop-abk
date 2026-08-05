// components/connectivity-banner.tsx
"use client";
import { useEffect, useState } from "react";
import { IoCloudOfflineOutline, IoRefreshOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function ConnectivityBanner() {
    const { status, reason, recheck } = useOnlineStatus();
    const [retrying, setRetrying] = useState(false);
    const [justReconnected, setJustReconnected] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        if (status === "offline") {
            setWasOffline(true);
            setJustReconnected(false);
        } else if (status === "online" && wasOffline) {
            setJustReconnected(true);
            setWasOffline(false);
            const t = setTimeout(() => setJustReconnected(false), 2500);
            return () => clearTimeout(t);
        }
    }, [status, wasOffline]);

    const handleRetry = async () => {
        setRetrying(true);
        const ok = await recheck();
        setRetrying(false);
        if (ok) window.location.reload();
    };

    if (status === "online" && !justReconnected) return null;

    return (
        <div role="alert" aria-live="assertive" className="fixed inset-x-0 bottom-4 z-[9999] flex justify-center px-4 pointer-events-none">
            <div
                className={`pointer-events-auto flex items-center gap-3 rounded-2xl border shadow-lg px-4 py-3 max-w-md w-full sm:w-auto backdrop-blur-md transition-all duration-300 ${justReconnected
                    ? "bg-emerald-600/95 border-emerald-500 text-white"
                    : "bg-neutral-900/95 border-neutral-700 text-white"
                    }`}
            >
                {justReconnected ? (
                    <>
                        <IoCheckmarkCircleOutline className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">Back online</p>
                    </>
                ) : (
                    <>
                        <IoCloudOfflineOutline className="h-5 w-5 shrink-0 text-red-400" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-tight">
                                {reason === "internet" ? "No internet connection" : "Can't reach the server"}
                            </p>
                            <p className="text-xs text-neutral-300 leading-tight mt-0.5">
                                {reason === "internet" ? "Check your Wi-Fi or mobile data." : "We'll keep retrying automatically."}
                            </p>
                        </div>
                        <button
                            onClick={handleRetry}
                            disabled={retrying}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold transition-colors"
                        >
                            <IoRefreshOutline className={`h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`} />
                            {retrying ? "Checking..." : "Retry"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}