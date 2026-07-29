// lib/utils/location-utils.ts

import type { Coordinates, LocationData } from "@/lib/types/location";

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
    const latDir = lat >= 0 ? "N" : "S";
    const lngDir = lng >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
}

// ─── MAPBOX (Primary) ───

/**
 * Get Mapbox Directions URL (Primary)
 */
export function getMapboxDirectionsUrl(lat: number, lng: number): string {
    return `https://www.mapbox.com/directions?destination=${lng},${lat}`;
}

/**
 * Get Mapbox Static Map URL
 */
export function getMapboxStaticMapUrl(
    lat: number,
    lng: number,
    zoom: number = 15,
    width: number = 600,
    height: number = 400,
    marker: boolean = true
): string {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return "";

    const style = process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12";
    const markerStyle = marker ? `pin-s+10b981(${lng},${lat})` : "";
    const center = `${lng},${lat},${zoom}`;

    return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${markerStyle}/${center}/${width}x${height}@2x?access_token=${token}`;
}

/**
 * Get Mapbox Search URL (for address lookup)
 */
export function getMapboxSearchUrl(query: string): string {
    return `https://www.mapbox.com/search?q=${encodeURIComponent(query)}`;
}

// ─── GOOGLE MAPS (Fallback) ───

/**
 * Get Google Maps URL (Fallback)
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Get Google Maps embed URL
 */
export function getGoogleMapsEmbedUrl(lat: number, lng: number): string {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return `https://www.google.com/maps?q=${lat},${lng}`;
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
}

// ─── OPENSTREETMAP (Open Source Fallback) ───

/**
 * Get OpenStreetMap URL
 */
export function getOpenStreetMapUrl(lat: number, lng: number): string {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
}

// ─── UTILITY FUNCTIONS ───

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(lat: number | null, lng: number | null): boolean {
    if (lat === null || lng === null) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
}

/**
 * Get the best map URL based on available services
 * Priority: Mapbox → Google Maps → OpenStreetMap
 */
export function getBestMapUrl(lat: number, lng: number): string {
    // Check if Mapbox is available
    const hasMapbox = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (hasMapbox) {
        return getMapboxDirectionsUrl(lat, lng);
    }
    // Fallback to Google Maps
    return getGoogleMapsUrl(lat, lng);
}