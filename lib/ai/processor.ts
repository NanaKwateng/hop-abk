"use server";

import { createClient } from "@/lib/supabase/server";
import { analyzeQuery, chatReply } from "./index";
import type { AIQuery, AIResponse } from "@/lib/types/ai";

import {
    executeMemberQuery,
    executePaymentQuery,
    executeTaskQuery,
    executeAnalyticsQuery,
    executeSearchQuery,
    executeWorkflowQuery,
    executeBranchQuery,
    executeSMSQuery,
} from "./query-executors";

export async function processQuery(query: AIQuery): Promise<AIResponse> {
    const startTime = Date.now();

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, role")
            .eq("id", user.id)
            .single();

        const contextData = await buildContextData(supabase);
        const sessionContext = query.sessionId ? await getSessionContext(query.sessionId) : null;

        // Phase 1: intent + entities ONLY
        const analysis = await analyzeQuery({
            ...query,
            context: {
                ...query.context,
                previousMessages: sessionContext?.conversation?.slice(-5) || [],
                entities: {
                    ...query.context?.entities,
                    currentUser: profile?.first_name || "Admin",
                    contextData,
                },
            },
        });

        let finalResponse: AIResponse;

        if (analysis.requiresData) {
            const executed = await executeQuery(analysis, supabase);
            finalResponse = executed ?? {
                success: false,
                message: "I couldn't find data for that. Could you rephrase your question?",
                confidence: analysis.confidence,
                intent: analysis.intent,
            };
        } else {
            const message = await chatReply(query);
            finalResponse = {
                success: true,
                message,
                confidence: analysis.confidence,
                intent: analysis.intent,
                suggestions: analysis.followUp,
            };
        }

        finalResponse.executionTime = Date.now() - startTime;
        if (process.env.NODE_ENV === "development") {
            finalResponse.raw = { analysis };
        }

        if (query.sessionId) {
            await saveSessionContext(query.sessionId, {
                conversation: [
                    ...(sessionContext?.conversation || []),
                    { role: "user", content: query.query, timestamp: new Date() },
                    { role: "assistant", content: finalResponse.message, timestamp: new Date(), data: finalResponse.data },
                ],
                lastIntent: finalResponse.intent,
            });
        }

        await logAIQuery(user.id, query, finalResponse);
        return finalResponse;
    } catch (error) {
        console.error("[AI Processor] Error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to process query",
            confidence: 0,
            intent: "general_query",
            executionTime: Date.now() - startTime,
        };
    }
}

async function buildContextData(supabase: any): Promise<Record<string, any>> {
    const [memberCount, paymentCount, taskCount, branchCount] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("member_payments").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("branches").select("*", { count: "exact", head: true }),
    ]);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { count: paidThisMonth } = await supabase
        .from("member_payments")
        .select("*", { count: "exact", head: true })
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("status", "paid");

    return {
        totalMembers: memberCount.count || 0,
        totalPayments: paymentCount.count || 0,
        totalTasks: taskCount.count || 0,
        totalBranches: branchCount.count || 0,
        paidThisMonth: paidThisMonth || 0,
        currentMonth,
        currentYear,
    };
}

async function executeQuery(analysis: { intent: string; entities: Record<string, any> }, supabase: any): Promise<AIResponse | null> {
    const payload = { entities: analysis.entities };
    switch (analysis.intent) {
        case "member_query": return executeMemberQuery(payload, supabase);
        case "payment_query": return executePaymentQuery(payload, supabase);
        case "task_query": return executeTaskQuery(payload, supabase);
        case "analytics_query": return executeAnalyticsQuery(payload, supabase);
        case "search_query": return executeSearchQuery(payload, supabase);
        // FIXED: Added payload and supabase arguments below
        case "workflow_query": return executeWorkflowQuery(payload, supabase);
        case "branch_query": return executeBranchQuery(payload, supabase);
        case "sms_query": return executeSMSQuery(payload, supabase);
        default: return null;
    }
}


async function getSessionContext(sessionId: string): Promise<any> {
    const supabase = await createClient();
    const { data } = await supabase.from("ai_sessions").select("context").eq("session_id", sessionId).single();
    return data?.context || null;
}

async function saveSessionContext(sessionId: string, context: any): Promise<void> {
    const supabase = await createClient();
    await supabase.from("ai_sessions").upsert({
        session_id: sessionId,
        context,
        last_activity: new Date().toISOString(),
    });
}

async function logAIQuery(userId: string, query: AIQuery, response: AIResponse): Promise<void> {
    const supabase = await createClient();
    await supabase.from("ai_query_logs").insert({
        user_id: userId,
        query: query.query,
        query_type: query.type,
        intent: response.intent,
        entities: query.context?.entities || {},
        response: { message: response.message, data: response.data, chart: response.chart, confidence: response.confidence },
        confidence: response.confidence,
        latency_ms: response.executionTime || 0,
        session_id: query.sessionId,
    });
}