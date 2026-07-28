// actions/sms/get-delivery-status.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { createSMSProvider } from "@/lib/providers/sms-provider";
import type { SMSDeliveryLog, DeliveryStatus } from "@/lib/types/sms";

interface DeliveryStatusResult {
    messageId: string;
    status: DeliveryStatus;
    totalRecipients: number;
    delivered: number;
    failed: number;
    pending: number;
    logs: SMSDeliveryLog[];
}

export async function getDeliveryStatus(messageId: string): Promise<DeliveryStatusResult> {
    const supabase = await createClient();

    // Get message details
    const { data: message, error: messageError } = await supabase
        .from("sms_messages")
        .select("*")
        .eq("id", messageId)
        .single();

    if (messageError || !message) {
        throw new Error(`Message not found: ${messageError?.message || 'Unknown error'}`);
    }

    // Get delivery logs
    const { data: logs, error: logsError } = await supabase
        .from("sms_delivery_logs")
        .select(`
            *,
            members:member_id (first_name, last_name)
        `)
        .eq("message_id", messageId)
        .order("sent_at", { ascending: false });

    if (logsError) {
        console.error("[Get Delivery Status] Logs error:", logsError);
    }

    // Try to get fresh status from provider if message is still pending
    let providerStatus = null;
    if (message.status === "sending" || message.status === "pending") {
        try {
            const provider = createSMSProvider();
            const status = await provider.getDeliveryStatus(messageId);
            providerStatus = status;
        } catch (error) {
            console.error("[Get Delivery Status] Provider error:", error);
        }
    }

    const deliveryLogs: SMSDeliveryLog[] = (logs || []).map((row) => ({
        id: row.id,
        messageId: row.message_id,
        memberId: row.member_id,
        phone: row.phone,
        status: row.status as DeliveryStatus,
        providerResponse: row.provider_response,
        sentAt: row.sent_at,
        deliveredAt: row.delivered_at,
        errorMessage: row.error_message,
        memberName: row.members ? `${row.members.first_name} ${row.members.last_name}` : undefined,
    }));

    const delivered = deliveryLogs.filter((l) => l.status === "delivered" || l.status === "sent").length;
    const failed = deliveryLogs.filter((l) => l.status === "failed").length;
    const pending = deliveryLogs.filter((l) => l.status === "pending").length;

    return {
        messageId,
        status: providerStatus?.status === 'delivered' ? 'delivered' :
            providerStatus?.status === 'sent' ? 'sent' :
                message.status as DeliveryStatus,
        totalRecipients: message.total_recipients || deliveryLogs.length,
        delivered,
        failed,
        pending,
        logs: deliveryLogs,
    };
}

export async function updateDeliveryStatus(
    messageId: string,
    providerResponse: any
): Promise<void> {
    const supabase = await createClient();

    // Parse provider response
    const recipients = providerResponse?.SMSMessageData?.Recipients || [];

    if (recipients.length === 0) return;

    // Update each recipient's status
    for (const recipient of recipients) {
        const status = recipient.status === 'Success' ? 'delivered' : 'failed';
        const phone = recipient.number;

        await supabase
            .from("sms_delivery_logs")
            .update({
                status,
                delivered_at: status === 'delivered' ? new Date().toISOString() : null,
                provider_response: JSON.stringify(recipient),
                error_message: status === 'failed' ? recipient.status : null,
            })
            .eq("message_id", messageId)
            .eq("phone", phone);
    }

    // Update message summary
    const { data: logs } = await supabase
        .from("sms_delivery_logs")
        .select("status")
        .eq("message_id", messageId);

    if (logs) {
        const delivered = logs.filter((l) => l.status === "delivered" || l.status === "sent").length;
        const failed = logs.filter((l) => l.status === "failed").length;

        await supabase
            .from("sms_messages")
            .update({
                delivered_count: delivered,
                failed_count: failed,
                status: failed === 0 ? "sent" : failed > 0 && delivered > 0 ? "sent" : "failed",
            })
            .eq("id", messageId);
    }
}