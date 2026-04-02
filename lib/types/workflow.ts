// lib/types/workflow.ts

export interface Workflow {
    id: string;
    slug: string;
    name: string;
    type: "records" | "payments" | "roles" | "monitor";
    startDate: string;
    endDate: string;
    memberCount: number;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowMember {
    id: string;
    workflowId: string;
    memberId: string;
    firstName: string;
    lastName: string;
    membershipId: string | null;
    avatarUrl: string | null;
    memberGroup: string | null;
    createdAt: string;
}

export interface WorkflowEntry {
    id: string;
    workflowId: string;
    memberId: string;
    memberFirstName: string;
    memberLastName: string;
    memberAvatarUrl: string | null;
    title: string;
    description: string | null;
    amount: number | null;
    roleTitle: string | null;
    roleDescription: string | null;
    entryType: "record" | "payment" | "role" | "monitor";
    paymentDate: string | null;
    status: "pending" | "completed" | "cancelled";
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowDetail extends Workflow {
    members: WorkflowMember[];
    entries: WorkflowEntry[];
}

export interface CreateWorkflowPayload {
    name: string;
    startDate: string;
    endDate: string;
    memberIds: string[];
    type: "records" | "payments" | "roles" | "monitor";
}

export interface CreateWorkflowEntryPayload {
    workflowId: string;
    memberId: string;
    title: string;
    description?: string;
    amount?: number;
    roleTitle?: string;
    roleDescription?: string;
    entryType: "record" | "payment" | "role" | "monitor";
    paymentDate?: string;
    status?: "pending" | "completed" | "cancelled";
}

export interface UpdateWorkflowEntryPayload {
    id: string;
    workflowId: string;
    title?: string;
    description?: string;
    amount?: number;
    roleTitle?: string;
    roleDescription?: string;
    paymentDate?: string;
    status?: "pending" | "completed" | "cancelled";
}