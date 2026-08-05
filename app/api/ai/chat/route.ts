// app/api/ai/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { processQuery } from "@/lib/ai/processor";
import { rateLimit } from "@/lib/cache/redis";
import type { AIQuery } from "@/lib/types/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
            req.headers.get("x-real-ip") ||
            "unknown";

        // Rate limit: 30 requests per minute per IP
        const { success } = await rateLimit(`ai:${ip}`, 30, 60);
        if (!success) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a moment." },
                { status: 429 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { query, type, sessionId, context } = body;

        if (!query) {
            return NextResponse.json(
                { error: "Query is required" },
                { status: 400 }
            );
        }

        // Process the query
        const aiQuery: AIQuery = {
            query,
            type: type || "text",
            sessionId: sessionId || `session_${Date.now()}`,
            context: context || {},
        };

        const response = await processQuery(aiQuery);

        return NextResponse.json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error("[AI API] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error"
            },
            { status: 500 }
        );
    }
}

// GET endpoint for session history
export async function GET(req: NextRequest) {
    try {
        const sessionId = req.nextUrl.searchParams.get("sessionId");
        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            );
        }

        // Get session context from database
        const supabase = await createClient();
        const { data } = await supabase
            .from("ai_sessions")
            .select("context")
            .eq("session_id", sessionId)
            .single();

        return NextResponse.json({
            success: true,
            data: data?.context || null,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal error" },
            { status: 500 }
        );
    }
}

import { createClient } from "@/lib/supabase/server";