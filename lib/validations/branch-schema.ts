// lib/validations/branch-schema.ts

import { z } from "zod";

// ✅ Define base schemas
const leaderPositionEnum = z.enum([
    "pastor_rev",
    "elder",
    "deacon",
    "deaconess",
    "member",
]);

const leaderStatusEnum = z.enum(["married", "single"]);

export const branchSchema = z.object({
    // Step 1: Basic Info
    name: z
        .string()
        .min(2, "Branch name must be at least 2 characters")
        .max(100),
    location: z.string().min(2, "Location is required").max(200),
    address: z.string().max(300).optional().or(z.literal("")),
    gpsAddress: z.string().max(500).optional().or(z.literal("")),
    gpsLat: z.number().optional(),
    gpsLng: z.number().optional(),

    // Step 2: Details
    membershipSize: z
        .number()
        .min(1, "Membership size must be at least 1")
        .max(100000),
    helpline: z.string().max(50).optional().or(z.literal("")),
    yearEstablished: z
        .number()
        .min(1800)
        .max(new Date().getFullYear())
        .optional(),

    // Step 3: Leader
    leaderPosition: leaderPositionEnum,
    leaderFullName: z.string().min(2, "Leader name is required").max(100),
    leaderContact: z.string().max(50).optional().or(z.literal("")),
    leaderEmail: z
        .string()
        .email("Invalid email")
        .optional()
        .or(z.literal("")),
    leaderPlaceOfStay: z.string().max(200).optional().or(z.literal("")),

    // ✅ FIXED: Removed .default("single") — this was causing the type mismatch
    // between Zod's input type (where default makes the field optional/unknown on input)
    // and react-hook-form's Resolver which expects input and output types to align.
    leaderStatus: leaderStatusEnum,

    // Spouse (conditional)
    spouseName: z.string().max(100).optional().or(z.literal("")),
    spouseContact: z.string().max(50).optional().or(z.literal("")),
    spouseEmail: z
        .string()
        .email("Invalid email")
        .optional()
        .or(z.literal("")),
    spousePlaceOfStay: z.string().max(200).optional().or(z.literal("")),
});

export type BranchFormInput = z.infer<typeof branchSchema>;

// ✅ Export for use in components
export { leaderPositionEnum, leaderStatusEnum };