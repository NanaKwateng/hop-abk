// src/actions/member.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadAvatar, deleteAvatarByUrl } from "@/lib/supabase/upload-avatar";
import { rowToMember, rowsToMembers, memberFormToRow } from "@/lib/utils/member-mapper";
import { withActionRetry } from "@/lib/utils/action-resilience"; // ✅ Queue helper
import type { Member, MemberFormData, MemberQueryParams, MemberRow, PaginatedResponse, FilterConfig } from "@/lib/types";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized — please sign in again.");
    return { supabase, user };
}

// ── READS (Not cached heavily due to pagination/search dynamic nature) ──
export async function fetchMembers(params: MemberQueryParams): Promise<PaginatedResponse<Member>> {
    const { supabase } = await getAuthenticatedUser();
    let query = supabase.from("members").select("*", { count: "exact" });

    if (params.search?.trim()) {
        const q = `%${params.search.trim()}%`;
        query = query.or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},phone.ilike.${q},place_of_stay.ilike.${q},membership_id.ilike.${q},house_number.ilike.${q}`);
    }

    if (params.filters && params.filters.length > 0) {
        for (const filter of params.filters) {
            if (!filter.value || filter.value === "all") continue;
            const columnMap: Record<string, string> = { gender: "gender", memberPosition: "member_position", memberGroup: "member_group", occupationType: "occupation_type", placeOfStay: "place_of_stay", phone: "phone", email: "email", membershipId: "membership_id" };
            const dbColumn = columnMap[filter.field];
            if (!dbColumn) continue;
            if (filter.field === "placeOfStay") query = query.ilike(dbColumn, `%${filter.value}%`);
            else query = query.eq(dbColumn, filter.value);
        }
    }

    if (params.sortField) {
        const sortColumnMap: Record<string, string> = { firstName: "first_name", lastName: "last_name", email: "email", phone: "phone", placeOfStay: "place_of_stay", memberPosition: "member_position", memberGroup: "member_group", occupationType: "occupation_type", membershipId: "membership_id", createdAt: "created_at", gender: "gender" };
        const dbSortColumn = sortColumnMap[params.sortField] || "created_at";
        query = query.order(dbSortColumn, { ascending: params.sortDirection !== "desc", nullsFirst: false });
    } else {
        query = query.order("created_at", { ascending: false });
    }

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / params.pageSize);

    return { data: rowsToMembers((data as MemberRow[]) || []), totalCount, totalPages, currentPage: params.page, pageSize: params.pageSize };
}

export async function fetchMemberById(id: string): Promise<Member | null> {
    const { supabase } = await getAuthenticatedUser();
    const { data, error } = await supabase.from("members").select("*").eq("id", id).single();
    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
    }
    return rowToMember(data as MemberRow);
}

export async function fetchMembersForExport(
    search: string,
    filters: FilterConfig[]
): Promise<Member[]> {
    const { supabase } = await getAuthenticatedUser();

    let query = supabase.from("members").select("*");

    if (search?.trim()) {
        const q = `%${search.trim()}%`;
        query = query.or(
            [
                `first_name.ilike.${q}`,
                `last_name.ilike.${q}`,
                `email.ilike.${q}`,
                `phone.ilike.${q}`,
                `place_of_stay.ilike.${q}`,
                `membership_id.ilike.${q}`,
            ].join(",")
        );
    }

    if (filters && filters.length > 0) {
        const columnMap: Record<string, string> = {
            gender: "gender",
            memberPosition: "member_position",
            memberGroup: "member_group",
            occupationType: "occupation_type",
            placeOfStay: "place_of_stay",
        };

        for (const filter of filters) {
            if (!filter.value || filter.value === "all") continue;
            const dbColumn = columnMap[filter.field];
            if (!dbColumn) continue;

            if (filter.field === "placeOfStay") {
                query = query.ilike(dbColumn, `%${filter.value}%`);
            } else {
                query = query.eq(dbColumn, filter.value);
            }
        }
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error("SUPABASE EXPORT FETCH ERROR:", error);
        throw new Error(error.message);
    }

    return rowsToMembers((data as MemberRow[]) || []);
}


// ✅ WRAPPED WRITES
export async function createMember(data: MemberFormData, avatarBase64?: string): Promise<Member> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuthenticatedUser();
        let avatarUrl: string | undefined = undefined;

        if (avatarBase64 && avatarBase64.startsWith("data:image/")) {
            avatarUrl = await uploadAvatar(avatarBase64);
        }

        const rowData = memberFormToRow({ ...data, avatarUrl: avatarUrl || undefined });
        const insertData: Record<string, unknown> = { ...rowData, created_by: user.id };

        for (const key of Object.keys(insertData)) {
            if (insertData[key] === "" || insertData[key] === undefined) delete insertData[key];
        }

        const { data: row, error } = await supabase.from("members").insert(insertData).select().single();
        if (error) throw new Error(error.message);

        revalidatePath("/admin/users");
        return rowToMember(row as MemberRow);
    });
}

export async function updateMember(id: string, data: Partial<MemberFormData>, avatarBase64?: string): Promise<Member> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthenticatedUser();
        const updateData = memberFormToRow(data as MemberFormData);

        if (avatarBase64 && avatarBase64.startsWith("data:image/")) {
            const { data: existing } = await supabase.from("members").select("avatar_url").eq("id", id).single();
            const newUrl = await uploadAvatar(avatarBase64, existing?.avatar_url);
            updateData.avatar_url = newUrl;
        }

        if (data.avatarUrl === "" || data.avatarUrl === null || data.avatarUrl === undefined) {
            if (!avatarBase64) {
                const { data: existing } = await supabase.from("members").select("avatar_url").eq("id", id).single();
                if (existing?.avatar_url) await deleteAvatarByUrl(existing.avatar_url);
                updateData.avatar_url = null;
            }
        }

        for (const key of Object.keys(updateData)) if (updateData[key] === undefined) delete updateData[key];

        const { data: row, error } = await supabase.from("members").update(updateData).eq("id", id).select().single();
        if (error) throw new Error(error.message);

        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${id}`);
        return rowToMember(row as MemberRow);
    });
}

export async function deleteMember(id: string): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthenticatedUser();
        const { data: member, error: fetchError } = await supabase.from("members").select("id, avatar_url").eq("id", id).single();
        if (fetchError) throw new Error("Member not found. It may have already been deleted.");

        if (member.avatar_url) await deleteAvatarByUrl(member.avatar_url);

        const { error: deleteError, count } = await supabase.from("members").delete({ count: "exact" }).eq("id", id);
        if (deleteError) throw new Error(`Failed to delete member: ${deleteError.message}`);
        if (count === 0) throw new Error("Delete failed — no rows were affected.");

        revalidatePath("/admin/users");
    });
}

export async function deleteMultipleMembers(ids: string[]): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthenticatedUser();
        if (ids.length === 0) return;

        const { data: members } = await supabase.from("members").select("id, avatar_url").in("id", ids);
        if (members) {
            for (const m of members) if (m.avatar_url) await deleteAvatarByUrl(m.avatar_url);
        }

        const { error, count } = await supabase.from("members").delete({ count: "exact" }).in("id", ids);
        if (error) throw new Error(`Failed to delete members: ${error.message}`);
        if (count === 0) throw new Error("Delete failed — no rows were affected.");

        revalidatePath("/admin/users");
    });
}

export async function duplicateMember(id: string): Promise<Member> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuthenticatedUser();

        const { data: original, error: fetchError } = await supabase
            .from("members")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !original) {
            throw new Error("Member not found");
        }

        const { data: duplicate, error: insertError } = await supabase
            .from("members")
            .insert({
                first_name: `${original.first_name} (Copy)`,
                last_name: original.last_name,
                gender: original.gender,
                phone: original.phone,
                phone_country: original.phone_country,
                place_of_stay: original.place_of_stay,
                house_number: original.house_number,
                member_position: original.member_position,
                address_comments: original.address_comments,
                member_group: original.member_group,
                occupation_type: original.occupation_type,
                role_comments: original.role_comments,
                email: original.email ? `copy.${original.email}` : null,
                avatar_url: original.avatar_url,
                membership_id: null,
                created_by: user.id,
            })
            .select()
            .single();

        if (insertError) {
            console.error("SUPABASE DUPLICATE ERROR:", insertError);
            throw new Error(insertError.message);
        }

        revalidatePath("/admin/users");
        return rowToMember(duplicate as MemberRow);
    });
}