

// components/mapbox/mapbox-map.tsx

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

interface MapboxMapProps {
    lng: number;
    lat: number;
    zoom?: number;
    marker?: boolean;
    markerColor?: string;
    onMove?: (lng: number, lat: number) => void;
    onMarkerClick?: () => void;
    className?: string;
    height?: string;
    interactive?: boolean;
    showControls?: boolean;
    popupContent?: React.ReactNode;
}

export function MapboxMap({
    lng,
    lat,
    zoom = 15,
    marker = true,
    markerColor = "#10b981",
    onMove,
    onMarkerClick,
    className,
    height = "400px",
    interactive = true,
    showControls = true,
    popupContent,
}: MapboxMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Get Mapbox token
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Initialize map
    useEffect(() => {
        if (!mapboxToken) {
            console.error("[Mapbox] Missing token");
            return;
        }

        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = mapboxToken;

        // Create map
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12",
            center: [lng, lat],
            zoom: zoom,
            interactive,
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
            setIsLoaded(true);
        });

        // Handle map move
        if (onMove) {
            map.current.on("move", () => {
                if (!map.current) return;
                const center = map.current.getCenter();
                onMove(center.lng, center.lat);
            });
        }

        // Cleanup
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
    }, [lng, lat, zoom, interactive, showControls, mapboxToken, onMove]);

    // Handle marker
    useEffect(() => {
        if (!map.current || !isLoaded) return;

        // Remove existing marker
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }

        if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
        }

        if (!marker) return;

        // Create marker element
        const el = document.createElement("div");
        el.className = "relative cursor-pointer";
        el.innerHTML = `
            <div style="
                width: 24px;
                height: 24px;
                background: ${markerColor};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                transition: transform 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                "></div>
            </div>
        `;

        // Hover effect
        el.addEventListener("mouseenter", () => {
            el.querySelector("div")?.style.setProperty("transform", "scale(1.2)");
        });
        el.addEventListener("mouseleave", () => {
            el.querySelector("div")?.style.setProperty("transform", "scale(1)");
        });

        // Click handler
        if (onMarkerClick) {
            el.addEventListener("click", onMarkerClick);
        }

        // Create marker
        markerRef.current = new mapboxgl.Marker({
            element: el,
            anchor: "center",
        })
            .setLngLat([lng, lat])
            .addTo(map.current);

        // Add popup
        if (popupContent) {
            popupRef.current = new mapboxgl.Popup({
                offset: 25,
                closeButton: true,
                closeOnClick: false,
                className: "mapbox-popup",
            })
                .setLngLat([lng, lat])
                .setHTML(
                    `<div class="p-2 max-w-xs">${typeof popupContent === "string" ? popupContent : "Location"}</div>`
                )
                .addTo(map.current);
        }

        // Fly to location
        map.current.flyTo({
            center: [lng, lat],
            zoom: zoom,
            essential: true,
            duration: 1000,
        });

        return () => {
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
            if (popupRef.current) {
                popupRef.current.remove();
                popupRef.current = null;
            }
        };
    }, [lng, lat, zoom, marker, markerColor, isLoaded, onMarkerClick, popupContent]);

    return (
        <div
            ref={mapContainer}
            className={cn("w-full rounded-lg overflow-hidden", className)}
            style={{ height }}
        />
    );
}