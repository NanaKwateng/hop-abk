// lib/utils/task-utils.ts

import type { Task, TaskStatus, TaskPurpose } from "@/lib/types/task";
import { differenceInDays, isPast, isFuture, isToday } from "date-fns";

/**
 * Calculate days until task expiry
 */
export function getDaysUntilExpiry(endDate: string | null): number | null {
    if (!endDate) return null;
    const days = differenceInDays(new Date(endDate), new Date());
    return days >= 0 ? days : 0;
}

/**
 * Determine if task is expiring soon (within 7 days)
 */
export function isExpiringSoon(endDate: string | null): boolean {
    if (!endDate) return false;
    const days = getDaysUntilExpiry(endDate);
    return days !== null && days > 0 && days <= 7;
}

/**
 * Determine if task is expired
 */
export function isTaskExpired(endDate: string | null): boolean {
    if (!endDate) return false;
    return isPast(new Date(endDate)) && !isToday(new Date(endDate));
}

/**
 * Get task status based on dates and completion
 */
export function getTaskStatus(task: Task): TaskStatus {
    if (task.status === "archived") return "archived";
    if (task.completedAt) return "completed";
    if (task.endDate && isTaskExpired(task.endDate)) return "expired";
    return "active";
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
        active: "Active",
        completed: "Completed",
        expired: "Expired",
        archived: "Archived",
    };
    return labels[status];
}

/**
 * Get status color variant for badges
 */
export function getStatusVariant(
    status: TaskStatus
): "default" | "secondary" | "destructive" | "outline" {
    const variants: Record<TaskStatus, "default" | "secondary" | "destructive" | "outline"> = {
        active: "default",
        completed: "secondary",
        expired: "destructive",
        archived: "outline",
    };
    return variants[status];
}

/**
 * Get purpose label
 */
export function getPurposeLabel(purpose: TaskPurpose): string {
    const labels: Record<TaskPurpose, string> = {
        payments: "💳 Payments",
        monitoring: "📊 Monitoring",
        roles: "🛡️ Roles",
        groups: "👥 Groups",
        records: "📄 Records",
        other: "📌 Other",
    };
    return labels[purpose];
}

/**
 * Get purpose color configuration
 */
export function getPurposeConfig(purpose: TaskPurpose) {
    const configs = {
        payments: {
            icon: "CreditCard",
            label: "💳 Payments",
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-950/50",
            cardBg: "bg-green-500",
        },
        records: {
            icon: "FileText",
            label: "📄 Records",
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-950/50",
            cardBg: "bg-blue-500",
        },
        roles: {
            icon: "Shield",
            label: "🛡️ Roles",
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-950/50",
            cardBg: "bg-purple-500",
        },
        groups: {
            icon: "Users",
            label: "👥 Groups",
            color: "text-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-950/50",
            cardBg: "bg-indigo-500",
        },
        monitoring: {
            icon: "Activity",
            label: "📊 Monitoring",
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-950/50",
            cardBg: "bg-orange-500",
        },
        other: {
            icon: "MoreHorizontal",
            label: "📌 Other",
            color: "text-gray-600",
            bg: "bg-gray-100 dark:bg-gray-950/50",
            cardBg: "bg-gray-500",
        },
    };
    return configs[purpose] || configs.other;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionRate(
    completedMembers: number,
    totalMembers: number
): number {
    if (totalMembers === 0) return 0;
    return Math.round((completedMembers / totalMembers) * 100);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) return "—";
    return `GH₵ ${amount.toFixed(2)}`;
}

/**
 * Get expiry badge variant based on days remaining
 */
export function getExpiryVariant(daysUntilExpiry: number | null): {
    variant: "default" | "secondary" | "destructive";
    label: string;
} {
    if (daysUntilExpiry === null) {
        return { variant: "secondary", label: "No deadline" };
    }
    if (daysUntilExpiry === 0) {
        return { variant: "destructive", label: "Expires today" };
    }
    if (daysUntilExpiry <= 3) {
        return { variant: "destructive", label: `${daysUntilExpiry} days left` };
    }
    if (daysUntilExpiry <= 7) {
        return { variant: "secondary", label: `${daysUntilExpiry} days left` };
    }
    return { variant: "default", label: `${daysUntilExpiry} days left` };
}

/**
 * Sort tasks by criteria
 */
export function sortTasks<T extends Task>(
    tasks: T[],
    sortBy: "created_at" | "name" | "completion_rate" | "end_date",
    sortOrder: "asc" | "desc" = "desc"
): T[] {
    const sorted = [...tasks].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case "created_at":
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "completion_rate":
                comparison = a.completionRate - b.completionRate;
                break;
            case "end_date":
                if (!a.endDate && !b.endDate) comparison = 0;
                else if (!a.endDate) comparison = 1;
                else if (!b.endDate) comparison = -1;
                else comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
                break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
}

/**
 * Filter tasks by status and purpose
 */
export function filterTasks<T extends Task>(
    tasks: T[],
    filters: {
        status?: TaskStatus;
        purpose?: TaskPurpose;
        search?: string;
    }
): T[] {
    return tasks.filter((task) => {
        if (filters.status && getTaskStatus(task) !== filters.status) {
            return false;
        }
        if (filters.purpose && task.purpose !== filters.purpose) {
            return false;
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                task.name.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });
}