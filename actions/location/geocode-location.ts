// actions/location/geocode-location.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { geocodeAddress, reverseGeocode, batchGeocodeAddresses } from "@/lib/services/mapbox";
import type { GeocodeResult } from "@/lib/types/location";

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
        const location = await reverseGeocode(gps_lng, gps_lat);
        if (location) {
            return {
                location: {
                    lat: location.coordinates[1],
                    lng: location.coordinates[0],
                    formattedAddress: location.address,
                    placeId: location.id,
                    city: location.city,
                    region: location.region,
                    country: location.country,
                    postalCode: location.postalCode,
                    neighborhood: location.neighborhood,
                },
                source: "gps",
            };
        }
    }

    // 2. Try geocoding the address
    if (place_of_stay) {
        // Build full address
        let fullAddress = place_of_stay;
        if (house_number) {
            fullAddress = `${house_number}, ${place_of_stay}`;
        }

        const results = await geocodeAddress(fullAddress);
        if (results && results.length > 0) {
            const result = results[0];
            return {
                location: {
                    lat: result.coordinates[1],
                    lng: result.coordinates[0],
                    formattedAddress: result.address,
                    placeId: result.id,
                    city: result.city,
                    region: result.region,
                    country: result.country,
                    postalCode: result.postalCode,
                    neighborhood: result.neighborhood,
                },
                source: "address",
            };
        }

        // Try with just the place of stay
        const fallbackResults = await geocodeAddress(place_of_stay);
        if (fallbackResults && fallbackResults.length > 0) {
            const result = fallbackResults[0];
            return {
                location: {
                    lat: result.coordinates[1],
                    lng: result.coordinates[0],
                    formattedAddress: result.address,
                    placeId: result.id,
                    city: result.city,
                    region: result.region,
                    country: result.country,
                    postalCode: result.postalCode,
                    neighborhood: result.neighborhood,
                },
                source: "address",
            };
        }
    }

    return { location: null, source: "none" };
}

/**
 * Geocode an address (wrapper for Mapbox geocoding)
 */
export async function geocodeMemberAddress(address: string): Promise<{
    lat: number;
    lng: number;
    formattedAddress: string;
} | null> {
    const results = await geocodeAddress(address);
    if (!results || results.length === 0) return null;

    const result = results[0];
    return {
        lat: result.coordinates[1],
        lng: result.coordinates[0],
        formattedAddress: result.address,
    };
}

/**
 * Batch geocode multiple member addresses
 */
export async function batchGeocodeMemberAddresses(
    addresses: string[]
): Promise<Record<string, { lat: number; lng: number; formattedAddress: string } | null>> {
    const results = await batchGeocodeAddresses(addresses);
    const formattedResults: Record<string, { lat: number; lng: number; formattedAddress: string } | null> = {};

    for (const [address, result] of Object.entries(results)) {
        if (result) {
            formattedResults[address] = {
                lat: result.coordinates[1],
                lng: result.coordinates[0],
                formattedAddress: result.address,
            };
        } else {
            formattedResults[address] = null;
        }
    }

    return formattedResults;
}