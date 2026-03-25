// lib/validations/workflow-schema.ts

import { z } from "zod";

export const workflowSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    dateRange: z
        .object(
            {
                // ✅ FIXED: Changed required_error to message
                from: z.date({ message: "Start date is required" }),
                to: z.date({ message: "End date is required" }),
            },
            // ✅ FIXED: Changed required_error to message
            { message: "Select a date range" }
        )
        .refine((range) => range.from < range.to, {
            message: "End date must be after start date",
        }),
    memberIds: z
        .array(z.string().uuid())
        .min(1, "Select at least one member")
        .max(150, "Maximum 150 members allowed"),
    // ✅ FIXED: Changed required_error to message
    type: z.enum(["records", "payments", "roles", "monitor"], {
        message: "Select a workflow action",
    }),
});

export type CreateWorkflowInput = z.infer<typeof workflowSchema>;

export const workflowEntrySchema = z.object({
    workflowId: z.string().uuid(),
    memberId: z.string().uuid(),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(1000).optional(),
    amount: z.number().min(0).optional(),
    roleTitle: z.string().max(200).optional(),
    roleDescription: z.string().max(1000).optional(),
    entryType: z.enum(["record", "payment", "role", "monitor"]),
    paymentDate: z.string().optional(),
    status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
});

export const updateWorkflowEntrySchema = z.object({
    id: z.string().uuid(),
    workflowId: z.string().uuid(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    amount: z.number().min(0).optional(),
    roleTitle: z.string().max(200).optional(),
    roleDescription: z.string().max(1000).optional(),
    paymentDate: z.string().optional(),
    status: z.enum(["pending", "completed", "cancelled"]).optional(),
});