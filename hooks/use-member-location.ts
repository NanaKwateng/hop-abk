// hooks/use-member-location.ts

"use client";

import { useState, useEffect } from "react";
import { getMemberLocation } from "@/actions/location";
import type { GeocodeResult } from "@/lib/types/location";

export function useMemberLocation(memberId: string) {
    const [location, setLocation] = useState<GeocodeResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!memberId) {
            setIsLoading(false);
            return;
        }

        const fetchLocation = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await getMemberLocation(memberId);
                setLocation(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load location");
                setLocation(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocation();
    }, [memberId]);

    return { location, isLoading, error };
}