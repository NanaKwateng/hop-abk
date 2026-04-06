// lib/types/task.ts

/**
 * Task purpose types - defines what the task is for
 */
export type TaskPurpose =
    | "payments"
    | "monitoring"
    | "roles"
    | "groups"
    | "records"
    | "other";

/**
 * Task status lifecycle
 */
export type TaskStatus = "active" | "completed" | "expired" | "archived";

/**
 * Duration tracking types
 */
export type DurationType = "weekly" | "monthly" | "quarterly" | "custom";

/**
 * Member status within a task
 */
export type TaskMemberStatus = "pending" | "in_progress" | "completed";

/**
 * Activity types matching task purposes
 */
export type ActivityType =
    | "payment"
    | "record"
    | "role"
    | "group"
    | "monitor"
    | "other";

/**
 * Payment status for payment activities
 */
export type PaymentStatus = "pending" | "completed" | "cancelled";

/**
 * Core Task interface
 */
export interface Task {
    id: string;
    slug: string;
    name: string;
    purpose: TaskPurpose;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    hasDuration: boolean;
    durationType: DurationType | null;
    status: TaskStatus;
    completionRate: number;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
}

/**
 * Task with member count (for list view)
 */
export interface TaskWithStats extends Task {
    memberCount: number;
    activityCount: number;
    totalPayments: number | null;
    daysUntilExpiry: number | null;
}

/**
 * Member assigned to a task
 */
export interface TaskMember {
    id: string;
    taskId: string;
    memberId: string;
    firstName: string;
    lastName: string;
    membershipId: string | null;
    avatarUrl: string | null;
    memberGroup: string | null;
    progress: number;
    status: TaskMemberStatus;
    assignedAt: string;
    completedAt: string | null;
}

/**
 * Activity/Entry within a task
 */
export interface TaskActivity {
    id: string;
    taskId: string;
    memberId: string;
    memberFirstName: string;
    memberLastName: string;
    memberAvatarUrl: string | null;
    activityType: ActivityType;
    title: string;
    description: string | null;

    // Payment fields
    amount: number | null;
    paymentDate: string | null;
    paymentStatus: PaymentStatus | null;
    paymentPeriod: string | null; // "week-1", "month-2", etc.

    // Role fields
    roleTitle: string | null;
    roleDescription: string | null;

    // Group fields
    groupName: string | null;

    // Record fields
    recordType: string | null;
    recordContent: string | null;

    // Monitor fields
    monitorNote: string | null;
    monitorStatus: string | null;

    // Common
    metadata: Record<string, unknown> | null;
    attachments: string[] | null;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Complete task detail with members and activities
 */
export interface TaskDetail extends Task {
    members: TaskMember[];
    activities: TaskActivity[];
    stats: {
        totalMembers: number;
        completedMembers: number;
        avgProgress: number;
        totalActivities: number;
        totalPayments: number | null;
    };
}

/**
 * Payload for creating a new task
 */
export interface CreateTaskPayload {
    name: string;
    purpose: TaskPurpose;
    description?: string;
    startDate?: string;
    endDate?: string;
    hasDuration: boolean;
    durationType?: DurationType;
    memberIds: string[];
    // Purpose-specific config
    paymentConfig?: {
        trackingPeriod: "weekly" | "monthly";
        expectedAmount?: number;
    };
    recordConfig?: {
        recordType?: string;
        template?: string;
    };
    monitorConfig?: {
        checkpointInterval?: "daily" | "weekly" | "monthly";
    };
}

/**
 * Payload for creating an activity
 */
export interface CreateActivityPayload {
    taskId: string;
    memberId: string;
    activityType: ActivityType;
    title: string;
    description?: string;

    // Payment specific
    amount?: number;
    paymentDate?: string;
    paymentStatus?: PaymentStatus;
    paymentPeriod?: string;

    // Role specific
    roleTitle?: string;
    roleDescription?: string;

    // Group specific
    groupName?: string;

    // Record specific
    recordType?: string;
    recordContent?: string;

    // Monitor specific
    monitorNote?: string;
    monitorStatus?: string;

    // Optional
    metadata?: Record<string, unknown>;
    attachments?: string[];
}

/**
 * Payload for updating an activity
 */
export interface UpdateActivityPayload {
    id: string;
    taskId: string;
    title?: string;
    description?: string;
    amount?: number;
    paymentDate?: string;
    paymentStatus?: PaymentStatus;
    paymentPeriod?: string;
    roleTitle?: string;
    roleDescription?: string;
    groupName?: string;
    recordType?: string;
    recordContent?: string;
    monitorNote?: string;
    monitorStatus?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Filter options for task list
 */
export interface TaskFilters {
    status?: TaskStatus;
    purpose?: TaskPurpose;
    search?: string;
    sortBy?: "created_at" | "name" | "completion_rate" | "end_date";
    sortOrder?: "asc" | "desc";
}

/**
 * View mode for task list
 */
export type TaskViewMode = "grid" | "list";

/**
 * Export format options
 */
export type ExportFormat = "csv" | "excel" | "pdf" | "word";

/**
 * Activity export data
 */
export interface ActivityExportData {
    memberName: string;
    membershipId: string;
    activityType: string;
    title: string;
    description: string;
    amount: string;
    date: string;
    status: string;
    period: string;
}