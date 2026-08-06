"use server";

import { createClient } from "@/lib/supabase/server";
import type { SMSMessage } from "@/lib/types/sms";

interface GetMessageHistoryResult {
    messages: SMSMessage[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// PostgREST reserves , ( ) % * inside .or()/.ilike() patterns — escape them
// so a search containing punctuation doesn't throw a parse error server-side.
function escapeForOrFilter(input: string) {
    return input.replace(/[,()%*]/g, (c) => `\\${c}`);
}

export async function getMessageHistory(
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    search?: string
): Promise<GetMessageHistoryResult> {
    try {
        const supabase = await createClient();

        let query = supabase
            .from("sms_messages")
            .select(`
                *,
                profiles:created_by (first_name, last_name)
            `, { count: "exact" })
            .order("created_at", { ascending: false });

        if (status && status !== "all") {
            query = query.eq("status", status);
        }

        if (search && search.trim()) {
            const safe = escapeForOrFilter(search.trim());
            query = query.or(`subject.ilike.%${safe}%,message.ilike.%${safe}%`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error("[Get Message History] Error:", error);
            return { messages: [], totalCount: 0, page, pageSize, totalPages: 0 };
        }

        const messages: SMSMessage[] = (data || []).map((row) => ({
            id: row.id,
            senderId: row.sender_id,
            subject: row.subject || null,
            message: row.message,
            recipientType: row.recipient_type,
            recipientGroup: row.recipient_group || null,
            recipientIds: row.recipient_ids || null,
            status: row.status || "pending",
            scheduledFor: row.scheduled_for || null,
            sentAt: row.sent_at || null,
            totalRecipients: row.total_recipients || 0,
            deliveredCount: row.delivered_count || 0,
            failedCount: row.failed_count || 0,
            createdAt: row.created_at,
            createdBy: row.created_by,
            senderName: row.profiles?.first_name && row.profiles?.last_name
                ? `${row.profiles.first_name} ${row.profiles.last_name}`
                : undefined,
        }));

        const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));

        return { messages, totalCount: count || 0, page, pageSize, totalPages };
    } catch (error) {
        console.error("[Get Message History] Unexpected error:", error);
        return { messages: [], totalCount: 0, page, pageSize, totalPages: 0 }; // was 1, now consistent
    }
}