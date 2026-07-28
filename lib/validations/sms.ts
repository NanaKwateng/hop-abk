// lib/validations/sms.ts

import { z } from "zod";

export const sendSMSSchema = z.object({
    recipientType: z.enum(['all', 'group', 'individual', 'filtered']),
    recipientGroup: z.enum(['mens_fellowship', 'womens_fellowship', 'youth_fellowship']).optional(),
    recipientIds: z.array(z.string().uuid()).optional(),
    message: z
        .string()
        .min(1, "Message is required")
        .max(1600, "Message exceeds maximum length"),
    subject: z.string().max(100).optional(),
    scheduledFor: z.string().datetime().optional(),
});

export const templateSchema = z.object({
    name: z.string().min(1, "Template name is required").max(100),
    subject: z.string().max(100).optional(),
    message: z.string().min(1, "Message is required").max(1600),
    category: z.enum(['welcome', 'payment_reminder', 'event', 'general', 'custom']),
    isShared: z.boolean().default(false),
});

export type SendSMSInput = z.infer<typeof sendSMSSchema>;
export type TemplateInput = z.infer<typeof templateSchema>;