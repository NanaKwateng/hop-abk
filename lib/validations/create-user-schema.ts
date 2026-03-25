// src/lib/validations/create-user-schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
    // Step 1 — Basic Info
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name too long"),

    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name too long"),

    // ✅ FIXED: Use 'message' instead of 'errorMap'
    gender: z.enum(["male", "female"], {
        message: "Please select a gender",
    }),

    phone: z
        .string()
        .min(7, "Phone number must be at least 7 digits")
        .max(20, "Phone number too long"),

    phoneCountry: z.string().min(1, "Phone country is required"),

    agreeToRegulations: z
        .boolean()
        .refine((val) => val === true, "You must agree to regulations"),

    // Step 2 — Address Details
    placeOfStay: z
        .string()
        .min(2, "Place of stay is required")
        .max(100),

    houseNumber: z
        .string()
        .min(1, "House number is required")
        .max(50),

    // ✅ FIXED: Use 'message' instead of 'errorMap'
    memberPosition: z.enum(["elder", "deacon", "member"], {
        message: "Select a position",
    }),

    addressComments: z.string().max(500).optional(),

    // Step 3 — Roles & Duties
    // ✅ FIXED: Use 'message' instead of 'errorMap'
    memberGroup: z.enum(["mens_fellowship", "womens_fellowship", "youth_fellowship"], {
        message: "Select a member group",
    }),

    // ✅ FIXED: Use 'message' instead of 'errorMap'
    occupationType: z.enum([
        "health",
        "business",
        "construction",
        "student",
        "fashion",
        "others",
    ], {
        message: "Select an occupation type",
    }),

    email: z.string().email("Invalid email").optional().or(z.literal("")),

    dateOfBirth: z.string().nullish(),

    roleComments: z.string().max(500).optional(),

    // Step 4 — Avatar
    avatarUrl: z.string().optional(),
    avatarFile: z.any().optional(),

    // Step 5 — Membership ID
    membershipId: z
        .string()
        .min(5, "Membership ID must be at least 5 characters")
        .regex(
            /^[A-Z]{2,5}-[A-Z]{2,5}-\d{3,5}$/,
            "ID must follow format: HOP-ABK-001"
        ),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const STEP_FIELDS: Record<number, (keyof CreateUserInput)[]> = {
    1: ["firstName", "lastName", "gender", "phone", "phoneCountry", "agreeToRegulations"],
    2: ["placeOfStay", "houseNumber", "memberPosition", "addressComments"],
    3: ["memberGroup", "occupationType", "email", "dateOfBirth", "roleComments"],
    4: ["avatarUrl", "avatarFile"],
    5: ["membershipId"],
    6: [], // Certificate step — no validation needed, it's view-only
};

export const STEP_LABELS = [
    "Basic Info",
    "Address",
    "Roles & Duties",
    "Profile Photo",
    "Membership ID",
    "Certificate",
] as const;

export const TOTAL_STEPS = 6;