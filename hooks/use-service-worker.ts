// hooks/use-service-worker.ts
"use client";

import { useEffect } from "react";

export function useServiceWorker() {
    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !("serviceWorker" in navigator)
        ) {
            return;
        }

        // Register service worker after page load
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("/sw.js", { scope: "/" })
                .then((registration) => {
                    console.log("[SW] Registered:", registration.scope);

                    // Check for updates periodically
                    registration.addEventListener("updatefound", () => {
                        const newWorker = registration.installing;
                        if (!newWorker) return;

                        newWorker.addEventListener("statechange", () => {
                            if (
                                newWorker.state === "activated" &&
                                navigator.serviceWorker.controller
                            ) {
                                // New version available — could show toast here
                                console.log("[SW] New version available");
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error("[SW] Registration failed:", error);
                });
        });
    }, []);
}