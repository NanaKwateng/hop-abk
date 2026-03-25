// src/lib/utils/member-mapper.ts

// ============================================================
// Converts between Supabase row format (snake_case) and
// frontend format (camelCase).
//
// DB row:  { first_name: "John", member_position: "elder" }
// Frontend: { firstName: "John", memberPosition: "elder" }
// ============================================================

import type {
    MemberRow,
    Member,
    MemberFormData,
    Gender,
    MemberPosition,
    MemberGroup,
    OccupationType,
} from "@/lib/types";

/**
 * Convert a Supabase row → frontend Member object.
 * Called after every SELECT query.
 */
export function rowToMember(row: MemberRow): Member {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        gender: (row.gender as Gender) || null,
        phone: row.phone || null,
        phoneCountry: row.phone_country || null,
        placeOfStay: row.place_of_stay || null,
        houseNumber: row.house_number || null,
        memberPosition: (row.member_position as MemberPosition) || null,
        addressComments: row.address_comments || null,
        memberGroup: (row.member_group as MemberGroup) || null,
        occupationType: (row.occupation_type as OccupationType) || null,
        roleComments: row.role_comments || null,
        email: row.email || null,
        avatarUrl: row.avatar_url || null,
        membershipId: row.membership_id || null,
        createdBy: row.created_by || null,
        createdAt: row.created_at || null,
    };
}

/**
 * Convert multiple rows at once.
 */
export function rowsToMembers(rows: MemberRow[]): Member[] {
    return rows.map(rowToMember);
}

/**
 * Convert frontend MemberFormData → Supabase insert/update object.
 * Called before every INSERT/UPDATE query.
 */
export function memberFormToRow(
    data: MemberFormData
): Record<string, unknown> {
    const row: Record<string, unknown> = {};

    // Only include fields that are defined (for partial updates)
    if (data.firstName !== undefined) row.first_name = data.firstName;
    if (data.lastName !== undefined) row.last_name = data.lastName;
    if (data.gender !== undefined) row.gender = data.gender;
    if (data.phone !== undefined) row.phone = data.phone;
    if (data.phoneCountry !== undefined) row.phone_country = data.phoneCountry;
    if (data.placeOfStay !== undefined) row.place_of_stay = data.placeOfStay;
    if (data.houseNumber !== undefined) row.house_number = data.houseNumber;
    if (data.memberPosition !== undefined)
        row.member_position = data.memberPosition;
    if (data.addressComments !== undefined)
        row.address_comments = data.addressComments;
    if (data.memberGroup !== undefined) row.member_group = data.memberGroup;
    if (data.occupationType !== undefined)
        row.occupation_type = data.occupationType;
    if (data.roleComments !== undefined) row.role_comments = data.roleComments;
    if (data.email !== undefined) row.email = data.email;
    if (data.avatarUrl !== undefined) row.avatar_url = data.avatarUrl;
    if (data.membershipId !== undefined) row.membership_id = data.membershipId;

    return row;
}