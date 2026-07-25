// lib/types/nickname.ts

export interface NicknameMember {
    id: string;
    firstName: string;
    lastName: string;
    membershipId: string | null;
    avatarUrl: string | null;
    nickname: string | null;
    email: string | null;
    phone: string | null;
    memberGroup: string | null;
    memberPosition: string | null;
}

export interface NicknameSearchResult {
    members: NicknameMember[];
    totalCount: number;
}

export interface AddNicknamePayload {
    memberId: string;
    nickname: string;
}

export interface RemoveNicknamePayload {
    memberId: string;
}