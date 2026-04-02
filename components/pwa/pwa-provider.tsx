// components/pwa/pwa-provider.tsx
"use client";

import { useServiceWorker } from "@/hooks/use-service-worker";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";

export function PWAProvider({ children }: { children: React.ReactNode }) {
    useServiceWorker();

    return (
        <>
            {children}
            <InstallPrompt />
            <NotificationPrompt />
        </>
    );
}