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

interface GeocodeResponse {
    results: Array<{
        formatted_address: string;
        place_id: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    }>;
    status: string;
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.warn("Google Maps API key not configured");
        return null;
    }

    if (!address || address.trim().length < 3) {
        return null;
    }

    try {
        const encodedAddress = encodeURIComponent(address.trim());
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`,
            { next: { revalidate: 86400 } } // Cache for 24 hours
        );

        const data: GeocodeResponse = await response.json();

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
        console.error("[Geocode Address] Error:", error);
        return null;
    }
}

/**
 * Search for location by address (alias for geocodeAddress)
 */
export async function searchLocationByAddress(address: string): Promise<GeocodeResult | null> {
    return geocodeAddress(address);
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
 * Get location data for a member by their GPS coordinates or address
 */
export async function getMemberLocation(memberId: string): Promise<{
    location: GeocodeResult | null;
    source: "gps" | "address" | "none";
}> {
    const supabase = await createClient();

    // Get member's address and GPS coordinates
    const { data, error } = await supabase
        .from("members")
        .select("gps_lat, gps_lng, place_of_stay, house_number")
        .eq("id", memberId)
        .single();

    if (error || !data) {
        console.error("[Get Member Location] Error:", error);
        return { location: null, source: "none" };
    }

    const { gps_lat, gps_lng, place_of_stay, house_number } = data;

    // 1. Try GPS coordinates first (most accurate)
    if (gps_lat && gps_lng) {
        const location = await reverseGeocodeLocation(gps_lat, gps_lng);
        if (location) {
            return { location, source: "gps" };
        }
    }

    // 2. Try geocoding the address
    if (place_of_stay) {
        // Build full address
        let fullAddress = place_of_stay;
        if (house_number) {
            fullAddress = `${house_number}, ${place_of_stay}`;
        }

        const location = await geocodeAddress(fullAddress);
        if (location) {
            return { location, source: "address" };
        }

        // Try with just the place of stay
        const fallbackLocation = await geocodeAddress(place_of_stay);
        if (fallbackLocation) {
            return { location: fallbackLocation, source: "address" };
        }
    }

    return { location: null, source: "none" };
}

/**
 * Batch geocode multiple addresses
 */
export async function batchGeocodeAddresses(
    addresses: string[]
): Promise<Map<string, GeocodeResult | null>> {
    const results = new Map<string, GeocodeResult | null>();

    // Process in parallel with rate limiting
    const promises = addresses.map(async (address) => {
        if (!address || address.trim().length < 3) {
            results.set(address, null);
            return;
        }

        try {
            const result = await geocodeAddress(address);
            results.set(address, result);
        } catch {
            results.set(address, null);
        }
    });

    await Promise.all(promises);
    return results;
}