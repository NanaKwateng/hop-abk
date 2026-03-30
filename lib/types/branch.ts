// lib/types/branch.ts

export type LeaderPosition = "pastor_rev" | "elder" | "deacon" | "deaconess" | "member";
export type MaritalStatus = "married" | "single";

export interface Branch {
    id: string;
    slug: string;
    name: string;
    location: string;
    address: string | null;
    gpsLat: number | null;
    gpsLng: number | null;
    gpsAddress: string | null;
    membershipSize: number;
    helpline: string | null;
    yearEstablished: number | null;

    // Leader
    leaderPosition: LeaderPosition;
    leaderFullName: string;
    leaderContact: string | null;
    leaderEmail: string | null;
    leaderAvatarUrl: string | null;
    leaderPlaceOfStay: string | null;
    leaderStatus: MaritalStatus;

    // Spouse
    spouseName: string | null;
    spouseContact: string | null;
    spouseEmail: string | null;
    spousePlaceOfStay: string | null;

    // Meta
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BranchRow {
    id: string;
    slug: string;
    name: string;
    location: string;
    address: string | null;
    gps_lat: number | null;
    gps_lng: number | null;
    gps_address: string | null;
    membership_size: number;
    helpline: string | null;
    year_established: number | null;
    leader_position: string;
    leader_full_name: string;
    leader_contact: string | null;
    leader_email: string | null;
    leader_avatar_url: string | null;
    leader_place_of_stay: string | null;
    leader_status: string;
    spouse_name: string | null;
    spouse_contact: string | null;
    spouse_email: string | null;
    spouse_place_of_stay: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateBranchPayload {
    name: string;
    location: string;
    address?: string;
    gpsLat?: number;
    gpsLng?: number;
    gpsAddress?: string;
    membershipSize: number;
    helpline?: string;
    yearEstablished?: number;
    leaderPosition: LeaderPosition;
    leaderFullName: string;
    leaderContact?: string;
    leaderEmail?: string;
    leaderAvatarUrl?: string;
    leaderPlaceOfStay?: string;
    leaderStatus: MaritalStatus;
    spouseName?: string;
    spouseContact?: string;
    spouseEmail?: string;
    spousePlaceOfStay?: string;
}

export interface UpdateBranchPayload extends Partial<CreateBranchPayload> {
    id: string;
}

export const LEADER_POSITIONS: { value: LeaderPosition; label: string }[] = [
    { value: "pastor_rev", label: "Pastor / Rev" },
    { value: "elder", label: "Elder" },
    { value: "deacon", label: "Deacon" },
    { value: "deaconess", label: "Deaconess" },
    { value: "member", label: "Member" },
];

export const MEMBERSHIP_SIZE_OPTIONS = [
    { value: 50, label: "Up to 50" },
    { value: 100, label: "Up to 100" },
    { value: 200, label: "Up to 200" },
    { value: 500, label: "Up to 500" },
    { value: 1000, label: "Up to 1,000" },
    { value: -1, label: "Custom" },
];