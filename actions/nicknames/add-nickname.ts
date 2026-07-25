// actions/nicknames/add-nickname.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { nicknameSchema } from "@/lib/validations/nickname";
import { withActionRetry } from "@/lib/utils/action-resilience";
import type { AddNicknamePayload } from "@/lib/types/nickname";

export async function addNicknameToMember(
    payload: AddNicknamePayload
): Promise<{ success: boolean; nickname: string }> {
    return withActionRetry(async () => {
        const supabase = await createClient();

        // Validate input
        const validated = nicknameSchema.parse({ nickname: payload.nickname });

        // Check if nickname is already taken
        const { data: existing } = await supabase
            .from("members")
            .select("id")
            .eq("nickname", validated.nickname)
            .is("deleted_at", null)
            .maybeSingle();

        if (existing) {
            throw new Error(`Nickname "${validated.nickname}" is already taken by another member.`);
        }

        // Update member with nickname
        const { error } = await supabase
            .from("members")
            .update({ nickname: validated.nickname })
            .eq("id", payload.memberId)
            .is("deleted_at", null);

        if (error) {
            console.error("[Add Nickname] Error:", error);
            throw new Error(`Failed to add nickname: ${error.message}`);
        }

        // Revalidate paths
        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${payload.memberId}`);

        return {
            success: true,
            nickname: validated.nickname,
        };
    });
}