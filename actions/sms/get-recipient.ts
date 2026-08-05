// actions/sms/get-recipients.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import type { SMSRecipient, RecipientType, MemberGroup } from "@/lib/types/sms";

interface GetRecipientsResult {
    recipients: SMSRecipient[];
    totalCount: number;
}

export async function getRecipients(
    type: RecipientType,
    group?: MemberGroup,
    ids?: string[]
): Promise<GetRecipientsResult> {
    const supabase = await createClient();

    let query = supabase
        .from("members")
        .select("id, first_name, last_name, phone, membership_id, member_group, member_position, email")
        .is("deleted_at", null)
        .not("phone", "is", null);

    // Filter by type
    if (type === "group" && group) {
        query = query.eq("member_group", group);
    } else if (type === "individual" && ids && ids.length > 0) {
        query = query.in("id", ids);
    } else if (type === "filtered") {
        // Apply additional filters if needed
        // This can be extended with more filter options
    }
    // type === "all" - no additional filter needed

    const { data, error, count } = await query;

    if (error) {
        console.error("[Get Recipients] Error:", error);
        throw new Error(`Failed to get recipients: ${error.message}`);
    }

    const recipients: SMSRecipient[] = (data || []).map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        membershipId: row.membership_id,
        memberGroup: row.member_group,
        memberPosition: row.member_position,
        email: row.email,
    }));

    return {
        recipients,
        totalCount: count || recipients.length,
    };
}