// actions/location/geocode-location.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import type { GeocodeResult } from "@/lib/types/location";

interface ReverseGeocodeResponse {
    results: Array<{
        formatted_address: string;
        place_id: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
        address_components: Array<{
            long_name: string;
            short_name: string;
            types: string[];
        }>;
    }>;
    status: string;
}

/**
 * Get address from coordinates using Google Maps API
 */
export async function reverseGeocodeLocation(
    lat: number,
    lng: number
): Promise<GeocodeResult | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn("Google Maps API key not configured");
        return null;
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
            { next: { revalidate: 86400 } } // Cache for 24 hours
        );

        const data: ReverseGeocodeResponse = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0];
            const components = result.address_components || [];

            // Extract address components
            let neighborhood: string | undefined;
            let city: string | undefined;
            let region: string | undefined;
            let country: string | undefined;
            let postalCode: string | undefined;

            for (const comp of components) {
                const types = comp.types;
                if (types.includes("neighborhood") || types.includes("sublocality")) {
                    neighborhood = comp.long_name;
                }
                if (types.includes("locality")) {
                    city = comp.long_name;
                }
                if (types.includes("administrative_area_level_1")) {
                    region = comp.long_name;
                }
                if (types.includes("country")) {
                    country = comp.long_name;
                }
                if (types.includes("postal_code")) {
                    postalCode = comp.long_name;
                }
            }

            return {
                formattedAddress: result.formatted_address,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                placeId: result.place_id,
                neighborhood,
                city,
                region,
                country,
                postalCode,
            };
        }

        return null;
    } catch (error) {
        console.error("[Reverse Geocode] Error:", error);
        return null;
    }
}

/**
 * Get location data for a member by their GPS coordinates
 */
export async function getMemberLocation(memberId: string): Promise<GeocodeResult | null> {
    const supabase = await createClient();

    // Get member's GPS coordinates
    const { data, error } = await supabase
        .from("members")
        .select("gps_lat, gps_lng, place_of_stay, house_number")
        .eq("id", memberId)
        .single();

    if (error || !data) {
        console.error("[Get Member Location] Error:", error);
        return null;
    }

    const { gps_lat, gps_lng } = data;

    if (!gps_lat || !gps_lng) {
        return null;
    }

    // Reverse geocode to get address
    return reverseGeocodeLocation(gps_lat, gps_lng);
}

/**
 * Search for location by address
 */
export async function searchLocationByAddress(address: string): Promise<GeocodeResult | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || !address.trim()) {
        return null;
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
            { next: { revalidate: 86400 } }
        );

        const data: ReverseGeocodeResponse = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0];
            return {
                formattedAddress: result.formatted_address,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                placeId: result.place_id,
            };
        }

        return null;
    } catch (error) {
        console.error("[Search Location] Error:", error);
        return null;
    }
}