// components/member-location/member-location-button.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { MemberLocationDrawer } from "./member-location-drawer";

interface MemberLocationButtonProps {
    memberId: string;
    memberName: string;
    houseNumber?: string | null;
    placeOfStay?: string | null;
    hasGpsCoordinates: boolean;
    hasAddress: boolean;
    isLoading?: boolean;
}

export function MemberLocationButton({
    memberId,
    memberName,
    houseNumber,
    placeOfStay,
    hasGpsCoordinates,
    hasAddress,
    isLoading = false,
}: MemberLocationButtonProps) {
    const [open, setOpen] = useState(false);

    // If no location data at all, don't render
    if (!hasGpsCoordinates && !hasAddress) {
        return null;
    }

    return (
        <>
            <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setOpen(true)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <MapPin className="h-4 w-4" />
                )}
                {isLoading ? "Loading location..." : "View Location"}
                {hasGpsCoordinates ? (
                    <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                        GPS
                    </span>
                ) : hasAddress ? (
                    <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">
                        Address
                    </span>
                ) : null}
            </Button>

            <MemberLocationDrawer
                open={open}
                onOpenChange={setOpen}
                memberId={memberId}
                memberName={memberName}
                houseNumber={houseNumber}
                placeOfStay={placeOfStay}
                hasGpsCoordinates={hasGpsCoordinates}
            />
        </>
    );
}