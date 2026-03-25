// src/lib/validations/member-schema.ts

import { z } from "zod";

/**
 * Schema for creating a NEW member (all fields from the registration form).
 */
export const createMemberSchema = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters.")
        .max(50, "First name must be less than 50 characters.")
        .trim(),

    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters.")
        .max(50, "Last name must be less than 50 characters.")
        .trim(),

    // ✅ FIXED: Changed to { message: ... } to satisfy Zod types
    gender: z
        .enum(["male", "female"], {
            message: "Please select a valid gender.",
        })
        .optional(),

    phone: z
        .string()
        .regex(/^[+]?[\d\s-]{7,15}$/, "Please enter a valid phone number.")
        .optional()
        .or(z.literal("")),

    // ✅ No .default()
    phoneCountry: z.string().min(1, "Phone country is required"),

    placeOfStay: z
        .string()
        .max(100, "Place of stay must be less than 100 characters.")
        .trim()
        .optional()
        .or(z.literal("")),

    houseNumber: z
        .string()
        .max(50, "House number must be less than 50 characters.")
        .trim()
        .optional()
        .or(z.literal("")),

    // ✅ FIXED
    memberPosition: z
        .enum(["elder", "deacon", "member"], {
            message: "Please select a valid position.",
        })
        .optional(),

    addressComments: z.string().max(500).optional().or(z.literal("")),

    // ✅ FIXED
    memberGroup: z
        .enum(["mens_fellowship", "womens_fellowship", "youth_fellowship"], {
            message: "Please select a valid group.",
        })
        .optional(),

    // ✅ FIXED
    occupationType: z
        .enum(
            ["health", "business", "construction", "student", "fashion", "others"],
            { message: "Please select a valid occupation." }
        )
        .optional(),

    roleComments: z.string().max(500).optional().or(z.literal("")),

    email: z
        .string()
        .email("Please enter a valid email address.")
        .trim()
        .toLowerCase()
        .optional()
        .or(z.literal("")),

    avatarUrl: z
        .string()
        .url("Please enter a valid URL.")
        .optional()
        .or(z.literal("")),

    membershipId: z
        .string()
        .regex(/^[A-Z]{2,5}-[A-Z]{2,5}-\d{3,5}$/, {
            message: "ID must follow format: HOP-ABK-001",
        })
        .optional()
        .or(z.literal("")),

    registrationDate: z.string().optional().or(z.literal("")),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

/**
 * Schema for editing an existing member.
 */
export const editMemberSchema = createMemberSchema;

export type EditMemberInput = z.infer<typeof editMemberSchema>;

/**
 * Schema for "Add Existing" flow
 */
export const addExistingMemberSchema = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters.")
        .trim(),

    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters.")
        .trim(),

    phone: z
        .string()
        .regex(/^[+]?[\d\s-]{7,15}$/, "Please enter a valid phone number.")
        .optional()
        .or(z.literal("")),

    phoneCountry: z.string().min(1, "Phone country is required"),

    // ✅ FIXED
    memberPosition: z
        .enum(["elder", "deacon", "member"], {
            message: "Please select a valid position.",
        })
        .optional(),

    // ✅ FIXED
    memberGroup: z
        .enum(["mens_fellowship", "womens_fellowship", "youth_fellowship"], {
            message: "Please select a valid group.",
        })
        .optional(),

    membershipId: z
        .string()
        .regex(/^[A-Z]{2,5}-[A-Z]{2,5}-\d{3,5}$/, {
            message: "ID must follow format: HOP-ABK-001",
        })
        .optional()
        .or(z.literal("")),

    registrationDate: z.string().optional().or(z.literal("")),
});

export type AddExistingMemberInput = z.infer<typeof addExistingMemberSchema>;

/**
 * Default form values
 */
export const createMemberDefaults: CreateMemberInput = {
    firstName: "",
    lastName: "",
    gender: undefined,
    phone: "",
    phoneCountry: "GH",
    placeOfStay: "",
    houseNumber: "",
    memberPosition: undefined,
    addressComments: "",
    memberGroup: undefined,
    occupationType: undefined,
    roleComments: "",
    email: "",
    avatarUrl: "",
    membershipId: "",
    registrationDate: "",
};

export const addExistingDefaults: AddExistingMemberInput = {
    firstName: "",
    lastName: "",
    phone: "",
    phoneCountry: "GH",
    memberPosition: undefined,
    memberGroup: undefined,
    membershipId: "",
    registrationDate: "",
};