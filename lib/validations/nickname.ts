// lib/validations/nickname.ts

import { z } from "zod";

export const nicknameSchema = z.object({
    nickname: z
        .string()
        .min(2, "Nickname must be at least 2 characters")
        .max(50, "Nickname must be less than 50 characters")
        .regex(
            /^[a-zA-Z0-9\s\-_]+$/,
            "Nickname can only contain letters, numbers, spaces, hyphens, and underscores"
        )
        .trim(),
});

export type NicknameInput = z.infer<typeof nicknameSchema>;

export const nicknameSearchSchema = z.object({
    query: z
        .string()
        .min(1, "Search query is required")
        .max(50, "Search query is too long")
        .trim(),
    limit: z.number().min(1).max(50).default(10),
});

export type NicknameSearchInput = z.infer<typeof nicknameSearchSchema>;