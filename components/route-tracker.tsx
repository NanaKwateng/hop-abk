// components/route-tracker.tsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const LAST_ROUTE_KEY = "app:last-route-before-offline";

export function RouteTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (pathname && pathname !== "/offline") {
            sessionStorage.setItem(LAST_ROUTE_KEY, pathname);
        }
    }, [pathname]);

    return null;
}