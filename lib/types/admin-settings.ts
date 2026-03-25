// lib/types/admin-settings.ts

export interface AdminProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    role: string;
    isPrimaryAdmin: boolean;
    createdAt: string;
    // Linked member info (if membership ID matched)
    membershipId: string | null;
    memberGroup: string | null;
    memberPosition: string | null;
}

export interface AdminInvite {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    membershipId: string | null;
    invitedBy: string;
    createdAt: string;
}

export interface AuditLogEntry {
    id: string;
    userId: string | null;
    userEmail: string | null;
    userName: string | null;
    action: string;
    entity: string | null;
    entityId: string | null;
    metadata: Record<string, any> | null;
    createdAt: string;
}

export interface ImpersonationLogEntry {
    id: string;
    adminId: string;
    adminEmail: string | null;
    adminName: string | null;
    targetUserId: string;
    targetEmail: string | null;
    targetName: string | null;
    createdAt: string;
}