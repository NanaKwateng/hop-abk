"use server";

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AI_CONFIG } from "./config";
import { QUERY_ANALYSIS_PROMPT } from "./prompts";
import type { AIQuery, AIQueryAnalysis, AIIntent } from "@/lib/types/ai";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

export async function isGoogleAIConfigured(): Promise<boolean> {
    return !!AI_CONFIG.google.apiKey && AI_CONFIG.google.apiKey.length > 0;
}

function getGeminiClient(): GenerativeModel {
    if (!genAI) {
        const apiKey = AI_CONFIG.google.apiKey;
        if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not configured");
        genAI = new GoogleGenerativeAI(apiKey);
    }
    if (!model) {
        const config = AI_CONFIG.google;
        model = genAI.getGenerativeModel({
            model: config.model,
            generationConfig: {
                temperature: config.temperature,
                maxOutputTokens: config.maxTokens,
                topP: config.topP,
                topK: config.topK,
            },
        });
    }
    return model;
}

const VALID_INTENTS: AIIntent[] = [
    "member_query", "payment_query", "task_query", "workflow_query",
    "branch_query", "sms_query", "analytics_query", "search_query", "general_query",
];

/** Phase 1 ONLY — intent + entities. Gemini never sees real data or writes the final answer. */
export async function analyzeQueryWithGemini(query: AIQuery): Promise<AIQueryAnalysis> {
    try {
        const client = getGeminiClient();
        const previousMessages = query.context?.previousMessages || [];
        const conversationContext = previousMessages.length > 0
            ? previousMessages.map((m) => `${m.role}: ${m.content}`).join("\n")
            : "None";

        const prompt = QUERY_ANALYSIS_PROMPT
            .replace("{query}", query.query)
            .replace("{context}", conversationContext);

        const result = await client.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 512,
                responseMimeType: "application/json",
            },
        });

        const text = result.response.text();
        let parsed: any;
        try {
            parsed = JSON.parse(text);
        } catch {
            console.error("[Google AI] Non-JSON analysis response:", text);
            return fallbackAnalysis();
        }

        const intent: AIIntent = VALID_INTENTS.includes(parsed.intent) ? parsed.intent : "general_query";

        return {
            success: true,
            intent,
            entities: parsed.entities || {},
            requiresData: !!parsed.requiresData,
            chartType: parsed.chartType || null,
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
            followUp: parsed.followUp || [],
        };
    } catch (error) {
        console.error("[Google AI] Analysis error:", error);
        return fallbackAnalysis();
    }
}

function fallbackAnalysis(): AIQueryAnalysis {
    return { success: false, intent: "general_query", entities: {}, requiresData: false, chartType: null, confidence: 0, followUp: [] };
}

/** Free-text conversational reply for general_query — no DB, low stakes if imperfect. */
export async function chatReplyWithGemini(query: AIQuery): Promise<string> {
    try {
        const client = getGeminiClient();
        const previousMessages = query.context?.previousMessages || [];
        const history = previousMessages.map((m) => `${m.role}: ${m.content}`).join("\n");

        const result = await client.generateContent({
            contents: [{
                role: "user",
                parts: [{
                    text: `You are a warm, concise assistant for a church admin tool. Conversation so far:\n${history}\n\nUser: ${query.query}\n\nReply in 1-3 sentences. Never invent statistics or names.`,
                }],
            }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
        });
        return result.response.text();
    } catch (error) {
        console.error("[Google AI] Chat reply error:", error);
        return "I'm here to help — could you rephrase that?";
    }
}