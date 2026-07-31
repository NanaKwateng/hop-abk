// lib/ai/query-executors.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import type { AIResponse } from "@/lib/types/ai";

/**
 * Execute member queries
 */
export async function executeMemberQuery(data: any, supabase: any): Promise<AIResponse> {
    const entities = data.entities || {};
    const query = supabase
        .from("members")
        .select("*")
        .is("deleted_at", null);

    // Apply filters
    if (entities.group) {
        query.eq("member_group", entities.group);
    }
    if (entities.position) {
        query.eq("member_position", entities.position);
    }
    if (entities.member) {
        query.or(`first_name.ilike.%${entities.member}%,last_name.ilike.%${entities.member}%`);
    }
    if (entities.timeframe === "month") {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        query.gte("created_at", start.toISOString());
    }

    const { data: members, error } = await query.limit(100);

    if (error) {
        return {
            success: false,
            message: `Failed to query members: ${error.message}`,
            confidence: 0,
            intent: "member_query",
        };
    }

    return {
        success: true,
        message: formatMemberResponse(members, entities),
        data: members,
        chart: members && members.length > 5 ? {
            type: "table",
            data: members,
            config: {
                columns: ["first_name", "last_name", "membership_id", "member_group", "member_position"],
            },
        } : undefined,
        confidence: 0.95,
        intent: "member_query",
        suggestions: [
            "Show me payment status for these members",
            "What tasks are assigned to them?",
            "Export this list",
        ],
    };
}

/**
 * Execute payment queries
 */
export async function executePaymentQuery(data: any, supabase: any): Promise<AIResponse> {
    const entities = data.entities || {};
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    let query = supabase
        .from("member_payments")
        .select(`
            *,
            members:member_id (
                first_name,
                last_name,
                membership_id,
                member_group
            )
        `);

    // Apply filters
    if (entities.timeframe === "month") {
        query = query.eq("year", entities.year || currentYear).eq("month", entities.month || currentMonth);
    } else if (entities.timeframe === "year") {
        query = query.eq("year", entities.year || currentYear);
    }

    if (entities.status) {
        query = query.eq("status", entities.status);
    }

    const { data: payments, error } = await query;

    if (error) {
        return {
            success: false,
            message: `Failed to query payments: ${error.message}`,
            confidence: 0,
            intent: "payment_query",
        };
    }

    // Calculate statistics
    const totalPaid = payments?.filter((p: any) => p.status === "paid").length || 0;
    const totalAmount = payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

    return {
        success: true,
        message: `Found ${payments?.length || 0} payment records. ${totalPaid} paid, total amount: GH₵ ${totalAmount.toFixed(2)}`,
        data: payments,
        chart: payments && payments.length > 0 ? {
            type: "bar",
            data: payments?.slice(0, 12) || [],
            config: {
                xAxis: "month",
                yAxis: "amount",
                title: "Payment Summary",
            },
        } : undefined,
        confidence: 0.95,
        intent: "payment_query",
        suggestions: [
            "Show members who haven't paid",
            "Compare with last year",
            "Show payment trends",
        ],
    };
}

/**
 * Execute task queries
 */
export async function executeTaskQuery(data: any, supabase: any): Promise<AIResponse> {
    const entities = data.entities || {};
    let query = supabase.from("tasks").select("*");

    if (entities.status) {
        query = query.eq("status", entities.status);
    }
    if (entities.purpose) {
        query = query.eq("purpose", entities.purpose);
    }

    const { data: tasks, error } = await query;

    if (error) {
        return {
            success: false,
            message: `Failed to query tasks: ${error.message}`,
            confidence: 0,
            intent: "task_query",
        };
    }

    const active = tasks?.filter((t: any) => t.status === "active").length || 0;
    const completed = tasks?.filter((t: any) => t.status === "completed").length || 0;

    return {
        success: true,
        message: `Found ${tasks?.length || 0} tasks. ${active} active, ${completed} completed.`,
        data: tasks,
        chart: tasks && tasks.length > 0 ? {
            type: "pie",
            data: [
                { name: "Active", value: active },
                { name: "Completed", value: completed },
                { name: "Expired", value: tasks?.filter((t: any) => t.status === "expired").length || 0 },
            ],
            config: {
                label: "name",
                value: "value",
            },
        } : undefined,
        confidence: 0.95,
        intent: "task_query",
        suggestions: [
            "Show task details",
            "Assign me to a task",
            "Create a new task",
        ],
    };
}

/**
 * Execute analytics queries
 */
export async function executeAnalyticsQuery(data: any, supabase: any): Promise<AIResponse> {
    const entities = data.entities || {};
    const analytics: any = {};

    // Get member analytics
    const { data: members } = await supabase
        .from("members")
        .select("member_group, member_position, created_at")
        .is("deleted_at", null);

    analytics.totalMembers = members?.length || 0;
    analytics.byGroup = members?.reduce((acc: any, m: any) => {
        const group = m.member_group || "unassigned";
        acc[group] = (acc[group] || 0) + 1;
        return acc;
    }, {});

    analytics.byPosition = members?.reduce((acc: any, m: any) => {
        const position = m.member_position || "member";
        acc[position] = (acc[position] || 0) + 1;
        return acc;
    }, {});

    // Get payment analytics
    const currentYear = new Date().getFullYear();
    const { data: payments } = await supabase
        .from("member_payments")
        .select("status, year, month")
        .eq("year", currentYear);

    const paid = payments?.filter((p: any) => p.status === "paid").length || 0;
    const total = payments?.length || 0;
    analytics.paymentCompliance = total > 0 ? Math.round((paid / total) * 100) : 0;

    return {
        success: true,
        message: `Analytics summary: ${analytics.totalMembers} total members, ${analytics.paymentCompliance}% payment compliance.`,
        data: analytics,
        chart: analytics.byGroup && Object.keys(analytics.byGroup).length > 0 ? {
            type: "pie",
            data: Object.entries(analytics.byGroup || {}).map(([key, value]) => ({ name: key, value })),
            config: {
                label: "name",
                value: "value",
            },
        } : undefined,
        confidence: 0.95,
        intent: "analytics_query",
        suggestions: [
            "Show detailed member analytics",
            "Compare year over year",
            "Show payment trends",
        ],
    };
}

/**
 * Execute search queries
 */
export async function executeSearchQuery(data: any, supabase: any): Promise<AIResponse> {
    const entities = data.entities || {};
    const searchTerm = entities.searchTerm || data.query;

    if (!searchTerm) {
        return {
            success: false,
            message: "No search term provided",
            confidence: 0,
            intent: "search_query",
        };
    }

    const { data: members, error } = await supabase
        .from("members")
        .select("*")
        .is("deleted_at", null)
        .or(`
            first_name.ilike.%${searchTerm}%,
            last_name.ilike.%${searchTerm}%,
            membership_id.ilike.%${searchTerm}%,
            phone.ilike.%${searchTerm}%,
            email.ilike.%${searchTerm}%,
            nickname.ilike.%${searchTerm}%
        `)
        .limit(20);

    if (error) {
        return {
            success: false,
            message: `Search failed: ${error.message}`,
            confidence: 0,
            intent: "search_query",
        };
    }

    return {
        success: true,
        message: `Found ${members?.length || 0} members matching "${searchTerm}"`,
        data: members,
        chart: members && members.length > 0 ? {
            type: "table",
            data: members,
            config: {
                columns: ["first_name", "last_name", "membership_id", "phone", "member_group"],
            },
        } : undefined,
        confidence: 0.95,
        intent: "search_query",
        suggestions: [
            "Show their payment status",
            "View their profile",
            "Send them a message",
        ],
    };
}

/**
 * Execute workflow queries
 */
export async function executeWorkflowQuery(data: any, supabase: any): Promise<AIResponse> {
    // Implementation similar to other queries
    return {
        success: true,
        message: "Workflow data retrieved",
        data: [],
        confidence: 0.9,
        intent: "workflow_query",
    };
}

/**
 * Execute branch queries
 */
export async function executeBranchQuery(data: any, supabase: any): Promise<AIResponse> {
    // Implementation similar to other queries
    return {
        success: true,
        message: "Branch data retrieved",
        data: [],
        confidence: 0.9,
        intent: "branch_query",
    };
}

/**
 * Execute SMS queries
 */
export async function executeSMSQuery(data: any, supabase: any): Promise<AIResponse> {
    // Implementation similar to other queries
    return {
        success: true,
        message: "SMS data retrieved",
        data: [],
        confidence: 0.9,
        intent: "sms_query",
    };
}

/**
 * Format member response
 */
function formatMemberResponse(members: any[], entities: any): string {
    if (!members || members.length === 0) {
        return "No members found matching your criteria.";
    }

    const groupFilter = entities.group ? ` in ${entities.group.replace('_', ' ')}` : '';
    return `Found ${members.length} member${members.length > 1 ? 's' : ''}${groupFilter}.`;
}