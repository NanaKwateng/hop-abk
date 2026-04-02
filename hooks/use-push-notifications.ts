// hooks/use-push-notifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
}

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        const supported =
            typeof window !== "undefined" &&
            "Notification" in window &&
            "serviceWorker" in navigator &&
            "PushManager" in window;

        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission);

            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((sub) => {
                    setSubscription(sub);
                });
            });
        }
    }, []);

    const subscribe = useCallback(async () => {
        if (!isSupported) return null;

        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== "granted") return null;

            const registration = await navigator.serviceWorker.ready;

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            setSubscription(sub);

            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscription: sub.toJSON(),
                }),
            });

            return sub;
        } catch (error) {
            console.error("[Push] Subscribe failed:", error);
            return null;
        }
    }, [isSupported]);

    const unsubscribe = useCallback(async () => {
        if (!subscription) return;

        try {
            await subscription.unsubscribe();

            await fetch("/api/push/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                }),
            });

            setSubscription(null);
        } catch (error) {
            console.error("[Push] Unsubscribe failed:", error);
        }
    }, [subscription]);

    return {
        isSupported,
        permission,
        subscription,
        subscribe,
        unsubscribe,
        isSubscribed: !!subscription,
    };
}