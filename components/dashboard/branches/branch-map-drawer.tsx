// components/dashboard/branches/branch-map-drawer.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    ExternalLink,
    Navigation,
    Layers,
    Maximize2,
    X,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Branch } from "@/lib/types/branch";

interface BranchMapDrawerProps {
    branch: Branch;
    trigger?: React.ReactNode;
}

type MapStyle = "streets" | "satellite" | "light" | "dark";

export function BranchMapDrawer({ branch, trigger }: BranchMapDrawerProps) {
    const [open, setOpen] = useState(false);
    const [mapStyle, setMapStyle] = useState<MapStyle>("streets");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const popup = useRef<mapboxgl.Popup | null>(null);

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const hasCoordinates = branch.gpsLat && branch.gpsLng;

    const mapStyleUrls: Record<MapStyle, string> = {
        streets: "mapbox://styles/mapbox/streets-v12",
        satellite: "mapbox://styles/mapbox/satellite-streets-v12",
        light: "mapbox://styles/mapbox/light-v11",
        dark: "mapbox://styles/mapbox/dark-v11",
    };

    // Helper to safely add marker
    const addMarker = useCallback((lat: number, lng: number) => {
        if (!map.current) return;

        // Remove existing marker
        if (marker.current) {
            marker.current.remove();
            marker.current = null;
        }
        if (popup.current) {
            popup.current.remove();
            popup.current = null;
        }

        // Create custom marker element
        const el = document.createElement("div");
        el.className = "relative cursor-pointer";
        el.innerHTML = `
            <div style="
                width: 36px;
                height: 36px;
                background: #10b981;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s ease;
            ">
                <div style="
                    width: 12px;
                    height: 12px;
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
        marker.current = new mapboxgl.Marker({
            element: el,
            anchor: "center",
        })
            .setLngLat([lng, lat])
            .addTo(map.current);

        // Create popup with branch info
        const popupContent = `
            <div class="p-3 max-w-xs">
                <h4 class="font-semibold text-sm text-foreground">${branch.name}</h4>
                <p class="text-xs text-muted-foreground mt-0.5">${branch.location}</p>
                ${branch.address ? `<p class="text-xs text-muted-foreground mt-0.5">${branch.address}</p>` : ""}
                ${branch.gpsAddress ? `<p class="text-xs text-muted-foreground mt-0.5 font-mono">${branch.gpsAddress}</p>` : ""}
                ${branch.helpline ? `<p class="text-xs text-muted-foreground mt-1">📞 ${branch.helpline}</p>` : ""}
            </div>
        `;

        popup.current = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            className: "mapbox-popup",
            maxWidth: "300px",
        })
            .setLngLat([lng, lat])
            .setHTML(popupContent)
            .addTo(map.current);

        // Toggle popup on marker click
        el.addEventListener("click", () => {
            if (popup.current && map.current) {
                if (popup.current.isOpen()) {
                    popup.current.remove();
                } else {
                    popup.current.addTo(map.current);
                }
            }
        });

        // Fly to location with smooth animation
        map.current.flyTo({
            center: [lng, lat],
            zoom: 15,
            essential: true,
            duration: 1500,
            curve: 1.2,
        });
    }, [branch]);

    // Initialize map when drawer opens
    useEffect(() => {
        if (!open || !mapContainer.current || !mapboxToken) {
            return;
        }

        // Clean up existing map
        if (map.current) {
            map.current.remove();
            map.current = null;
        }

        setError(null);
        setIsLoading(true);

        try {
            mapboxgl.accessToken = mapboxToken;

            // Default center - use branch coordinates or fallback to Ghana
            const lng = branch.gpsLng || -1.19;
            const lat = branch.gpsLat || 5.55;
            const zoom = hasCoordinates ? 15 : 10;

            // Create map
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: mapStyleUrls[mapStyle],
                center: [lng, lat],
                zoom: zoom,
                attributionControl: true,
            });

            // Add navigation controls
            map.current.addControl(
                new mapboxgl.NavigationControl({
                    visualizePitch: true,
                    showZoom: true,
                    showCompass: true,
                }),
                "top-right"
            );

            // Add geolocation control
            map.current.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: { enableHighAccuracy: true },
                    trackUserLocation: true,
                    showUserHeading: true,
                }),
                "top-right"
            );

            // Add scale control
            map.current.addControl(
                new mapboxgl.ScaleControl({
                    maxWidth: 100,
                    unit: "metric",
                }),
                "bottom-right"
            );

            // Handle map load
            map.current.on("load", () => {
                setIsLoading(false);

                // Add marker if coordinates exist
                if (hasCoordinates && map.current) {
                    addMarker(lat, lng);
                }
            });

            // Handle errors
            map.current.on("error", (e) => {
                console.error("[Mapbox] Map error:", e);
                setError("Failed to load map. Please check your Mapbox configuration.");
                setIsLoading(false);
            });

            // Handle style errors
            map.current.on("style.error", (e) => {
                console.error("[Mapbox] Style error:", e);
                setError("Failed to load map style. Please try again.");
                setIsLoading(false);
            });

        } catch (err) {
            console.error("[Mapbox] Initialization error:", err);
            setError(err instanceof Error ? err.message : "Failed to initialize map");
            setIsLoading(false);
        }

        // Cleanup on unmount or drawer close
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
    }, [open, mapStyle, branch, hasCoordinates, mapboxToken, addMarker]);

    // Update marker when map style changes
    useEffect(() => {
        // ✅ FIXED: Check if map.current exists before calling .once()
        if (map.current && hasCoordinates && branch.gpsLat && branch.gpsLng) {
            // Use a timeout to let the style load
            const timeoutId = setTimeout(() => {
                if (map.current && marker.current) {
                    marker.current.remove();
                    marker.current = null;
                    addMarker(branch.gpsLat!, branch.gpsLng!);
                }
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [mapStyle, hasCoordinates, branch, addMarker]);

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

    const getMapLink = () => {
        if (hasCoordinates) {
            return `https://www.mapbox.com/directions?destination=${branch.gpsLng},${branch.gpsLat}`;
        }
        const query = encodeURIComponent(branch.gpsAddress || branch.location);
        return `https://www.mapbox.com/search?q=${query}`;
    };

    const getGoogleMapsLink = () => {
        if (hasCoordinates) {
            return `https://www.google.com/maps/dir/?api=1&destination=${branch.gpsLat},${branch.gpsLng}`;
        }
        const query = encodeURIComponent(branch.gpsAddress || branch.location);
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    };

    const getOSMLink = () => {
        if (hasCoordinates) {
            return `https://www.openstreetmap.org/?mlat=${branch.gpsLat}&mlon=${branch.gpsLng}&zoom=15`;
        }
        const query = encodeURIComponent(branch.gpsAddress || branch.location);
        return `https://www.openstreetmap.org/search?query=${query}`;
    };

    const styleOptions: { id: MapStyle; label: string }[] = [
        { id: "streets", label: "Streets" },
        { id: "satellite", label: "Satellite" },
        { id: "light", label: "Light" },
        { id: "dark", label: "Dark" },
    ];

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {trigger || (
                    <Button variant="secondary" size="sm" className="gap-2">
                        <Maximize2 className="h-3.5 w-3.5" />
                        View Full Map
                    </Button>
                )}
            </DrawerTrigger>

            <DrawerContent className="h-[92vh]">
                <DrawerHeader className="border-b bg-muted/30">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DrawerTitle className="text-xl flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                {branch.name} Location
                            </DrawerTitle>
                            <DrawerDescription className="flex items-center gap-2">
                                <Navigation className="h-3.5 w-3.5" />
                                {branch.location}
                            </DrawerDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Quick Info Bar */}
                    <div className="flex items-center gap-3 pt-3 flex-wrap">
                        {hasCoordinates && (
                            <Badge variant="secondary" className="text-xs gap-1">
                                <MapPin className="h-3 w-3" />
                                {branch.gpsLat?.toFixed(6)}, {branch.gpsLng?.toFixed(6)}
                            </Badge>
                        )}
                        {branch.gpsAddress && (
                            <Badge variant="outline" className="text-xs truncate max-w-xs">
                                {branch.gpsAddress}
                            </Badge>
                        )}
                        <Badge variant="default" className="text-xs gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                            <Layers className="h-3 w-3" />
                            Mapbox
                        </Badge>
                    </div>
                </DrawerHeader>

                {/* Map Controls */}
                <div className="flex items-center justify-between px-6 py-3 border-b bg-background flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        {styleOptions.map((style) => (
                            <Button
                                key={style.id}
                                variant={mapStyle === style.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setMapStyle(style.id)}
                                className="text-xs"
                            >
                                <Layers className="mr-1.5 h-3.5 w-3.5" />
                                {style.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs"
                        >
                            <a
                                href={getMapLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Navigation className="mr-1.5 h-3.5 w-3.5" />
                                Mapbox Directions
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs"
                        >
                            <a
                                href={getGoogleMapsLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                Google Maps
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs"
                        >
                            <a
                                href={getOSMLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                OpenStreetMap
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Map Container */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 relative bg-muted"
                >
                    {!mapboxToken ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <AlertCircle className="h-16 w-16 text-muted-foreground/30" />
                            <div className="text-center space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Mapbox token not configured
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env file
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <AlertCircle className="h-16 w-16 text-destructive/30" />
                            <div className="text-center space-y-2">
                                <p className="text-sm font-medium text-destructive">
                                    Failed to load map
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {error}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (map.current) {
                                            map.current.remove();
                                            map.current = null;
                                        }
                                        setIsLoading(true);
                                        setError(null);
                                        // Re-trigger map initialization
                                        setTimeout(() => {
                                            if (mapContainer.current) {
                                                const event = new Event('resize');
                                                window.dispatchEvent(event);
                                            }
                                        }, 100);
                                    }}
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Loading map...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={mapContainer} className="w-full h-full" />
                        </>
                    )}
                </motion.div>

                {/* Footer Info */}
                <div className="border-t bg-muted/30 px-6 py-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
                        <div className="flex items-center gap-4">
                            {branch.address && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {branch.address}
                                </span>
                            )}
                            {branch.helpline && (
                                <span className="flex items-center gap-1.5">
                                    📞 {branch.helpline}
                                </span>
                            )}
                        </div>
                        <span>
                            {hasCoordinates
                                ? "📍 Precise GPS coordinates"
                                : "📍 Approximate location"}
                        </span>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}