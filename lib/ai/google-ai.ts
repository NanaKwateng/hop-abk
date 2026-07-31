// lib/ai/google-ai.ts

"use server";

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AI_CONFIG } from "./config";
import { DATABASE_SCHEMA, QUERY_EXAMPLES } from "./schema";
import { SYSTEM_PROMPT } from "./prompts";
import type { AIQuery, AIResponse, AIIntent } from "@/lib/types/ai";

// Initialize Google AI
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

export function isGoogleAIConfigured(): boolean {
    return !!AI_CONFIG.google.apiKey && AI_CONFIG.google.apiKey.length > 0;
}

function getGeminiClient(): GenerativeModel {
    if (!genAI) {
        const apiKey = AI_CONFIG.google.apiKey;
        if (!apiKey) {
            throw new Error("GOOGLE_AI_API_KEY is not configured");
        }
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

/**
 * Process a query using Google Gemini
 */
export async function processWithGoogleGemini(query: AIQuery): Promise<AIResponse> {
    try {
        const client = getGeminiClient();

        // Build the prompt
        const prompt = buildPrompt(query);

        // Call Gemini with function calling
        const result = await client.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                temperature: AI_CONFIG.google.temperature,
                maxOutputTokens: AI_CONFIG.google.maxTokens,
                responseMimeType: "application/json",
            },
        });

        const response = result.response;
        const text = response.text();

        // Parse the response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(text);
        } catch {
            // If not JSON, return as text
            return {
                success: true,
                message: text,
                confidence: 0.9,
                intent: "general_query",
            };
        }

        return {
            success: true,
            message: parsedResponse.message || "I processed your query.",
            data: parsedResponse.data,
            chart: parsedResponse.chart,
            intent: parsedResponse.intent || "general_query",
            confidence: parsedResponse.confidence || 0.9,
            suggestions: parsedResponse.suggestions || [],
        };
    } catch (error) {
        console.error("[Google AI] Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to process query with Google AI",
            confidence: 0,
            intent: "general_query",
        };
    }
}

/**
 * Build the prompt for Gemini
 */
function buildPrompt(query: AIQuery): string {
    const context = query.context || {};

    // SAFE FIX: Extract array safely with fallback to prevent undefined errors
    const previousMessages = context.previousMessages || [];

    const conversationContext = previousMessages.length > 0
        ? `\n## Previous Conversation\n${previousMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}`
        : '';

    return `
${SYSTEM_PROMPT.replace('{currentDate}', new Date().toISOString().split('T')[0])}

## Database Schema
${DATABASE_SCHEMA}

## Example Queries
${QUERY_EXAMPLES}

## Conversation Context
${conversationContext}

## User Query
${query.query}

Please analyze this query and provide a response. Return a JSON object with the following structure:
{
    "message": "Your response to the user",
    "data": null or data retrieved,
    "chart": null or chart configuration,
    "intent": "member_query|payment_query|task_query|analytics_query|search_query|general_query",
    "confidence": 0.9,
    "suggestions": ["suggestion1", "suggestion2"]
}
`;
}
