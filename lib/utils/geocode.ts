// lib/utils/geocode.ts
"use server";

interface GeocodeResult {
    lat: number;
    lng: number;
    formattedAddress: string;
}

export async function geocodeAddress(
    address: string
): Promise<GeocodeResult | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error("Google Maps API key not configured");
        return null;
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                address
            )}&key=${apiKey}`,
            { next: { revalidate: 86400 } } // Cache for 24h
        );

        const data = await response.json();

        if (data.status === "OK" && data.results[0]) {
            const { lat, lng } = data.results[0].geometry.location;
            return {
                lat,
                lng,
                formattedAddress: data.results[0].formatted_address,
            };
        }

        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

export async function reverseGeocode(
    lat: number,
    lng: number
): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) return null;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
            { next: { revalidate: 86400 } }
        );

        const data = await response.json();

        if (data.status === "OK" && data.results[0]) {
            return data.results[0].formatted_address;
        }

        return null;
    } catch {
        return null;
    }
}