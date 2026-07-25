// components/member-location/member-location-button.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { MemberLocationDrawer } from "./member-location-drawer";

interface MemberLocationButtonProps {
    memberId: string;
    memberName: string;
    houseNumber?: string | null;
    placeOfStay?: string | null;
    hasCoordinates: boolean;
}

export function MemberLocationButton({
    memberId,
    memberName,
    houseNumber,
    placeOfStay,
    hasCoordinates,
}: MemberLocationButtonProps) {
    const [open, setOpen] = useState(false);

    // If no coordinates, don't render anything
    if (!hasCoordinates) {
        return null;
    }

    return (
        <>
            <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setOpen(true)}
            >
                <MapPin className="h-4 w-4" />
                View Location
            </Button>

            <MemberLocationDrawer
                open={open}
                onOpenChange={setOpen}
                memberId={memberId}
                memberName={memberName}
                houseNumber={houseNumber}
                placeOfStay={placeOfStay}
            />
        </>
    );
}