// lib/services/mapbox.ts

"use server";

import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

// Client-side token
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const SECRET_TOKEN = process.env.MAPBOX_SECRET_TOKEN;

export interface GeocodeResult {
    id: string;
    placeName: string;
    coordinates: [number, number]; // [lng, lat]
    address: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    neighborhood?: string;
    street?: string;
    houseNumber?: string;
}

export interface ReverseGeocodeResult {
    id: string;
    placeName: string;
    coordinates: [number, number];
    address: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    neighborhood?: string;
    street?: string;
    houseNumber?: string;
}

/**
 * Safely converts an unknown array/center to a [lng, lat] tuple
 */
function toCoordinatesTuple(center: any, fallback: [number, number] = [0, 0]): [number, number] {
    if (Array.isArray(center) && center.length >= 2) {
        return [Number(center[0]), Number(center[1])];
    }
    return fallback;
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(
    address: string,
    limit: number = 5
): Promise<GeocodeResult[]> {
    if (!PUBLIC_TOKEN) {
        console.warn("[Mapbox] Public token not configured");
        return [];
    }

    try {
        const geocodingClient = mbxGeocoding({ accessToken: PUBLIC_TOKEN });
        const response = await geocodingClient
            .forwardGeocode({
                query: address,
                limit,
                countries: ["gh"], // Restrict to Ghana
                types: ["address", "place", "neighborhood"],
            })
            .send();

        if (!response.body || !response.body.features) {
            return [];
        }

        return response.body.features.map((feature: any) => {
            const props = feature.properties || {};
            const context = feature.context || [];

            // Extract address components
            let city, region, country, postalCode, neighborhood;

            for (const ctx of context) {
                if (ctx.id.includes("place")) city = ctx.text;
                if (ctx.id.includes("region")) region = ctx.text;
                if (ctx.id.includes("country")) country = ctx.text;
                if (ctx.id.includes("postcode")) postalCode = ctx.text;
                if (ctx.id.includes("neighborhood")) neighborhood = ctx.text;
            }

            // Parse address
            const addressParts = feature.place_name?.split(",") || [];
            const houseNoStr = props.address ? String(props.address) : undefined;
            const streetName = houseNoStr || addressParts[0] || "";

            return {
                id: feature.id,
                placeName: feature.place_name || address,
                coordinates: toCoordinatesTuple(feature.center),
                address: feature.place_name || address,
                city,
                region,
                country,
                postalCode,
                neighborhood,
                street: streetName,
                houseNumber: houseNoStr,
            };
        });
    } catch (error) {
        console.error("[Mapbox] Geocoding error:", error);
        return [];
    }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(
    lng: number,
    lat: number
): Promise<ReverseGeocodeResult | null> {
    if (!PUBLIC_TOKEN) {
        console.warn("[Mapbox] Public token not configured");
        return null;
    }

    try {
        const geocodingClient = mbxGeocoding({ accessToken: PUBLIC_TOKEN });
        const response = await geocodingClient
            .reverseGeocode({
                // Explicit assertion prevents the 'number[]' to 'string' / '[number, number]' mismatch in SDK type definitions
                query: [lng, lat] as any,
                types: ["address", "place", "neighborhood"],
                limit: 1,
            })
            .send();

        if (!response.body || !response.body.features || response.body.features.length === 0) {
            return null;
        }

        const feature = response.body.features[0];
        const context = feature.context || [];
        const props = feature.properties || {};

        let city, region, country, postalCode, neighborhood;

        for (const ctx of context) {
            if (ctx.id.includes("place")) city = ctx.text;
            if (ctx.id.includes("region")) region = ctx.text;
            if (ctx.id.includes("country")) country = ctx.text;
            if (ctx.id.includes("postcode")) postalCode = ctx.text;
            if (ctx.id.includes("neighborhood")) neighborhood = ctx.text;
        }

        const addressParts = feature.place_name?.split(",") || [];
        const houseNoStr = props.address ? String(props.address) : undefined;

        return {
            id: feature.id,
            placeName: feature.place_name || "",
            coordinates: toCoordinatesTuple(feature.center, [lng, lat]),
            address: feature.place_name || "",
            city,
            region,
            country,
            postalCode,
            neighborhood,
            street: houseNoStr || addressParts[0] || "",
            houseNumber: houseNoStr,
        };
    } catch (error) {
        console.error("[Mapbox] Reverse geocoding error:", error);
        return null;
    }
}

/**
 * Generate static map image URL
 */
export async function getStaticMapUrl(
    lng: number,
    lat: number,
    zoom: number = 15,
    width: number = 600,
    height: number = 400,
    marker: boolean = true
): Promise<string> {
    if (!PUBLIC_TOKEN) {
        return "";
    }

    const rawStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12";
    const stylePath = rawStyle.replace("mapbox://styles/", "");
    const markerOverlay = marker ? `pin-s+10b981(${lng},${lat})/` : "";

    return `https://api.mapbox.com/styles/v1/${stylePath}/static/${markerOverlay}${lng},${lat},${zoom}/${width}x${height}@2x?access_token=${PUBLIC_TOKEN}`;
}

/**
 * Search for places (autocomplete)
 */
export async function searchPlaces(
    query: string,
    proximity: [number, number] = [0, 0]
): Promise<GeocodeResult[]> {
    if (!PUBLIC_TOKEN || !query || query.length < 2) {
        return [];
    }

    try {
        const geocodingClient = mbxGeocoding({ accessToken: PUBLIC_TOKEN });
        const response = await geocodingClient
            .forwardGeocode({
                query,
                limit: 10,
                countries: ["gh"],
                types: ["address", "place", "poi", "neighborhood"],
                proximity,
            })
            .send();

        if (!response.body || !response.body.features) {
            return [];
        }

        return response.body.features.map((feature: any) => {
            const context = feature.context || [];
            let city, region, country;

            for (const ctx of context) {
                if (ctx.id.includes("place")) city = ctx.text;
                if (ctx.id.includes("region")) region = ctx.text;
                if (ctx.id.includes("country")) country = ctx.text;
            }

            return {
                id: feature.id,
                placeName: feature.place_name || query,
                coordinates: toCoordinatesTuple(feature.center),
                address: feature.place_name || query,
                city,
                region,
                country,
            };
        });
    } catch (error) {
        console.error("[Mapbox] Search error:", error);
        return [];
    }
}

/**
 * Batch geocode multiple addresses
 */
export async function batchGeocodeAddresses(
    addresses: string[]
): Promise<Record<string, GeocodeResult | null>> {
    const results: Record<string, GeocodeResult | null> = {};

    const chunkSize = 5;
    for (let i = 0; i < addresses.length; i += chunkSize) {
        const chunk = addresses.slice(i, i + chunkSize);
        await Promise.all(
            chunk.map(async (address) => {
                const res = await geocodeAddress(address);
                results[address] = res.length > 0 ? res[0] : null;
            })
        );
    }

    return results;
}

/**
 * Get directions between two points
 */
export async function getDirections(
    startLng: number,
    startLat: number,
    endLng: number,
    endLat: number
): Promise<any> {
    if (!PUBLIC_TOKEN) {
        return null;
    }

    try {
        const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${PUBLIC_TOKEN}`
        );

        const data = await response.json();

        if (data.code !== "Ok") {
            return null;
        }

        return data.routes?.[0] || null;
    } catch (error) {
        console.error("[Mapbox] Directions error:", error);
        return null;
    }
}