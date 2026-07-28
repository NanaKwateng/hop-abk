// lib/types/sms.ts - Add TemplateInput type

export type RecipientType = 'all' | 'group' | 'individual' | 'filtered';
export type MemberGroup = 'mens_fellowship' | 'womens_fellowship' | 'youth_fellowship';
export type MessageStatus = 'pending' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export interface SMSMessage {
    id: string;
    senderId: string;
    subject: string | null;
    message: string;
    recipientType: RecipientType;
    recipientGroup: MemberGroup | null;
    recipientIds: string[] | null;
    status: MessageStatus;
    scheduledFor: string | null;
    sentAt: string | null;
    totalRecipients: number;
    deliveredCount: number;
    failedCount: number;
    createdAt: string;
    createdBy: string;
    senderName?: string;
}

export interface SMSTemplate {
    id: string;
    name: string;
    subject: string | null;
    message: string;
    category: 'welcome' | 'payment_reminder' | 'event' | 'general' | 'custom';
    createdAt: string;
    createdBy: string;
    isShared: boolean;
    usageCount?: number;
}

// ✅ TemplateInput - This was missing
export interface TemplateInput {
    name: string;
    subject?: string;
    message: string;
    category: 'welcome' | 'payment_reminder' | 'event' | 'general' | 'custom';
    isShared?: boolean;
}

export interface SMSRecipient {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    membershipId: string | null;
    memberGroup: MemberGroup | null;
    memberPosition: string | null;
    email: string | null;
}

export interface SMSDeliveryLog {
    id: string;
    messageId: string;
    memberId: string;
    phone: string;
    status: DeliveryStatus;
    providerResponse: string | null;
    sentAt: string | null;
    deliveredAt: string | null;
    errorMessage: string | null;
    memberName?: string;
}

export interface SendSMSInput {
    recipientType: RecipientType;
    recipientGroup?: MemberGroup;
    recipientIds?: string[];
    message: string;
    subject?: string;
    scheduledFor?: string;
}

export interface SMSSendResult {
    success: boolean;
    messageId: string;
    totalRecipients: number;
    sentCount: number;
    failedCount: number;
    errors?: string[];
}