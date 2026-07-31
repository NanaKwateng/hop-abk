// lib/ai/processor.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { processAIQuery } from "./index"; // ✅ FIXED: import directly
import type { AIQuery, AIResponse, AIIntent } from "@/lib/types/ai";
import { withActionRetry } from "@/lib/utils/action-resilience";

// Query executors
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

/**
 * Process a query with full database integration
 */
export async function processQuery(query: AIQuery): Promise<AIResponse> {
    const startTime = Date.now();

    try {
        // Get user context
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        // Get user profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, role")
            .eq("id", user.id)
            .single();

        // Build context data
        const contextData = await buildContextData(supabase);

        // Get session context
        const sessionContext = query.sessionId
            ? await getSessionContext(query.sessionId)
            : null;

        // Process with AI provider - ✅ FIXED: use imported function directly
        const aiResponse = await processAIQuery({
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

        // Execute database queries if needed
        let dataResponse: AIResponse | null = null;
        if (aiResponse.success && aiResponse.data) {
            dataResponse = await executeQuery(aiResponse.data, supabase);
        }

        // Combine responses
        const finalResponse: AIResponse = {
            success: true,
            message: dataResponse?.message || aiResponse.message,
            data: dataResponse?.data || aiResponse.data,
            chart: dataResponse?.chart || aiResponse.chart,
            suggestions: dataResponse?.suggestions || aiResponse.suggestions || [],
            confidence: aiResponse.confidence,
            intent: aiResponse.intent,
            executionTime: Date.now() - startTime,
        };

        // Save session context
        if (query.sessionId) {
            await saveSessionContext(query.sessionId, {
                conversation: [
                    ...(sessionContext?.conversation || []),
                    { role: 'user', content: query.query, timestamp: new Date() },
                    { role: 'assistant', content: finalResponse.message, timestamp: new Date(), data: finalResponse.data },
                ],
                lastIntent: finalResponse.intent,
            });
        }

        // Log the query
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

/**
 * Build context data for AI
 */
async function buildContextData(supabase: any): Promise<Record<string, any>> {
    const [
        memberCount,
        paymentCount,
        taskCount,
        branchCount,
    ] = await Promise.all([
        supabase.from("members").select("count", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("member_payments").select("count", { count: "exact", head: true }),
        supabase.from("tasks").select("count", { count: "exact", head: true }),
        supabase.from("branches").select("count", { count: "exact", head: true }),
    ]);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { data: paidThisMonth } = await supabase
        .from("member_payments")
        .select("count", { count: "exact", head: true })
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("status", "paid");

    return {
        totalMembers: memberCount.count || 0,
        totalPayments: paymentCount.count || 0,
        totalTasks: taskCount.count || 0,
        totalBranches: branchCount.count || 0,
        paidThisMonth: paidThisMonth.count || 0,
        currentMonth,
        currentYear,
    };
}

/**
 * Execute database query based on AI response
 */
async function executeQuery(data: any, supabase: any): Promise<AIResponse | null> {
    if (!data || !data.intent) return null;

    switch (data.intent) {
        case 'member_query':
            return executeMemberQuery(data, supabase);
        case 'payment_query':
            return executePaymentQuery(data, supabase);
        case 'task_query':
            return executeTaskQuery(data, supabase);
        case 'analytics_query':
            return executeAnalyticsQuery(data, supabase);
        case 'search_query':
            return executeSearchQuery(data, supabase);
        case 'workflow_query':
            return executeWorkflowQuery(data, supabase);
        case 'branch_query':
            return executeBranchQuery(data, supabase);
        case 'sms_query':
            return executeSMSQuery(data, supabase);
        default:
            return null;
    }
}

/**
 * Get session context
 */
async function getSessionContext(sessionId: string): Promise<any> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("ai_sessions")
        .select("context")
        .eq("session_id", sessionId)
        .single();

    return data?.context || null;
}

/**
 * Save session context
 */
async function saveSessionContext(sessionId: string, context: any): Promise<void> {
    const supabase = await createClient();
    await supabase
        .from("ai_sessions")
        .upsert({
            session_id: sessionId,
            context,
            last_activity: new Date().toISOString(),
        });
}

/**
 * Log AI query
 */
async function logAIQuery(userId: string, query: AIQuery, response: AIResponse): Promise<void> {
    const supabase = await createClient();
    await supabase
        .from("ai_query_logs")
        .insert({
            user_id: userId,
            query: query.query,
            query_type: query.type,
            intent: response.intent,
            entities: query.context?.entities || {},
            response: {
                message: response.message,
                data: response.data,
                chart: response.chart,
                confidence: response.confidence,
            },
            confidence: response.confidence,
            latency_ms: response.executionTime || 0,
            session_id: query.sessionId,
        });
}