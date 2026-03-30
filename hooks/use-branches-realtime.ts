// hooks/use-branches-realtime.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Branch, BranchRow } from "@/lib/types/branch";

// Helper to map DB row to client type
function mapRowToBranch(row: BranchRow): Branch {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        location: row.location,
        address: row.address,
        gpsLat: row.gps_lat,
        gpsLng: row.gps_lng,
        gpsAddress: row.gps_address,
        membershipSize: row.membership_size,
        helpline: row.helpline,
        yearEstablished: row.year_established,
        leaderPosition: row.leader_position as Branch["leaderPosition"],
        leaderFullName: row.leader_full_name,
        leaderContact: row.leader_contact,
        leaderEmail: row.leader_email,
        leaderAvatarUrl: row.leader_avatar_url,
        leaderPlaceOfStay: row.leader_place_of_stay,
        leaderStatus: (row.leader_status as Branch["leaderStatus"]) ?? "single",
        spouseName: row.spouse_name,
        spouseContact: row.spouse_contact,
        spouseEmail: row.spouse_email,
        spousePlaceOfStay: row.spouse_place_of_stay,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function useBranchesRealtime(initialBranches: Branch[]) {
    const [branches, setBranches] = useState<Branch[]>(initialBranches);
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel("branches-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "branches",
                },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        const newBranch = mapRowToBranch(payload.new as BranchRow);
                        setBranches((prev) => [newBranch, ...prev]);
                    } else if (payload.eventType === "UPDATE") {
                        const updated = mapRowToBranch(payload.new as BranchRow);
                        setBranches((prev) =>
                            prev.map((b) => (b.id === updated.id ? updated : b))
                        );
                    } else if (payload.eventType === "DELETE") {
                        setBranches((prev) => prev.filter((b) => b.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return branches;
}