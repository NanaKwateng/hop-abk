// lib/ai/index.ts

// ✅ REMOVE "use server" from this file - it's not needed here

import { AI_CONFIG } from "./config";
import { processWithGoogleGemini } from "./google-ai";
import { processWithGrok } from "./grok-ai";
import type { AIQuery, AIResponse } from "@/lib/types/ai";

// Re-export all prompts - ✅ FIXED: use correct file name (prompts, not prompt)
export * from "./prompts";
export * from "./schema";
export * from "./config";

/**
 * Main AI processing function - routes to the configured provider
 */
export async function processAIQuery(query: AIQuery): Promise<AIResponse> {
    const provider = AI_CONFIG.provider;

    console.log(`[AI] Processing query with provider: ${provider}`);

    try {
        switch (provider) {
            case "google":
                return await processWithGoogleGemini(query);
            case "grok":
                return await processWithGrok(query);
            default:
                throw new Error(`Unknown AI provider: ${provider}`);
        }
    } catch (error) {
        console.error("[AI] Provider error:", error);

        // Try fallback to the other provider
        if (provider === "google") {
            console.log("[AI] Falling back to Grok");
            try {
                return await processWithGrok(query);
            } catch {
                return fallbackResponse("All AI providers failed. Please try again later.");
            }
        } else {
            console.log("[AI] Falling back to Google");
            try {
                return await processWithGoogleGemini(query);
            } catch {
                return fallbackResponse("All AI providers failed. Please try again later.");
            }
        }
    }
}

function fallbackResponse(message: string): AIResponse {
    return {
        success: false,
        message,
        confidence: 0,
        intent: "general_query",
    };
}