// src/lib/types.ts

// ============================================================
// Supabase row shape (snake_case — matches DB columns exactly)
// ============================================================

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

// ============================================================
// Frontend shape (camelCase — used in components)
// ============================================================

export type Gender = "male" | "female";

export type MemberPosition = "elder" | "deacon" | "member";

// ✅ FIXED: Changed from empty string to proper union type
export type OccupationType =
    | "health"
    | "business"
    | "construction"
    | "student"
    | "fashion"
    | "others";

export type MemberGroup =
    | "mens_fellowship"
    | "womens_fellowship"
    | "youth_fellowship";

// ✅ FIXED: Changed from empty string to proper interface
// This is the main type used throughout the app (camelCase)
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

// ✅ FIXED: Alias for backward compatibility (if needed)
// Use this if some parts of code refer to User instead of Member
export type User = Member;

// ============================================================
// Form data shape (for create/update operations)
// ============================================================

export interface MemberFormData {
    firstName?: string;
    lastName?: string;
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
    avatarUrl?: string | null;
    membershipId?: string;
    registrationDate?: string;
}

// ============================================================
// Query / filter / pagination types
// ============================================================

export type SortDirection = "asc" | "desc";

export interface FilterConfig {
    field: keyof Member;
    value: string;
}

export interface MemberQueryParams {
    search?: string;
    page: number;
    pageSize: number;
    sortField?: keyof Member;
    sortDirection?: SortDirection;
    filters?: FilterConfig[];
}

export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// ============================================================
// Export configuration
// ============================================================

export interface ExportConfig {
    columns: (keyof Member)[];
    format: "csv" | "xlsx";
    scope: "all" | "filtered" | "selected";
    fileName?: string;
}