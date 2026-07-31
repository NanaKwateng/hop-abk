// hooks/use-ai-assistant.ts

"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AIQuery, AIResponse } from "@/lib/types/ai";
import { toast } from "sonner";

const API_URL = "/api/ai/chat";

export function useAIAssistant() {
    const [sessionId] = useState(() => `session_${Date.now()}`);
    const [context, setContext] = useState<Record<string, any>>({});

    const mutation = useMutation({
        mutationFn: async (query: AIQuery): Promise<AIResponse> => {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: query.query,
                    type: query.type || "text",
                    sessionId: query.sessionId || sessionId,
                    context: {
                        ...context,
                        ...query.context,
                    },
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to process query");
            }

            const result = await response.json();
            return result.data;
        },
        onError: (error: Error) => {
            toast.error("AI Error", {
                description: error.message || "Failed to process your request",
            });
        },
    });

    const processQuery = useCallback(
        async (query: AIQuery): Promise<AIResponse> => {
            const response = await mutation.mutateAsync(query);

            // Update context with the response
            if (response.data) {
                setContext((prev) => ({
                    ...prev,
                    lastResponse: response.data,
                    lastIntent: response.intent,
                }));
            }

            return response;
        },
        [mutation]
    );

    const clearContext = useCallback(() => {
        setContext({});
    }, []);

    return {
        processQuery,
        isProcessing: mutation.isPending,
        error: mutation.error,
        context,
        clearContext,
        sessionId,
    };
}