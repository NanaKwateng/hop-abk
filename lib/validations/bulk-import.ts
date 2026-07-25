// lib/validations/bulk-import.ts

import { z } from "zod";

export const importRowSchema = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name too long"),
    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name too long"),
    email: z
        .string()
        .email("Invalid email format")
        .optional()
        .or(z.literal("")),
    phone: z
        .string()
        .regex(/^[+]?[\d\s-]{7,15}$/, "Invalid phone format")
        .optional()
        .or(z.literal("")),
    gender: z
        .enum(["male", "female"], {
            message: "Gender must be 'male' or 'female'",
        })
        .optional()
        .or(z.literal("")),
    membershipId: z
        .string()
        .regex(/^[A-Z]{2,5}-[A-Z]{2,5}-\d{3,5}$/, {
            message: "Invalid membership ID format (e.g., HOP-ABK-001)",
        })
        .optional()
        .or(z.literal("")),
    placeOfStay: z
        .string()
        .max(100, "Place of stay too long")
        .optional()
        .or(z.literal("")),
    houseNumber: z
        .string()
        .max(50, "House number too long")
        .optional()
        .or(z.literal("")),
    memberPosition: z
        .enum(["elder", "deacon", "member"], {
            message: "Invalid position",
        })
        .optional()
        .or(z.literal("")),
    memberGroup: z
        .enum(["mens_fellowship", "womens_fellowship", "youth_fellowship"], {
            message: "Invalid group",
        })
        .optional()
        .or(z.literal("")),
    occupationType: z
        .enum(
            ["health", "business", "construction", "student", "fashion", "others"],
            { message: "Invalid occupation type" }
        )
        .optional()
        .or(z.literal("")),
    nickname: z
        .string()
        .min(2, "Nickname must be at least 2 characters")
        .max(50, "Nickname too long")
        .regex(
            /^[a-zA-Z0-9\s\-_]+$/,
            "Nickname can only contain letters, numbers, spaces, hyphens, and underscores"
        )
        .optional()
        .or(z.literal("")),
});

export type ImportRowData = z.infer<typeof importRowSchema>;

export const importFileSchema = z.object({
    file: z
        .instanceof(File)
        .refine(
            (file) =>
                file.type === "text/csv" ||
                file.type === "application/vnd.ms-excel" ||
                file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "File must be CSV or Excel (.xlsx)"
        )
        .refine(
            (file) => file.size <= 10 * 1024 * 1024,
            "File must be less than 10MB"
        ),
});

export type ImportFileInput = z.infer<typeof importFileSchema>;