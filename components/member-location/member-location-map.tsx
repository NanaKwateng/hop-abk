// components/member-location/member-location-map.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    markerColor?: string;
}

export function MemberLocationMap({
    coordinates,
    address,
    zoom = 15,
    height = "400px",
    className = "",
    interactive = true,
    showControls = true,
    markerColor = "#10b981",
}: MemberLocationMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Initialize map
    useEffect(() => {
        if (!mapboxToken) {
            setError(
                "Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables."
            );
            setIsLoading(false);
            return;
        }

        if (!mapContainer.current || map.current) return;

        try {
            mapboxgl.accessToken = mapboxToken;

            // Create map with Mapbox style
            const mapStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12";

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: mapStyle,
                center: [coordinates.lng, coordinates.lat],
                zoom: zoom,
                interactive: interactive,
                attributionControl: true,
            });

            // Add navigation controls
            if (showControls && map.current) {
                // Navigation control (zoom in/out, compass)
                map.current.addControl(
                    new mapboxgl.NavigationControl({
                        visualizePitch: true,
                        showZoom: true,
                        showCompass: true,
                    }),
                    "top-right"
                );

                // Geolocation control (find my location)
                map.current.addControl(
                    new mapboxgl.GeolocateControl({
                        positionOptions: { enableHighAccuracy: true },
                        trackUserLocation: true,
                        showUserHeading: true,
                    }),
                    "top-right"
                );

                // Scale control
                map.current.addControl(
                    new mapboxgl.ScaleControl({
                        maxWidth: 100,
                        unit: "metric",
                    }),
                    "bottom-right"
                );
            }

            // Handle map load
            map.current.on("load", () => {
                setIsLoading(false);
            });

            // Handle errors
            map.current.on("error", (e) => {
                console.error("[Mapbox] Map error:", e);
                setError("Failed to load map. Please check your Mapbox configuration.");
                setIsLoading(false);
            });

            // Handle style load errors
            map.current.on("style.error", (e) => {
                console.error("[Mapbox] Style error:", e);
                setError("Failed to load map style. Please check your Mapbox style URL.");
                setIsLoading(false);
            });

        } catch (err) {
            console.error("[Mapbox] Initialization error:", err);
            setError(err instanceof Error ? err.message : "Failed to initialize map");
            setIsLoading(false);
        }

        // Cleanup on unmount
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
            if (popupRef.current) {
                popupRef.current.remove();
                popupRef.current = null;
            }
        };
    }, [coordinates.lat, coordinates.lng, zoom, mapboxToken, interactive, showControls]);

    // Handle marker and popup when map is ready
    useEffect(() => {
        if (!map.current || isLoading || !mapboxToken) return;

        // Remove existing marker if any
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }
        if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
        }

        try {
            // Create custom marker element
            const el = document.createElement("div");
            el.className = "relative cursor-pointer";
            el.innerHTML = `
                <div style="
                    width: 32px;
                    height: 32px;
                    background: ${markerColor};
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
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
            const markerDiv = el.querySelector("div");
            if (markerDiv) {
                el.addEventListener("mouseenter", () => {
                    markerDiv.style.transform = "scale(1.15)";
                });
                el.addEventListener("mouseleave", () => {
                    markerDiv.style.transform = "scale(1)";
                });
            }

            // Create marker
            markerRef.current = new mapboxgl.Marker({
                element: el,
                anchor: "center",
                draggable: false,
            })
                .setLngLat([coordinates.lng, coordinates.lat])
                .addTo(map.current);

            // Create popup with address
            const popupContent = `
                <div class="p-2 max-w-xs">
                    <p class="font-semibold text-sm text-foreground">📍 Member Location</p>
                    ${address ? `<p class="text-xs text-muted-foreground mt-1">${address}</p>` : ""}
                    <p class="text-xs text-muted-foreground mt-0.5 font-mono">
                        ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}
                    </p>
                </div>
            `;

            popupRef.current = new mapboxgl.Popup({
                offset: 25,
                closeButton: true,
                closeOnClick: false,
                className: "mapbox-popup",
                maxWidth: "300px",
            })
                .setLngLat([coordinates.lng, coordinates.lat])
                .setHTML(popupContent)
                .addTo(map.current);

            // Click marker to toggle popup - ✅ FIXED: Check if map.current exists
            el.addEventListener("click", () => {
                if (popupRef.current) {
                    if (popupRef.current.isOpen()) {
                        popupRef.current.remove();
                    } else {
                        // ✅ FIXED: Only add to map if map.current exists
                        if (map.current) {
                            popupRef.current.addTo(map.current);
                        }
                    }
                }
            });

            // Fly to location with smooth animation
            map.current.flyTo({
                center: [coordinates.lng, coordinates.lat],
                zoom: zoom,
                essential: true,
                duration: 1500,
                curve: 1.2,
            });

        } catch (err) {
            console.error("[Mapbox] Marker error:", err);
        }
    }, [coordinates.lat, coordinates.lng, zoom, isLoading, mapboxToken, markerColor, address]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (map.current) {
                map.current.resize();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (error) {
        return (
            <div
                className="flex flex-col items-center justify-center rounded-lg bg-muted/20"
                style={{ height }}
            >
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
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden rounded-lg", className)} style={{ height }}>
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                </div>
            )}
            <div ref={mapContainer} className="h-full w-full" />
        </div>
    );
}