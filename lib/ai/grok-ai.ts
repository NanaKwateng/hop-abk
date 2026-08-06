"use server";

import OpenAI from "openai";
import { AI_CONFIG } from "./config";
import { QUERY_ANALYSIS_PROMPT } from "./prompts";
import type { AIQuery, AIQueryAnalysis, AIIntent } from "@/lib/types/ai";

let grokClient: OpenAI | null = null;

function getGrokClient(): OpenAI {
    if (!grokClient) {
        const apiKey = AI_CONFIG.grok.apiKey;
        if (!apiKey) throw new Error("XAI_API_KEY is not configured");
        grokClient = new OpenAI({ apiKey, baseURL: "https://api.x.ai/v1" });
    }
    return grokClient;
}

const VALID_INTENTS: AIIntent[] = [
    "member_query", "payment_query", "task_query", "workflow_query",
    "branch_query", "sms_query", "analytics_query", "search_query", "general_query",
];

/** Phase 1 ONLY — intent + entities, same contract as Gemini's version. */
export async function analyzeQueryWithGrok(query: AIQuery): Promise<AIQueryAnalysis> {
    const client = getGrokClient();
    const previousMessages = query.context?.previousMessages || [];
    const conversationContext = previousMessages.length > 0
        ? previousMessages.map((m) => `${m.role}: ${m.content}`).join("\n")
        : "None";

    const prompt = QUERY_ANALYSIS_PROMPT
        .replace("{query}", query.query)
        .replace("{context}", conversationContext);

    const response = await client.chat.completions.create({
        model: AI_CONFIG.grok.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 512,
        response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    let parsed: any;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error("Grok returned non-JSON analysis response");
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
}

export async function chatReplyWithGrok(query: AIQuery): Promise<string> {
    const client = getGrokClient();
    const response = await client.chat.completions.create({
        model: AI_CONFIG.grok.model,
        messages: [{ role: "user", content: query.query }],
        temperature: 0.7,
        max_tokens: 256,
    });
    return response.choices[0]?.message?.content || "I'm here to help — could you rephrase that?";
}