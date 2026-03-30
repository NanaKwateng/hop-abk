// components/dashboard/branches/branch-map-drawer.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import type { Branch } from "@/lib/types/branch";

interface BranchMapDrawerProps {
    branch: Branch;
    trigger?: React.ReactNode;
}

export function BranchMapDrawer({ branch, trigger }: BranchMapDrawerProps) {
    const [open, setOpen] = useState(false);
    const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

    const hasCoordinates = branch.gpsLat && branch.gpsLng;
    const mapQuery = hasCoordinates
        ? `${branch.gpsLat},${branch.gpsLng}`
        : encodeURIComponent(branch.gpsAddress || branch.location);

    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${mapQuery}&zoom=15&maptype=${mapType}`;
    const directionsUrl = hasCoordinates
        ? `https://www.google.com/maps/dir/?api=1&destination=${branch.gpsLat},${branch.gpsLng}`
        : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

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
                    <div className="flex items-center gap-3 pt-3">
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
                    </div>
                </DrawerHeader>

                {/* Map Controls */}
                <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={mapType === "roadmap" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMapType("roadmap")}
                            className="text-xs"
                        >
                            <Layers className="mr-1.5 h-3.5 w-3.5" />
                            Road
                        </Button>
                        <Button
                            variant={mapType === "satellite" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMapType("satellite")}
                            className="text-xs"
                        >
                            <Layers className="mr-1.5 h-3.5 w-3.5" />
                            Satellite
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs"
                        >
                            <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Navigation className="mr-1.5 h-3.5 w-3.5" />
                                Get Directions
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs"
                        >
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                Open in Maps
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
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                        <iframe
                            src={embedUrl}
                            className="w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <MapPin className="h-16 w-16 text-muted-foreground/30" />
                            <div className="text-center space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Google Maps API key not configured
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Footer Info */}
                <div className="border-t bg-muted/30 px-6 py-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            {branch.address && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {branch.address}
                                </span>
                            )}
                        </div>
                        <span>
                            {hasCoordinates
                                ? "Precise GPS coordinates"
                                : "Approximate location"}
                        </span>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}