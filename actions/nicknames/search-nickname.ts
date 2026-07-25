// actions/nicknames/search-nickname.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { nicknameSearchSchema } from "@/lib/validations/nickname";
import type { NicknameSearchResult, NicknameMember } from "@/lib/types/nickname";

export async function searchMembersByNickname(
    query: string,
    limit: number = 10
): Promise<NicknameSearchResult> {
    const supabase = await createClient();

    // Validate input
    const validated = nicknameSearchSchema.parse({ query, limit });

    // Search by nickname (exact match or partial)
    const { data, error, count } = await supabase
        .from("members")
        .select(
            `
            id,
            first_name,
            last_name,
            membership_id,
            avatar_url,
            nickname,
            email,
            phone,
            member_group,
            member_position
        `,
            { count: "exact" }
        )
        .ilike("nickname", `%${validated.query}%`)
        .is("deleted_at", null)
        .order("nickname", { ascending: true })
        .limit(validated.limit);

    if (error) {
        console.error("[Nickname Search] Error:", error);
        throw new Error(`Failed to search nicknames: ${error.message}`);
    }

    const members: NicknameMember[] = (data || []).map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        membershipId: row.membership_id,
        avatarUrl: row.avatar_url,
        nickname: row.nickname,
        email: row.email,
        phone: row.phone,
        memberGroup: row.member_group,
        memberPosition: row.member_position,
    }));

    return {
        members,
        totalCount: count || 0,
    };
}

export async function searchMembersByNicknameExact(
    nickname: string
): Promise<NicknameMember | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("members")
        .select(
            `
            id,
            first_name,
            last_name,
            membership_id,
            avatar_url,
            nickname,
            email,
            phone,
            member_group,
            member_position
        `
        )
        .eq("nickname", nickname)
        .is("deleted_at", null)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null; // Not found
        console.error("[Nickname Exact Search] Error:", error);
        throw new Error(`Failed to search nickname: ${error.message}`);
    }

    return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipId: data.membership_id,
        avatarUrl: data.avatar_url,
        nickname: data.nickname,
        email: data.email,
        phone: data.phone,
        memberGroup: data.member_group,
        memberPosition: data.member_position,
    };
}