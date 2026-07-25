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
    ExternalLink,
    Navigation,
    Home,
    Map,
    Globe,
    X,
    CheckCircle2,
} from "lucide-react";
import type { GeocodeResult } from "@/lib/types/location";

interface MemberLocationDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    memberId: string;
    memberName: string;
    houseNumber?: string | null;
    placeOfStay?: string | null;
}

export function MemberLocationDrawer({
    open,
    onOpenChange,
    memberId,
    memberName,
    houseNumber,
    placeOfStay,
}: MemberLocationDrawerProps) {
    const { location, isLoading, error } = useMemberLocation(memberId);
    const [addressParts, setAddressParts] = useState<{
        neighborhood?: string;
        city?: string;
        region?: string;
        country?: string;
        postalCode?: string;
    }>({});

    useEffect(() => {
        if (location) {
            setAddressParts({
                neighborhood: location.neighborhood,
                city: location.city,
                region: location.region,
                country: location.country,
                postalCode: location.postalCode,
            });
        }
    }, [location]);

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
                                <DrawerDescription>
                                    View the GPS location and address of this member
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
                                    <MapPin className="h-8 w-8 text-destructive" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">Location Not Available</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    {error || "This member does not have GPS coordinates set."}
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

                                {/* Address Details */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold">📍 Address</h4>
                                        <div className="rounded-lg border p-4 space-y-2">
                                            {location.formattedAddress && (
                                                <p className="text-sm">{location.formattedAddress}</p>
                                            )}
                                            {addressParts.neighborhood && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Neighborhood:</span> {addressParts.neighborhood}
                                                </p>
                                            )}
                                            {addressParts.city && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">City:</span> {addressParts.city}
                                                </p>
                                            )}
                                            {addressParts.region && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Region:</span> {addressParts.region}
                                                </p>
                                            )}
                                            {addressParts.country && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Country:</span> {addressParts.country}
                                                </p>
                                            )}
                                            {addressParts.postalCode && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Postal Code:</span> {addressParts.postalCode}
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

                                {/* Member Info */}
                                {(houseNumber || placeOfStay) && (
                                    <div className="rounded-lg border p-4 bg-muted/30">
                                        <h4 className="text-sm font-semibold mb-2">🏠 Member Address Info</h4>
                                        <div className="grid gap-2 text-sm">
                                            {houseNumber && (
                                                <div className="flex items-center gap-2">
                                                    <Home className="h-4 w-4 text-muted-foreground" />
                                                    <span>House Number: <span className="font-medium">{houseNumber}</span></span>
                                                </div>
                                            )}
                                            {placeOfStay && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span>Place of Stay: <span className="font-medium">{placeOfStay}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

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
                                <h3 className="mt-4 text-lg font-semibold">No Location Set</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                    This member doesn't have GPS coordinates set. Please update their profile with location information.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}