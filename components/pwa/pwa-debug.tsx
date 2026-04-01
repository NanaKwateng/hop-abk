// components/pwa/pwa-debug.tsx
"use client";

import { useEffect, useState } from "react";

export function PWADebug() {
    const [status, setStatus] = useState<string[]>([]);

    useEffect(() => {
        const checks: string[] = [];

        // Check 1: Is service worker supported?
        if ("serviceWorker" in navigator) {
            checks.push("✅ Service Worker API supported");
        } else {
            checks.push("❌ Service Worker API NOT supported");
        }

        // Check 2: Is this HTTPS?
        if (location.protocol === "https:" || location.hostname === "localhost") {
            checks.push("✅ HTTPS or localhost");
        } else {
            checks.push("❌ Not HTTPS — PWA won't work");
        }

        // Check 3: Check manifest
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            checks.push(`✅ Manifest linked: ${manifestLink.getAttribute("href")}`);
        } else {
            checks.push("❌ No manifest link found in HTML");
        }

        // Check 4: Try to fetch manifest
        fetch("/manifest.json")
            .then((res) => {
                if (res.ok) {
                    checks.push("✅ manifest.json accessible");
                } else {
                    checks.push(`❌ manifest.json returned ${res.status}`);
                }
            })
            .catch(() => {
                checks.push("❌ manifest.json fetch failed");
            })
            .finally(() => {
                // Check 5: Try to fetch service worker
                fetch("/sw.js")
                    .then((res) => {
                        if (res.ok) {
                            checks.push("✅ sw.js accessible");
                        } else {
                            checks.push(`❌ sw.js returned ${res.status}`);
                        }
                    })
                    .catch(() => {
                        checks.push("❌ sw.js fetch failed");
                    })
                    .finally(() => {
                        // Check 6: Try to fetch icon
                        fetch("/icons/icon-192x192.png")
                            .then((res) => {
                                if (res.ok) {
                                    checks.push("✅ icon-192x192.png accessible");
                                } else {
                                    checks.push(`❌ icon-192x192.png returned ${res.status}`);
                                }
                            })
                            .catch(() => {
                                checks.push("❌ icon-192x192.png fetch failed");
                            })
                            .finally(() => {
                                // Check 7: Service worker registration status
                                navigator.serviceWorker?.getRegistrations().then((regs) => {
                                    if (regs.length > 0) {
                                        checks.push(`✅ ${regs.length} service worker(s) registered`);
                                    } else {
                                        checks.push("⚠️ No service workers registered yet");
                                    }
                                    setStatus([...checks]);
                                });
                            });
                    });
            });

        // Check 8: Listen for install prompt
        const handlePrompt = () => {
            checks.push("✅ beforeinstallprompt fired — app is installable!");
            setStatus([...checks]);
        };
        window.addEventListener("beforeinstallprompt", handlePrompt);

        setStatus(checks);

        return () => {
            window.removeEventListener("beforeinstallprompt", handlePrompt);
        };
    }, []);

    // Only show in development or with ?debug query param
    if (typeof window !== "undefined" && !window.location.search.includes("debug")) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 z-[9999] max-w-sm bg-black/90 text-white text-xs rounded-2xl p-4 space-y-1 font-mono">
            <p className="font-bold text-sm mb-2">PWA Debug</p>
            {status.map((s, i) => (
                <p key={i}>{s}</p>
            ))}
        </div>
    );
}