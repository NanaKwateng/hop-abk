// lib/ai/config.ts

export const AI_CONFIG = {
    // Provider: 'google' | 'grok'
    provider: (process.env.AI_PROVIDER || 'google') as 'google' | 'grok',

    // Google AI (Gemini)
    google: {
        apiKey: process.env.GOOGLE_AI_API_KEY,
        model: process.env.NEXT_PUBLIC_GOOGLE_AI_MODEL || 'gemini-1.5-pro',
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
        topP: 0.95,
        topK: 40,
        timeout: 30000,
    },

    // Grok (xAI) - Fallback (optional)
    grok: {
        apiKey: process.env.XAI_API_KEY,
        model: process.env.XAI_MODEL || 'grok-1',
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
        timeout: 30000,
    },

    // Embedding
    embedding: {
        model: process.env.AI_EMBEDDING_MODEL || 'text-embedding-004',
        dimensions: 768,
    },

    // Rate limiting
    rateLimit: {
        requestsPerMinute: parseInt(process.env.AI_RATE_LIMIT_REQUESTS || '60'),
        window: parseInt(process.env.AI_RATE_LIMIT_WINDOW || '60'),
    },

    // Features
    features: {
        enableVoice: true,
        enableSuggestions: true,
        enableCharts: true,
        enableFollowUp: true,
        enableContextMemory: true,
    },
};

export type AIProvider = 'google' | 'grok';