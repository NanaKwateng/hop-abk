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

        // fixed: removed the embedded `profiles:created_by(...)` join.
        // If that foreign key relationship isn't declared in the DB,
        // PostgREST throws PGRST200 and the whole query fails — which
        // silently produced "no messages" for every filter, not just one.
        let query = supabase
            .from("sms_messages")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false });

        // "delivered" is not a value in sms_messages.status — it's tracked
        // via delivered_count. Handle it separately from real status values.
        if (status === "delivered") {
            query = query.gt("delivered_count", 0);
        } else if (status && status !== "all") {
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
            // fixed: log the actual PostgREST error instead of swallowing it —
            // this is what would have surfaced the join problem immediately.
            console.error("[Get Message History] Query error:", error.message, error.details, error.hint);
            return { messages: [], totalCount: 0, page, pageSize, totalPages: 0 };
        }

        // Fetch sender names separately — avoids depending on an
        // auto-detected FK relationship that may not exist.
        const senderIds = Array.from(new Set((data || []).map((row) => row.created_by).filter(Boolean)));
        let sendersById: Record<string, { first_name: string; last_name: string }> = {};

        if (senderIds.length > 0) {
            const { data: senders, error: sendersError } = await supabase
                .from("profiles")
                .select("id, first_name, last_name")
                .in("id", senderIds);

            if (sendersError) {
                console.error("[Get Message History] Senders lookup error:", sendersError.message);
            } else {
                sendersById = Object.fromEntries(
                    (senders || []).map((s) => [s.id, { first_name: s.first_name, last_name: s.last_name }])
                );
            }
        }

        const messages: SMSMessage[] = (data || []).map((row) => {
            const sender = row.created_by ? sendersById[row.created_by] : undefined;
            return {
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
                senderName: sender ? `${sender.first_name} ${sender.last_name}` : undefined,
            };
        });

        const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));

        return { messages, totalCount: count || 0, page, pageSize, totalPages };
    } catch (error) {
        console.error("[Get Message History] Unexpected error:", error);
        return { messages: [], totalCount: 0, page, pageSize, totalPages: 0 };
    }
}