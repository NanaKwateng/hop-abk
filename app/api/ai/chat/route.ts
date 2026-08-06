import { NextRequest, NextResponse } from "next/server";
import { processQuery } from "@/lib/ai/processor";
import { rateLimit } from "@/lib/cache/redis";
import { createClient } from "@/lib/supabase/server"; // fixed: moved to top
import type { AIQuery } from "@/lib/types/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";

        // fixed: fail-open if the rate limiter itself is down (e.g. Redis
        // misconfigured) — an infra hiccup here should not take down the
        // whole AI feature.
        let allowed = true;
        try {
            const result = await rateLimit(`ai:${ip}`, 30, 60);
            allowed = result.success;
        } catch (rateLimitError) {
            console.error("[AI API] Rate limiter unavailable, allowing request:", rateLimitError);
        }

        if (!allowed) {
            return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
        }

        const body = await req.json();
        const { query, type, sessionId, context } = body;

        // fixed: reject blank/whitespace-only queries, not just missing ones
        if (!query || typeof query !== "string" || !query.trim()) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const aiQuery: AIQuery = {
            query: query.trim(),
            type: type || "text",
            sessionId: sessionId || `session_${Date.now()}`,
            context: context || {},
        };

        const response = await processQuery(aiQuery);

        return NextResponse.json({ success: true, data: response });
    } catch (error) {
        console.error("[AI API] Error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const sessionId = req.nextUrl.searchParams.get("sessionId");
        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data } = await supabase.from("ai_sessions").select("context").eq("session_id", sessionId).single();

        return NextResponse.json({ success: true, data: data?.context || null });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal error" },
            { status: 500 }
        );
    }
}