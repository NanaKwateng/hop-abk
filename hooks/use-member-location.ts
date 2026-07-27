// hooks/use-member-location.ts

"use client";

import { useState, useEffect } from "react";
import { getMemberLocation } from "@/actions/location";
import type { GeocodeResult } from "@/lib/types/location";

interface UseMemberLocationReturn {
    location: GeocodeResult | null;
    source: "gps" | "address" | "none";
    isLoading: boolean;
    error: string | null;
}

export function useMemberLocation(memberId: string): UseMemberLocationReturn {
    const [location, setLocation] = useState<GeocodeResult | null>(null);
    const [source, setSource] = useState<"gps" | "address" | "none">("none");
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
                setLocation(result.location);
                setSource(result.source);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load location");
                setLocation(null);
                setSource("none");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocation();
    }, [memberId]);

    return { location, source, isLoading, error };
}