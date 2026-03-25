// src/lib/types/index.ts

// ============================================================
// All TypeScript types aligned with Supabase `members` table.
// snake_case in DB → camelCase in frontend via mapping functions.
// ============================================================

/**
 * Gender — matches DB text field (only male/female used in the form)
 */
export type Gender = "male" | "female";

/**
 * Member positions — exactly 3 as in the database
 */
export type MemberPosition = "elder" | "deacon" | "member";

/**
 * Member groups — exactly 3 fellowships
 */
export type MemberGroup =
    | "mens_fellowship"
    | "womens_fellowship"
    | "youth_fellowship";

/**
 * Occupation types — matches the form step-three select options
 */
export type OccupationType =
    | "health"
    | "business"
    | "construction"
    | "student"
    | "fashion"
    | "others";

/**
 * Raw row from Supabase `members` table.
 * This is what comes back from `supabase.from("members").select()`.
 */
export interface MemberRow {
    id: string;
    first_name: string;
    last_name: string;
    gender: string | null;
    phone: string | null;
    phone_country: string | null;
    place_of_stay: string | null;
    house_number: string | null;
    member_position: string | null;
    address_comments: string | null;
    member_group: string | null;
    occupation_type: string | null;
    role_comments: string | null;
    email: string | null;
    avatar_url: string | null;
    membership_id: string | null;
    created_by: string | null;
    created_at: string | null;
}

/**
 * Frontend-friendly Member object (camelCase).
 * This is what components work with.
 */
export interface Member {
    id: string;
    firstName: string;
    lastName: string;
    gender: Gender | null;
    phone: string | null;
    phoneCountry: string | null;
    placeOfStay: string | null;
    houseNumber: string | null;
    memberPosition: MemberPosition | null;
    addressComments: string | null;
    memberGroup: MemberGroup | null;
    occupationType: OccupationType | null;
    roleComments: string | null;
    email: string | null;
    avatarUrl: string | null;
    membershipId: string | null;
    createdBy: string | null;
    createdAt: string | null;
}

/**
 * Data needed to CREATE a member.
 * No id, createdAt, createdBy — system generates those.
 */
export interface MemberFormData {
    firstName: string;
    lastName: string;
    gender?: Gender;
    phone?: string;
    phoneCountry?: string;
    placeOfStay?: string;
    houseNumber?: string;
    memberPosition?: MemberPosition;
    addressComments?: string;
    memberGroup?: MemberGroup;
    occupationType?: OccupationType;
    roleComments?: string;
    email?: string;
    avatarUrl?: string;
    membershipId?: string;
    registrationDate?: string;
}

/**
 * Sorting types
 */
export type SortField = keyof Member;
export type SortDirection = "asc" | "desc";

export interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
    field: keyof Member;
    value: string;
}

/**
 * Parameters for fetching members
 */
export interface MemberQueryParams {
    search?: string;
    page: number;
    pageSize: number;
    sortField?: SortField;
    sortDirection?: SortDirection;
    filters?: FilterConfig[];
}

/**
 * Paginated response shape
 */
export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

/**
 * Export configuration
 */
export interface ExportConfig {
    columns: (keyof Member)[];
    format: "csv" | "xlsx";
    scope: "all" | "filtered" | "selected";
    fileName?: string;
}

export interface MemberPayment {
    id: string
    memberId: string
    paymentYear: number
    paymentMonth: number
    status: "paid" | "unpaid"
    amount?: number | null
    notes?: string | null
    createdAt?: string | null
}

export interface MemberTestimonial {
    id: string
    memberId: string
    title: string
    content: string
    category?: string | null
    createdAt?: string | null
}