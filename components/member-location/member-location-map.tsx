// components/member-location/member-location-map.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Coordinates } from "@/lib/types/location";

interface MemberLocationMapProps {
    coordinates: Coordinates;
    address?: string | null;
    zoom?: number;
    height?: string;
    className?: string;
}

export function MemberLocationMap({
    coordinates,
    address,
    zoom = 15,
    height = "400px",
    className = "",
}: MemberLocationMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!mapRef.current || !coordinates) return;

        const loadMap = async () => {
            try {
                // Using Google Maps JavaScript API
                const google = (window as any).google;

                if (!google) {
                    // Load the API dynamically
                    const script = document.createElement("script");
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
                    script.async = true;
                    script.defer = true;

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }

                const googleMaps = (window as any).google.maps;

                // Create map
                const map = new googleMaps.Map(mapRef.current, {
                    center: { lat: coordinates.lat, lng: coordinates.lng },
                    zoom: zoom,
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                });

                // Add marker
                new googleMaps.Marker({
                    position: { lat: coordinates.lat, lng: coordinates.lng },
                    map: map,
                    title: address || "Member Location",
                    animation: googleMaps.Animation.DROP,
                });

                // Add info window with address
                if (address) {
                    const infoWindow = new googleMaps.InfoWindow({
                        content: `
                            <div style="padding: 8px; max-width: 200px;">
                                <strong>📍 Member Location</strong>
                                <p style="margin-top: 4px; font-size: 12px;">${address}</p>
                            </div>
                        `,
                    });

                    infoWindow.open(map, new googleMaps.Marker({
                        position: { lat: coordinates.lat, lng: coordinates.lng },
                        map: map,
                        visible: false,
                    }));
                }

                setIsLoading(false);
            } catch (err) {
                console.error("[Map] Failed to load:", err);
                setError("Failed to load map");
                setIsLoading(false);
            }
        };

        loadMap();

        return () => {
            // Cleanup map instance
            const mapElement = mapRef.current;
            if (mapElement) {
                mapElement.innerHTML = "";
            }
        };
    }, [coordinates, address, zoom]);

    if (error) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`} style={{ height }}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
            <div ref={mapRef} className="h-full w-full rounded-lg" />
        </div>
    );
}