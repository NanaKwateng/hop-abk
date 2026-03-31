// hooks/use-pwa-install.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
        appinstalled: Event;
    }
}

export function usePWAInstall() {
    const [installPrompt, setInstallPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already running as installed PWA
        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;
        setIsStandalone(standalone);

        // Detect iOS (no beforeinstallprompt support)
        const ios =
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !(window as any).MSStream;
        setIsIOS(ios);

        // Listen for the browser's install prompt
        const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
            // Prevent the default mini-infobar
            e.preventDefault();
            // Stash the event so we can trigger it later
            setInstallPrompt(e);
        };

        // Listen for successful installation
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const install = useCallback(async () => {
        if (!installPrompt) return false;

        // Show the browser's native install dialog
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === "accepted") {
            setIsInstalled(true);
            setInstallPrompt(null);
            return true;
        }

        return false;
    }, [installPrompt]);

    return {
        /** Whether the install prompt is available (browser supports it and app not yet installed) */
        canInstall: !!installPrompt && !isInstalled && !isStandalone,
        /** Whether this is iOS (needs manual Add to Home Screen instructions) */
        isIOS: isIOS && !isStandalone,
        /** Whether the app is already installed / running standalone */
        isInstalled: isInstalled || isStandalone,
        /** Trigger the native install dialog */
        install,
    };
}