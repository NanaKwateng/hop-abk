// lib/validations/task-schema.ts

import { z } from "zod";

/**
 * Schema for task creation - Step 1: Basic Info
 */
export const taskBasicInfoSchema = z.object({
    name: z
        .string()
        .min(2, "Task name must be at least 2 characters")
        .max(100, "Task name must be less than 100 characters")
        .trim(),
    purpose: z.enum(["payments", "monitoring", "roles", "groups", "records", "other"], {
        message: "Please select a task purpose",
    }),
    description: z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
});

/**
 * Schema for task duration - Step 2: Duration (Optional)
 */
export const taskDurationSchema = z.object({
    hasDuration: z.boolean(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    durationType: z
        .enum(["weekly", "monthly", "quarterly", "custom"])
        .optional(),
}).refine(
    (data) => {
        if (!data.hasDuration) return true;
        return !!data.startDate && !!data.endDate;
    },
    {
        message: "Start and end dates are required when duration is enabled",
        path: ["startDate"],
    }
).refine(
    (data) => {
        if (!data.startDate || !data.endDate) return true;
        return data.startDate < data.endDate;
    },
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
);

/**
 * Schema for member selection - Step 3: Members
 */
export const taskMemberSelectionSchema = z.object({
    memberIds: z
        .array(z.string().uuid())
        .min(1, "Select at least one member")
        .max(500, "Maximum 500 members allowed"),
});

/**
 * Payment configuration schema
 */
export const paymentConfigSchema = z.object({
    trackingPeriod: z.enum(["weekly", "monthly"], {
        message: "Select tracking period",
    }),
    expectedAmount: z
        .number()
        .positive("Amount must be positive")
        .optional(),
});

/**
 * Record configuration schema
 */
export const recordConfigSchema = z.object({
    recordType: z.string().max(100).optional(),
    template: z.string().max(1000).optional(),
});

/**
 * Monitor configuration schema
 */
export const monitorConfigSchema = z.object({
    checkpointInterval: z
        .enum(["daily", "weekly", "monthly"])
        .optional(),
});

/**
 * Schema for purpose configuration - Step 4: Purpose Config
 */
export const taskPurposeConfigSchema = z.object({
    purpose: z.enum(["payments", "monitoring", "roles", "groups", "records", "other"]),
    paymentConfig: paymentConfigSchema.optional(),
    recordConfig: recordConfigSchema.optional(),
    monitorConfig: monitorConfigSchema.optional(),
});

/**
 * Complete task creation schema (all steps combined)
 */
export const createTaskSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    purpose: z.enum(["payments", "monitoring", "roles", "groups", "records", "other"]),
    description: z.string().max(500).optional(),
    hasDuration: z.boolean(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    durationType: z.enum(["weekly", "monthly", "quarterly", "custom"]).optional(),
    memberIds: z.array(z.string().uuid()).min(1).max(500),
    paymentConfig: paymentConfigSchema.optional(),
    recordConfig: recordConfigSchema.optional(),
    monitorConfig: monitorConfigSchema.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Schema for creating a payment activity
 */
export const createPaymentActivitySchema = z.object({
    taskId: z.string().uuid(),
    memberId: z.string().uuid(),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(1000).optional(),
    amount: z.number().positive("Amount must be positive"),
    paymentDate: z.string().optional(),
    paymentStatus: z.enum(["pending", "completed", "cancelled"]).default("completed"),
    paymentPeriod: z.string().max(50).optional(),
});

/**
 * Schema for creating a record activity
 */
export const createRecordActivitySchema = z.object({
    taskId: z.string().uuid(),
    memberId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    recordType: z.string().max(100).optional(),
    recordContent: z.string().max(5000).optional(),
});

/**
 * Schema for creating a role activity
 */
export const createRoleActivitySchema = z.object({
    taskId: z.string().uuid(),
    memberId: z.string().uuid(),
    roleTitle: z.string().min(1, "Role title is required").max(200),
    roleDescription: z.string().max(1000).optional(),
});

/**
 * Schema for creating a monitor activity
 */
export const createMonitorActivitySchema = z.object({
    taskId: z.string().uuid(),
    memberId: z.string().uuid(),
    title: z.string().min(1).max(200),
    monitorNote: z.string().max(1000).optional(),
    monitorStatus: z.string().max(100).optional(),
});

/**
 * Generic activity creation schema
 */
export const createActivitySchema = z.object({
    taskId: z.string().uuid(),
    memberId: z.string().uuid(),
    activityType: z.enum(["payment", "record", "role", "group", "monitor", "other"]),
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    amount: z.number().positive().optional(),
    paymentDate: z.string().optional(),
    paymentStatus: z.enum(["pending", "completed", "cancelled"]).optional(),
    paymentPeriod: z.string().max(50).optional(),
    roleTitle: z.string().max(200).optional(),
    roleDescription: z.string().max(1000).optional(),
    groupName: z.string().max(100).optional(),
    recordType: z.string().max(100).optional(),
    recordContent: z.string().max(5000).optional(),
    monitorNote: z.string().max(1000).optional(),
    monitorStatus: z.string().max(100).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(), // ✅ FIXED: Added key type
});

/**
 * Schema for updating an activity
 */
export const updateActivitySchema = z.object({
    id: z.string().uuid(),
    taskId: z.string().uuid(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    amount: z.number().positive().optional(),
    paymentDate: z.string().optional(),
    paymentStatus: z.enum(["pending", "completed", "cancelled"]).optional(),
    paymentPeriod: z.string().max(50).optional(),
    roleTitle: z.string().max(200).optional(),
    roleDescription: z.string().max(1000).optional(),
    groupName: z.string().max(100).optional(),
    recordType: z.string().max(100).optional(),
    recordContent: z.string().max(5000).optional(),
    monitorNote: z.string().max(1000).optional(),
    monitorStatus: z.string().max(100).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(), // ✅ FIXED: Added key type
});

/**
 * Schema for updating task basic info
 */
export const updateTaskSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    status: z.enum(["active", "completed", "expired", "archived"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});