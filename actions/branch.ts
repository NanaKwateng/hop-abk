// actions/branch.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSlug, sanitizeSlug } from "@/lib/utils/slug";
import { withActionRetry } from "@/lib/utils/action-resilience";
import { uploadAvatar, deleteAvatarByUrl } from "@/lib/supabase/upload-avatar";
import type {
    Branch,
    BranchRow,
    CreateBranchPayload,
    UpdateBranchPayload,
} from "@/lib/types/branch";

// ── HELPERS ──

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

async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Unauthorized");
    return { supabase, user };
}

// ══════════════════════════════════════════════════════════
// READ — Get all branches
// ══════════════════════════════════════════════════════════

export async function getBranches(): Promise<Branch[]> {
    const { supabase } = await getAuthUser();

    const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => mapRowToBranch(row as BranchRow));
}

// ══════════════════════════════════════════════════════════
// READ — Get branch by slug
// ══════════════════════════════════════════════════════════

export async function getBranchBySlug(slug: string): Promise<Branch | null> {
    const { supabase } = await getAuthUser();
    const cleanSlug = sanitizeSlug(slug);

    const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("slug", cleanSlug)
        .single();

    if (error || !data) return null;
    return mapRowToBranch(data as BranchRow);
}

// ══════════════════════════════════════════════════════════
// CREATE — New branch with avatar upload
// ══════════════════════════════════════════════════════════

export async function createBranch(
    payload: CreateBranchPayload,
    leaderAvatarBase64?: string
): Promise<string> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuthUser();

        // Upload leader avatar if provided
        let avatarUrl: string | null = null;
        if (leaderAvatarBase64 && leaderAvatarBase64.startsWith("data:image/")) {
            avatarUrl = await uploadAvatar(leaderAvatarBase64);
        }

        // Generate unique slug
        const slug = generateSlug(payload.name);
        const { data: existing } = await supabase
            .from("branches")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

        // Determine spouse fields (only store if married AND not pastor/rev)
        const isPastorRev = payload.leaderPosition === "pastor_rev";
        const isMarried = payload.leaderStatus === "married";
        const storeSpouse = isMarried && !isPastorRev;

        const insertData = {
            slug: finalSlug,
            name: payload.name.trim(),
            location: payload.location.trim(),
            address: payload.address?.trim() || null,
            gps_lat: payload.gpsLat ?? null,
            gps_lng: payload.gpsLng ?? null,
            gps_address: payload.gpsAddress?.trim() || null,
            membership_size: payload.membershipSize,
            helpline: payload.helpline?.trim() || null,
            year_established: payload.yearEstablished ?? null,
            leader_position: payload.leaderPosition,
            leader_full_name: payload.leaderFullName.trim(),
            leader_contact: payload.leaderContact?.trim() || null,
            leader_email: payload.leaderEmail?.trim() || null,
            leader_avatar_url: avatarUrl ?? payload.leaderAvatarUrl ?? null,
            leader_place_of_stay: isPastorRev ? null : (payload.leaderPlaceOfStay?.trim() || null),
            leader_status: isPastorRev ? "single" : payload.leaderStatus,
            spouse_name: storeSpouse ? (payload.spouseName?.trim() || null) : null,
            spouse_contact: storeSpouse ? (payload.spouseContact?.trim() || null) : null,
            spouse_email: storeSpouse ? (payload.spouseEmail?.trim() || null) : null,
            spouse_place_of_stay: storeSpouse ? (payload.spousePlaceOfStay?.trim() || null) : null,
            created_by: user.id,
        };

        const { data: branch, error } = await supabase
            .from("branches")
            .insert(insertData)
            .select("slug")
            .single();

        if (error) {
            // Rollback avatar upload on failure
            if (avatarUrl) await deleteAvatarByUrl(avatarUrl);
            throw new Error(error.message);
        }

        revalidatePath("/admin/branches");
        return branch.slug;
    });
}

// ══════════════════════════════════════════════════════════
// UPDATE — Edit existing branch
// ══════════════════════════════════════════════════════════

export async function updateBranch(
    payload: UpdateBranchPayload,
    leaderAvatarBase64?: string
): Promise<Branch> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        const updateData: Record<string, any> = {};

        if (payload.name !== undefined) updateData.name = payload.name.trim();
        if (payload.location !== undefined) updateData.location = payload.location.trim();
        if (payload.address !== undefined) updateData.address = payload.address?.trim() || null;
        if (payload.gpsLat !== undefined) updateData.gps_lat = payload.gpsLat;
        if (payload.gpsLng !== undefined) updateData.gps_lng = payload.gpsLng;
        if (payload.gpsAddress !== undefined) updateData.gps_address = payload.gpsAddress?.trim() || null;
        if (payload.membershipSize !== undefined) updateData.membership_size = payload.membershipSize;
        if (payload.helpline !== undefined) updateData.helpline = payload.helpline?.trim() || null;
        if (payload.yearEstablished !== undefined) updateData.year_established = payload.yearEstablished;
        if (payload.leaderPosition !== undefined) updateData.leader_position = payload.leaderPosition;
        if (payload.leaderFullName !== undefined) updateData.leader_full_name = payload.leaderFullName.trim();
        if (payload.leaderContact !== undefined) updateData.leader_contact = payload.leaderContact?.trim() || null;
        if (payload.leaderEmail !== undefined) updateData.leader_email = payload.leaderEmail?.trim() || null;
        if (payload.leaderPlaceOfStay !== undefined) updateData.leader_place_of_stay = payload.leaderPlaceOfStay?.trim() || null;
        if (payload.leaderStatus !== undefined) updateData.leader_status = payload.leaderStatus;
        if (payload.spouseName !== undefined) updateData.spouse_name = payload.spouseName?.trim() || null;
        if (payload.spouseContact !== undefined) updateData.spouse_contact = payload.spouseContact?.trim() || null;
        if (payload.spouseEmail !== undefined) updateData.spouse_email = payload.spouseEmail?.trim() || null;
        if (payload.spousePlaceOfStay !== undefined) updateData.spouse_place_of_stay = payload.spousePlaceOfStay?.trim() || null;

        // Handle avatar upload
        if (leaderAvatarBase64 && leaderAvatarBase64.startsWith("data:image/")) {
            const { data: existing } = await supabase
                .from("branches")
                .select("leader_avatar_url")
                .eq("id", payload.id)
                .single();

            const newUrl = await uploadAvatar(leaderAvatarBase64, existing?.leader_avatar_url);
            updateData.leader_avatar_url = newUrl;
        }

        if (payload.leaderAvatarUrl === null || payload.leaderAvatarUrl === "") {
            if (!leaderAvatarBase64) {
                const { data: existing } = await supabase
                    .from("branches")
                    .select("leader_avatar_url")
                    .eq("id", payload.id)
                    .single();
                if (existing?.leader_avatar_url) await deleteAvatarByUrl(existing.leader_avatar_url);
                updateData.leader_avatar_url = null;
            }
        }

        const { data, error } = await supabase
            .from("branches")
            .update(updateData)
            .eq("id", payload.id)
            .select("*")
            .single();

        if (error) throw new Error(error.message);

        revalidatePath("/admin/branches");
        revalidatePath(`/admin/branches/${data.slug}`);
        return mapRowToBranch(data as BranchRow);
    });
}

// ══════════════════════════════════════════════════════════
// DELETE — Remove branch
// ══════════════════════════════════════════════════════════

export async function deleteBranch(id: string): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        // Clean up avatar
        const { data: branch } = await supabase
            .from("branches")
            .select("leader_avatar_url")
            .eq("id", id)
            .single();

        if (branch?.leader_avatar_url) {
            await deleteAvatarByUrl(branch.leader_avatar_url);
        }

        const { error } = await supabase.from("branches").delete().eq("id", id);
        if (error) throw new Error(error.message);

        revalidatePath("/admin/branches");
    });
}