// components/member-location/member-location-drawer.tsx

"use client";

import { useState, useEffect } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MemberLocationMap } from "./member-location-map";
import { MemberLocationSkeleton } from "./member-location-skeleton";
import { useMemberLocation } from "@/hooks/use-member-location";
import { formatCoordinates, getGoogleMapsUrl, getOpenStreetMapUrl } from "@/lib/utils/location-utils";
import {
    MapPin,
    Navigation,
    Globe,
    X,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

interface MemberLocationDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    memberId: string;
    memberName: string;
    houseNumber?: string | null;
    placeOfStay?: string | null;
    hasGpsCoordinates: boolean;
}

export function MemberLocationDrawer({
    open,
    onOpenChange,
    memberId,
    memberName,
    houseNumber,
    placeOfStay,
    hasGpsCoordinates,
}: MemberLocationDrawerProps) {
    const { location, source, isLoading, error } = useMemberLocation(memberId);

    const handleOpenInGoogleMaps = () => {
        if (location) {
            window.open(getGoogleMapsUrl(location.lat, location.lng), "_blank");
        }
    };

    const handleOpenInOSM = () => {
        if (location) {
            window.open(getOpenStreetMapUrl(location.lat, location.lng), "_blank");
        }
    };

    const formattedAddress = location?.formattedAddress || placeOfStay || "Location not found";

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[95dvh] max-h-[95dvh] rounded-t-2xl">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <DrawerHeader className="border-b shrink-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <DrawerTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    {memberName}'s Location
                                </DrawerTitle>
                                <DrawerDescription className="flex items-center gap-2">
                                    {source === "gps" && (
                                        <Badge variant="default" className="text-xs gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            GPS Verified
                                        </Badge>
                                    )}
                                    {source === "address" && (
                                        <Badge variant="secondary" className="text-xs gap-1">
                                            <MapPin className="h-3 w-3" />
                                            From Address
                                        </Badge>
                                    )}
                                    {source === "none" && !isLoading && (
                                        <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                                            <AlertCircle className="h-3 w-3" />
                                            Location Not Found
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {formattedAddress}
                                    </span>
                                </DrawerDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                className="shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DrawerHeader>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoading ? (
                            <MemberLocationSkeleton />
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-destructive/10 p-4">
                                    <AlertCircle className="h-8 w-8 text-destructive" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">Location Not Available</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    {error || "Could not find location for this member."}
                                </p>
                            </div>
                        ) : location ? (
                            <>
                                {/* Map */}
                                <div className="rounded-lg overflow-hidden border">
                                    <MemberLocationMap
                                        coordinates={{ lat: location.lat, lng: location.lng }}
                                        address={location.formattedAddress}
                                        height="300px"
                                    />
                                </div>

                                {/* Location Source Info */}
                                <div className="rounded-lg border p-4 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Location Source</span>
                                        {source === "gps" ? (
                                            <Badge className="gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                GPS Coordinates
                                            </Badge>
                                        ) : source === "address" ? (
                                            <Badge variant="secondary" className="gap-1">
                                                <MapPin className="h-3 w-3" />
                                                Geocoded from Address
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Unknown
                                            </Badge>
                                        )}
                                    </div>
                                    {source === "address" && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Location was derived from the member's address:{" "}
                                            <strong>{formattedAddress}</strong>
                                        </p>
                                    )}
                                    {source === "gps" && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Location is based on exact GPS coordinates provided by the member.
                                        </p>
                                    )}
                                </div>

                                {/* Address Details */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold">📍 Address</h4>
                                        <div className="rounded-lg border p-4 space-y-2">
                                            {location.formattedAddress && (
                                                <p className="text-sm">{location.formattedAddress}</p>
                                            )}
                                            {placeOfStay && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Place of Stay:</span> {placeOfStay}
                                                </p>
                                            )}
                                            {houseNumber && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">House Number:</span> {houseNumber}
                                                </p>
                                            )}
                                            {location.city && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">City:</span> {location.city}
                                                </p>
                                            )}
                                            {location.region && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Region:</span> {location.region}
                                                </p>
                                            )}
                                            {location.country && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Country:</span> {location.country}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold">📌 GPS Coordinates</h4>
                                        <div className="rounded-lg border p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Latitude</span>
                                                <Badge variant="outline" className="font-mono">
                                                    {location.lat.toFixed(6)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Longitude</span>
                                                <Badge variant="outline" className="font-mono">
                                                    {location.lng.toFixed(6)}
                                                </Badge>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Formatted</span>
                                                <span className="text-sm font-mono">
                                                    {formatCoordinates(location.lat, location.lng)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Button
                                        variant="default"
                                        className="flex-1 gap-2"
                                        onClick={handleOpenInGoogleMaps}
                                    >
                                        <Navigation className="h-4 w-4" />
                                        Open in Google Maps
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 gap-2"
                                        onClick={handleOpenInOSM}
                                    >
                                        <Globe className="h-4 w-4" />
                                        Open in OpenStreetMap
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-muted p-4">
                                    <MapPin className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">No Location Found</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    {placeOfStay ? (
                                        <>
                                            Could not find coordinates for <strong>{placeOfStay}</strong>.
                                            {houseNumber && ` (${houseNumber})`}
                                            <br />
                                            Please check the address or add GPS coordinates manually.
                                        </>
                                    ) : (
                                        "This member doesn't have an address or GPS coordinates set."
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}