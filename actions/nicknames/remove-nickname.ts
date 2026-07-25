// actions/nicknames/remove-nickname.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { withActionRetry } from "@/lib/utils/action-resilience";
import type { RemoveNicknamePayload } from "@/lib/types/nickname";

export async function removeNicknameFromMember(
    payload: RemoveNicknamePayload
): Promise<{ success: boolean }> {
    return withActionRetry(async () => {
        const supabase = await createClient();

        // Remove nickname
        const { error } = await supabase
            .from("members")
            .update({ nickname: null })
            .eq("id", payload.memberId)
            .is("deleted_at", null);

        if (error) {
            console.error("[Remove Nickname] Error:", error);
            throw new Error(`Failed to remove nickname: ${error.message}`);
        }

        // Revalidate paths
        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${payload.memberId}`);

        return { success: true };
    });
}