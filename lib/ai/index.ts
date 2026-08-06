import { AI_CONFIG } from "./config";
import { analyzeQueryWithGemini, chatReplyWithGemini } from "./google-ai";
import { analyzeQueryWithGrok, chatReplyWithGrok } from "./grok-ai";
import type { AIQuery, AIQueryAnalysis } from "@/lib/types/ai";

export * from "./prompts";
export * from "./schema";
export * from "./config";

export async function analyzeQuery(query: AIQuery): Promise<AIQueryAnalysis> {
    const provider = AI_CONFIG.provider;
    try {
        return provider === "google" ? await analyzeQueryWithGemini(query) : await analyzeQueryWithGrok(query);
    } catch (error) {
        console.error("[AI] Provider error, falling back:", error);
        try {
            return provider === "google" ? await analyzeQueryWithGrok(query) : await analyzeQueryWithGemini(query);
        } catch {
            return { success: false, intent: "general_query", entities: {}, requiresData: false, chartType: null, confidence: 0, followUp: [] };
        }
    }
}

export async function chatReply(query: AIQuery): Promise<string> {
    const provider = AI_CONFIG.provider;
    try {
        return provider === "google" ? await chatReplyWithGemini(query) : await chatReplyWithGrok(query);
    } catch {
        try {
            return provider === "google" ? await chatReplyWithGrok(query) : await chatReplyWithGemini(query);
        } catch {
            return "I'm here to help — could you rephrase that?";
        }
    }
}