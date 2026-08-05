// hooks/use-online-status.ts
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type ConnectionState = "online" | "offline";
type OfflineReason = "internet" | "server" | null;

export function useOnlineStatus(pingUrl = "/api/health", pingInterval = 15000) {
    const [status, setStatus] = useState<ConnectionState>("online");
    const [reason, setReason] = useState<OfflineReason>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const checkServer = useCallback(async () => {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            setStatus("offline");
            setReason("internet");
            return false;
        }
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(pingUrl, { cache: "no-store", signal: controller.signal });
            clearTimeout(timeout);

            if (res.ok) {
                setStatus("online");
                setReason(null);
                return true;
            }
            setStatus("offline");
            setReason("server");
            return false;
        } catch {
            const stillHasNetwork = typeof navigator !== "undefined" && navigator.onLine;
            setStatus("offline");
            setReason(stillHasNetwork ? "server" : "internet");
            return false;
        }
    }, [pingUrl]);

    useEffect(() => {
        const handleOffline = () => {
            setStatus("offline");
            setReason("internet");
        };
        const handleOnline = () => checkServer();

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        checkServer();
        intervalRef.current = setInterval(checkServer, pingInterval);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [checkServer, pingInterval]);

    return { status, reason, recheck: checkServer };
}