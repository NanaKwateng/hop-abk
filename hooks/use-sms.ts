// hooks/use-sms.ts

"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sendSMS } from "@/actions/sms/send-sms";
import { getTemplates } from "@/actions/sms/get-templates";
import { saveTemplate } from "@/actions/sms/save-template";
import { getMessageHistory } from "@/actions/sms/get-message-history";
import { getRecipients } from "@/actions/sms/get-recipients";
import { getDeliveryStatus } from "@/actions/sms/get-delivery-status";
import type { SendSMSInput, TemplateInput } from "@/lib/types/sms";
import { toast } from "sonner";

// Query Keys
export const smsKeys = {
    all: ["sms"] as const,
    messages: () => [...smsKeys.all, "messages"] as const,
    messageHistory: (page: number, pageSize: number, status?: string, search?: string) =>
        [...smsKeys.messages(), page, pageSize, status, search] as const,
    templates: () => [...smsKeys.all, "templates"] as const,
    template: (id: string) => [...smsKeys.templates(), id] as const,
    recipients: (type: string, group?: string, ids?: string[]) =>
        [...smsKeys.all, "recipients", type, group, ids] as const,
    delivery: (messageId: string) => [...smsKeys.all, "delivery", messageId] as const,
};

// Hook
export function useSMS() {
    const queryClient = useQueryClient();
    const [isSending, setIsSending] = useState(false);

    // Send SMS Mutation
    const sendMutation = useMutation({
        mutationFn: (input: SendSMSInput) => sendSMS(input),
        onMutate: () => {
            setIsSending(true);
        },
        onSuccess: (result) => {
            toast.success("Message sent successfully!", {
                description: `Sent to ${result.totalRecipients} recipients`,
            });
            queryClient.invalidateQueries({ queryKey: smsKeys.messages() });
        },
        onError: (error: Error) => {
            toast.error("Failed to send message", {
                description: error.message,
            });
        },
        onSettled: () => {
            setIsSending(false);
        },
    });

    // Get Templates Query
    const useTemplates = (category?: string) => {
        return useQuery({
            queryKey: smsKeys.templates(),
            queryFn: () => getTemplates(category as any),
            staleTime: 5 * 60 * 1000, // 5 minutes
        });
    };

    // Get Message History Query
    const useMessageHistory = (page: number, pageSize: number, status?: string, search?: string) => {
        return useQuery({
            queryKey: smsKeys.messageHistory(page, pageSize, status, search),
            queryFn: () => getMessageHistory(page, pageSize, status, search),
            staleTime: 30 * 1000, // 30 seconds
        });
    };

    // Get Recipients Query
    const useRecipients = (type: string, group?: string, ids?: string[]) => {
        return useQuery({
            queryKey: smsKeys.recipients(type, group, ids),
            queryFn: () => getRecipients(type as any, group as any, ids),
            enabled: !!type,
            staleTime: 60 * 1000, // 1 minute
        });
    };

    // Save Template Mutation
    const saveTemplateMutation = useMutation({
        mutationFn: (input: TemplateInput & { id?: string }) => saveTemplate(input),
        onSuccess: () => {
            toast.success("Template saved successfully!");
            queryClient.invalidateQueries({ queryKey: smsKeys.templates() });
        },
        onError: (error: Error) => {
            toast.error("Failed to save template", {
                description: error.message,
            });
        },
    });

    // Get Delivery Status Query
    const useDeliveryStatus = (messageId: string) => {
        return useQuery({
            queryKey: smsKeys.delivery(messageId),
            queryFn: () => getDeliveryStatus(messageId),
            enabled: !!messageId,
            refetchInterval: 10000, // Poll every 10 seconds
        });
    };

    return {
        // Mutations
        sendMessage: sendMutation.mutateAsync,
        sendMessageAsync: sendMutation.mutateAsync,
        isSending,
        saveTemplate: saveTemplateMutation.mutateAsync,

        // Queries
        useTemplates,
        useMessageHistory,
        useRecipients,
        useDeliveryStatus,

        // State
        isPending: sendMutation.isPending,
        isSavingTemplate: saveTemplateMutation.isPending,
    };
}