"use server";

import { createClient } from "@/lib/supabase/server";
import { nicknameSearchSchema } from "@/lib/validations/nickname";
import type { NicknameSearchResult, NicknameMember } from "@/lib/types/nickname";

export async function searchMembersByNickname(
    query: string,
    limit: number = 50
): Promise<NicknameSearchResult> {
    const supabase = await createClient();

    const validated = nicknameSearchSchema.parse({ query, limit });

    let dbQuery = supabase
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
        .not("nickname", "is", null)
        .is("deleted_at", null)
        .order("nickname", { ascending: true })
        .limit(validated.limit);

    // Apply ilike only if search string exists
    if (validated.query && validated.query.trim().length >= 2) {
        dbQuery = dbQuery.ilike("nickname", `%${validated.query.trim()}%`);
    }

    const { data, error, count } = await dbQuery;

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
        if (error.code === "PGRST116") return null;
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