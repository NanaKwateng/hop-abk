// actions/sms/send-sms.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { createSMSProvider } from "@/lib/providers/sms-provider";
import { sendSMSSchema } from "@/lib/validations/sms";
import { revalidatePath } from "next/cache";
import { withActionRetry } from "@/lib/utils/action-resilience";
import type { SendSMSInput, SMSSendResult } from "@/lib/types/sms";

export async function sendSMS(input: SendSMSInput): Promise<SMSSendResult> {
    return withActionRetry(async () => {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Unauthorized");
        }

        // Validate input
        const validated = sendSMSSchema.parse(input);

        // Get recipients
        const { getRecipients } = await import("./get-recipients");
        const { recipients, totalCount } = await getRecipients(
            validated.recipientType,
            validated.recipientGroup,
            validated.recipientIds
        );

        if (recipients.length === 0) {
            throw new Error("No valid recipients found");
        }

        // Filter out recipients without phone numbers
        const validRecipients = recipients.filter((r) => r.phone);
        if (validRecipients.length === 0) {
            throw new Error("No recipients with valid phone numbers");
        }

        // Create message record
        const messageData = {
            sender_id: user.id,
            subject: validated.subject || null,
            message: validated.message,
            recipient_type: validated.recipientType,
            recipient_group: validated.recipientGroup || null,
            recipient_ids: validated.recipientIds || null,
            status: validated.scheduledFor ? "scheduled" : "sending",
            scheduled_for: validated.scheduledFor || null,
            total_recipients: validRecipients.length,
            created_by: user.id,
        };

        const { data: message, error: messageError } = await supabase
            .from("sms_messages")
            .insert(messageData)
            .select("id")
            .single();

        if (messageError || !message) {
            console.error("[Send SMS] Message creation error:", messageError);
            throw new Error("Failed to create message record");
        }

        // If scheduled, return early
        if (validated.scheduledFor) {
            revalidatePath("/admin/sms");
            return {
                success: true,
                messageId: message.id,
                totalRecipients: validRecipients.length,
                sentCount: 0,
                failedCount: 0,
            };
        }

        // Send SMS via provider
        try {
            const provider = createSMSProvider();
            const phoneNumbers = validRecipients.map((r) => r.phone!).filter(Boolean);

            const result = await provider.sendSMS(phoneNumbers, validated.message);

            // Update message status
            const status = result.success ? "sent" : "failed";
            const deliveredCount = result.success ? (result.recipientResults?.filter(r => r.status === 'sent').length || 0) : 0;
            const failedCount = result.success ? (result.recipientResults?.filter(r => r.status === 'failed').length || 0) : phoneNumbers.length;

            await supabase
                .from("sms_messages")
                .update({
                    status,
                    sent_at: new Date().toISOString(),
                    delivered_count: deliveredCount,
                    failed_count: failedCount,
                })
                .eq("id", message.id);

            // Create delivery logs
            if (result.recipientResults) {
                const logs = result.recipientResults.map((rr) => {
                    const recipient = validRecipients.find((r) => r.phone === rr.phone);
                    return {
                        message_id: message.id,
                        member_id: recipient?.id || null,
                        phone: rr.phone,
                        status: rr.status === 'sent' ? 'sent' : 'failed',
                        provider_response: rr.messageId || rr.error || null,
                        sent_at: new Date().toISOString(),
                    };
                });

                await supabase
                    .from("sms_delivery_logs")
                    .insert(logs);
            }

            revalidatePath("/admin/sms");

            return {
                success: result.success,
                messageId: message.id,
                totalRecipients: validRecipients.length,
                sentCount: deliveredCount,
                failedCount: failedCount,
                errors: result.error ? [result.error] : undefined,
            };
        } catch (error) {
            console.error("[Send SMS] Provider error:", error);

            // Update message status to failed
            await supabase
                .from("sms_messages")
                .update({
                    status: "failed",
                    failed_count: validRecipients.length,
                })
                .eq("id", message.id);

            throw error;
        }
    });
}