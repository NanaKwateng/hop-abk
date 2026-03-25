// src/lib/constants/index.ts

import type {
    Gender,
    MemberGroup,
    MemberPosition,
    OccupationType,
    SortField,
    Member,
} from "@/lib/types";

// ---- Dropdown Options ----

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
];

export const MEMBER_POSITION_OPTIONS: {
    label: string;
    value: MemberPosition;
}[] = [
        { label: "Elder", value: "elder" },
        { label: "Deacon", value: "deacon" },
        { label: "Member", value: "member" },
    ];

export const MEMBER_GROUP_OPTIONS: {
    label: string;
    value: MemberGroup;
}[] = [
        { label: "Men's Fellowship", value: "mens_fellowship" },
        { label: "Women's Fellowship", value: "womens_fellowship" },
        { label: "Youth Fellowship", value: "youth_fellowship" },
    ];

export const OCCUPATION_OPTIONS: {
    label: string;
    value: OccupationType;
}[] = [
        { label: "Health", value: "health" },
        { label: "Business & Trade", value: "business" },
        { label: "Construction", value: "construction" },
        { label: "Student", value: "student" },
        { label: "Fashion & Clothing", value: "fashion" },
        { label: "Others", value: "others" },
    ];

/**
 * Sortable fields for the table
 */
export const SORTABLE_FIELDS: { value: SortField; label: string }[] = [
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "email", label: "Email" },
    { value: "placeOfStay", label: "Location" },
    { value: "memberPosition", label: "Position" },
    { value: "memberGroup", label: "Group" },
    { value: "occupationType", label: "Occupation" },
    { value: "membershipId", label: "Membership ID" },
    { value: "createdAt", label: "Date Added" },
];

/**
 * Position badge colors
 */
export const POSITION_COLORS: Record<string, string> = {
    elder:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    deacon:
        "bg-pink-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    member:
        "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
};

/**
 * Group badge colors
 */
export const GROUP_COLORS: Record<string, string> = {
    mens_fellowship:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    womens_fellowship:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
    youth_fellowship:
        "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
};

/**
 * Human-readable labels for enum values
 */
export const POSITION_LABELS: Record<string, string> = {
    elder: "Elder",
    deacon: "Deacon",
    member: "Member",
};

export const GROUP_LABELS: Record<string, string> = {
    mens_fellowship: "Men's Fellowship",
    womens_fellowship: "Women's Fellowship",
    youth_fellowship: "Youth Fellowship",
};

export const OCCUPATION_LABELS: Record<string, string> = {
    health: "Health",
    business: "Business & Trade",
    construction: "Construction",
    student: "Student",
    fashion: "Fashion & Clothing",
    others: "Others",
};

export const GENDER_LABELS: Record<string, string> = {
    male: "Male",
    female: "Female",
};

/**
 * Columns available for export
 */
export const EXPORTABLE_COLUMNS: {
    label: string;
    value: keyof Member;
}[] = [
        { label: "First Name", value: "firstName" },
        { label: "Last Name", value: "lastName" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Gender", value: "gender" },
        { label: "Location", value: "placeOfStay" },
        { label: "House Number", value: "houseNumber" },
        { label: "Position", value: "memberPosition" },
        { label: "Group", value: "memberGroup" },
        { label: "Occupation", value: "occupationType" },
        { label: "Membership ID", value: "membershipId" },
        { label: "Address Comments", value: "addressComments" },
        { label: "Role Comments", value: "roleComments" },
        { label: "Date Added", value: "createdAt" },
    ];

/** Default page size */
export const DEFAULT_PAGE_SIZE = 20;

/** Page size options */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];