// actions/sms/get-sms-analytics.ts

"use server";

import { createClient } from "@/lib/supabase/server";

export interface SMSAnalyticsData {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalPending: number;
    deliveryRate: number;
    monthlyData: {
        month: string;
        sent: number;
        delivered: number;
    }[];
    statusDistribution: {
        name: string;
        value: number;
        color: string;
    }[];
    topGroups: {
        name: string;
        count: number;
    }[];
}

export async function getSMSAnalytics(): Promise<SMSAnalyticsData> {
    const supabase = await createClient();

    // Get all messages
    const { data: messages, error: messagesError } = await supabase
        .from("sms_messages")
        .select("status, delivered_count, failed_count, total_recipients, created_at, recipient_group");

    if (messagesError) {
        console.error("[SMS Analytics] Error fetching messages:", messagesError);
        return getDefaultAnalytics();
    }

    // Get delivery logs for detailed stats
    const { data: logs, error: logsError } = await supabase
        .from("sms_delivery_logs")
        .select("status");

    if (logsError) {
        console.error("[SMS Analytics] Error fetching logs:", logsError);
        return getDefaultAnalytics();
    }

    // Calculate totals
    const totalSent = messages?.length || 0;
    const delivered = logs?.filter((l) => l.status === "delivered" || l.status === "sent").length || 0;
    const failed = logs?.filter((l) => l.status === "failed").length || 0;
    const pending = logs?.filter((l) => l.status === "pending").length || 0;

    const totalDelivered = delivered;
    const totalFailed = failed;
    const totalPending = pending;

    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

    // Monthly data (last 6 months)
    const monthlyData = getMonthlyData(messages || []);

    // Status distribution
    const statusDistribution = [
        { name: "Delivered", value: totalDelivered, color: "#10b981" },
        { name: "Failed", value: totalFailed, color: "#ef4444" },
        { name: "Pending", value: totalPending, color: "#f59e0b" },
    ];

    // Top groups
    const topGroups = getTopGroups(messages || []);

    return {
        totalSent,
        totalDelivered,
        totalFailed,
        totalPending,
        deliveryRate,
        monthlyData,
        statusDistribution,
        topGroups,
    };
}

function getDefaultAnalytics(): SMSAnalyticsData {
    return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalPending: 0,
        deliveryRate: 0,
        monthlyData: [],
        statusDistribution: [
            { name: "Delivered", value: 0, color: "#10b981" },
            { name: "Failed", value: 0, color: "#ef4444" },
            { name: "Pending", value: 0, color: "#f59e0b" },
        ],
        topGroups: [],
    };
}

function getMonthlyData(messages: any[]): { month: string; sent: number; delivered: number }[] {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const result: { month: string; sent: number; delivered: number }[] = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const monthIndex = (now.getMonth() - i + 12) % 12;
        const yearOffset = now.getMonth() - i < 0 ? 1 : 0;
        const year = now.getFullYear() - yearOffset;

        const monthName = months[monthIndex];
        const monthMessages = messages.filter((m) => {
            const date = new Date(m.created_at);
            return date.getMonth() === monthIndex && date.getFullYear() === year;
        });

        const sent = monthMessages.length;
        const delivered = monthMessages.reduce((sum, m) => sum + (m.delivered_count || 0), 0);

        result.push({ month: monthName, sent, delivered });
    }

    return result;
}

function getTopGroups(messages: any[]): { name: string; count: number }[] {
    const groupMap: Record<string, number> = {};
    const groupLabels: Record<string, string> = {
        mens_fellowship: "Men's Fellowship",
        womens_fellowship: "Women's Fellowship",
        youth_fellowship: "Youth Fellowship",
    };

    messages.forEach((m) => {
        if (m.recipient_group) {
            const key = m.recipient_group;
            groupMap[key] = (groupMap[key] || 0) + 1;
        }
    });

    return Object.entries(groupMap)
        .map(([key, count]) => ({
            name: groupLabels[key] || key,
            count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
}