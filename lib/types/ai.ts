// lib/types/ai.ts

export type AIQueryType = 'voice' | 'text' | 'chat';
export type AIIntent =
    | 'member_query'
    | 'payment_query'
    | 'task_query'
    | 'analytics_query'
    | 'search_query'
    | 'general_query'
    | 'workflow_query'
    | 'branch_query'
    | 'sms_query';

export type AIProvider = 'google' | 'grok';

export interface AIQuery {
    id?: string;
    query: string;
    type: AIQueryType;
    sessionId?: string;
    context?: {
        previousMessages?: Array<{
            role: 'user' | 'assistant';
            content: string;
        }>;
        entities?: Record<string, any>;
        currentData?: any;
    };
}

export interface AIResponse {
    success: boolean;
    message: string;
    data?: any;
    chart?: {
        type: 'bar' | 'line' | 'pie' | 'table';
        data: any;
        config: {
            xAxis?: string;
            yAxis?: string;
            label?: string;
            value?: string;
            columns?: string[];
            title?: string;
        };
    };
    suggestions?: string[];
    followUp?: string[];
    confidence: number;
    intent: AIIntent;
    executionTime?: number;
    raw?: any;
}

export interface AIContext {
    sessionId: string;
    conversation: Array<{
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
        data?: any;
    }>;
    currentData?: any;
    lastIntent?: AIIntent;
}

export interface VoiceSearchResult {
    transcript: string;
    confidence: number;
    query: AIQuery;
    response: AIResponse;
}

export interface AISession {
    id: string;
    userId: string;
    context: AIContext;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}