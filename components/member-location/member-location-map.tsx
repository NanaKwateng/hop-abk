// components/member-location/member-location-map.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2 } from "lucide-react";

interface MemberLocationMapProps {
    coordinates: {
        lat: number;
        lng: number;
    };
    address?: string | null;
    zoom?: number;
    height?: string;
    className?: string;
    interactive?: boolean;
    showControls?: boolean;
}

export function MemberLocationMap({
    coordinates,
    address,
    zoom = 15,
    height = "400px",
    className = "",
    interactive = true,
    showControls = true,
}: MemberLocationMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const popup = useRef<mapboxgl.Popup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    useEffect(() => {
        if (!mapboxToken) {
            setError("Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment.");
            setIsLoading(false);
            return;
        }

        if (!mapContainer.current || map.current) return;

        try {
            mapboxgl.accessToken = mapboxToken;

            // Create map
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12",
                center: [coordinates.lng, coordinates.lat],
                zoom: zoom,
                interactive: interactive,
            });

            // Add navigation controls
            if (showControls && map.current) {
                map.current.addControl(
                    new mapboxgl.NavigationControl({
                        visualizePitch: true,
                    }),
                    "top-right"
                );

                map.current.addControl(
                    new mapboxgl.GeolocateControl({
                        positionOptions: { enableHighAccuracy: true },
                        trackUserLocation: true,
                    }),
                    "top-right"
                );
            }

            // Handle map load
            map.current.on("load", () => {
                setIsLoading(false);
            });

            // Handle errors
            map.current.on("error", (e) => {
                console.error("[Mapbox] Map error:", e);
                setError("Failed to load map");
                setIsLoading(false);
            });

            // Create marker
            if (map.current) {
                // Create custom marker element
                const el = document.createElement("div");
                el.className = "relative cursor-pointer";
                el.innerHTML = `
                    <div style="
                        width: 32px;
                        height: 32px;
                        background: #10b981;
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: transform 0.2s;
                    ">
                        <div style="
                            width: 10px;
                            height: 10px;
                            background: white;
                            border-radius: 50%;
                        "></div>
                    </div>
                `;

                // Hover effect
                el.addEventListener("mouseenter", () => {
                    const div = el.querySelector("div");
                    if (div) div.style.transform = "scale(1.15)";
                });
                el.addEventListener("mouseleave", () => {
                    const div = el.querySelector("div");
                    if (div) div.style.transform = "scale(1)";
                });

                // Create marker
                marker.current = new mapboxgl.Marker({
                    element: el,
                    anchor: "center",
                })
                    .setLngLat([coordinates.lng, coordinates.lat])
                    .addTo(map.current);

                // Add popup
                if (address) {
                    popup.current = new mapboxgl.Popup({
                        offset: 25,
                        closeButton: true,
                        closeOnClick: false,
                        className: "mapbox-popup",
                    })
                        .setLngLat([coordinates.lng, coordinates.lat])
                        .setHTML(`
                            <div class="p-2 max-w-xs">
                                <p class="font-semibold text-sm">📍 Member Location</p>
                                <p class="text-xs text-muted-foreground mt-1">${address}</p>
                                <p class="text-xs text-muted-foreground mt-0.5">
                                    ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}
                                </p>
                            </div>
                        `)
                        .addTo(map.current);
                }

                // Fly to location
                map.current.flyTo({
                    center: [coordinates.lng, coordinates.lat],
                    zoom: zoom,
                    essential: true,
                    duration: 1500,
                });
            }
        } catch (err) {
            console.error("[Mapbox] Initialization error:", err);
            setError(err instanceof Error ? err.message : "Failed to initialize map");
            setIsLoading(false);
        }

        // Cleanup
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
            if (marker.current) {
                marker.current.remove();
                marker.current = null;
            }
            if (popup.current) {
                popup.current.remove();
                popup.current = null;
            }
        };
    }, [coordinates.lat, coordinates.lng, zoom, address, mapboxToken, interactive, showControls]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg bg-muted/20" style={{ height }}>
                <div className="rounded-full bg-destructive/10 p-3 mb-3">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-sm px-4">
                    {error}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-3 text-sm text-primary hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`} style={{ height }}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10 rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            )}
            <div ref={mapContainer} className="h-full w-full rounded-lg" />
        </div>
    );
}

// Import AlertCircle for error state
import { AlertCircle } from "lucide-react";