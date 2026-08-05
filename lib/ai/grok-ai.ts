// lib/ai/grok-ai.ts

"use server";

import OpenAI from "openai";
import { AI_CONFIG } from "./config";
import { DATABASE_SCHEMA, QUERY_EXAMPLES } from "./schema";
import type { AIQuery, AIResponse } from "@/lib/types/ai";

// Initialize Grok (xAI) client
let grokClient: OpenAI | null = null;

function getGrokClient(): OpenAI {
    if (!grokClient) {
        const apiKey = AI_CONFIG.grok.apiKey;
        if (!apiKey) {
            throw new Error("XAI_API_KEY is not configured");
        }

        grokClient = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.x.ai/v1",
        });
    }

    return grokClient;
}

/**
 * Process a query using Grok (xAI)
 */
export async function processWithGrok(query: AIQuery): Promise<AIResponse> {
    try {
        const client = getGrokClient();

        // Build the prompt
        const prompt = buildGrokPrompt(query);

        // Call Grok
        const response = await client.chat.completions.create({
            model: AI_CONFIG.grok.model,
            messages: [
                {
                    role: "system",
                    content: `You are a helpful AI assistant for a Church Management System. Use the following schema to answer questions about the church data.\n\n${DATABASE_SCHEMA}`,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: AI_CONFIG.grok.temperature,
            max_tokens: AI_CONFIG.grok.maxTokens,
            response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(content);

        return {
            success: true,
            message: parsed.message || "I processed your query.",
            data: parsed.data,
            chart: parsed.chart,
            confidence: parsed.confidence || 0.9,
            intent: parsed.intent || "general_query",
            suggestions: parsed.suggestions || [],
        };
    } catch (error) {
        console.error("[Grok AI] Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to process query with Grok",
            confidence: 0,
            intent: "general_query",
        };
    }
}

/**
 * Build prompt for Grok
 */
function buildGrokPrompt(query: AIQuery): string {
    const context = query.context || {};

    // SAFE FIX: Extract array safely with fallback to prevent undefined errors
    const previousMessages = context.previousMessages || [];

    const conversationContext = previousMessages.length > 0
        ? `\nPrevious conversation:\n${previousMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}`
        : '';

    return `
You are an AI assistant for HOP (House of Power Ministry) Church Management System.

Your task is to answer user queries about church data.

Current date: ${new Date().toISOString().split('T')[0]}

## Database Schema
${DATABASE_SCHEMA}

## Example Queries
${QUERY_EXAMPLES}

${conversationContext}

## User Query
${query.query}

Respond with a JSON object:
{
    "message": "Your response to the user",
    "data": null or any data retrieved,
    "chart": null or chart configuration,
    "intent": "member_query|payment_query|task_query|analytics_query|search_query|general_query",
    "confidence": 0.9,
    "suggestions": ["suggestion1", "suggestion2"]
}
`;
}
