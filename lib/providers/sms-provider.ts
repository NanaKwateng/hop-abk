// lib/providers/sms-provider.ts

interface SMSProviderConfig {
    apiKey: string;
    username: string;
    senderId: string;
}

export interface SendSMSResponse {
    success: boolean;
    messageId?: string;
    error?: string;
    recipientResults?: Array<{
        phone: string;
        status: 'sent' | 'failed';
        messageId?: string;
        error?: string;
    }>;
}

export interface ISMSProvider {
    sendSMS(
        recipients: string[],
        message: string,
        options?: { scheduledFor?: Date }
    ): Promise<SendSMSResponse>;
    getDeliveryStatus(messageId: string): Promise<{
        status: 'sent' | 'delivered' | 'failed';
        details?: any;
    }>;
    getBalance(): Promise<{ balance: number; currency: string }>;
}

/**
 * Africa's Talking SMS Provider
 * Supports bulk SMS with delivery reports
 */
export class AfricaTalkingProvider implements ISMSProvider {
    private config: SMSProviderConfig;

    constructor(config: SMSProviderConfig) {
        this.config = config;
    }

    private get baseUrl(): string {
        return this.config.username.toLowerCase() === 'sandbox'
            ? 'https://api.sandbox.africastalking.com'
            : 'https://api.africastalking.com';
    }

    async sendSMS(
        recipients: string[],
        message: string,
        options?: { scheduledFor?: Date }
    ): Promise<SendSMSResponse> {
        try {
            const url = `${this.baseUrl}/version1/messaging`;
            const body = new URLSearchParams({
                username: this.config.username,
                to: recipients.join(','),
                message: message,
                from: this.config.senderId,
            });

            if (options?.scheduledFor) {
                body.append('schedule', options.scheduledFor.toISOString().replace(/[:\-.]/g, ''));
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'apiKey': this.config.apiKey,
                },
                body: body.toString(),
            });

            const data = await response.json();

            if (data.SMSMessageData?.Recipients) {
                const results = data.SMSMessageData.Recipients.map((r: any) => ({
                    phone: r.number,
                    status: r.status === 'Success' ? 'sent' : 'failed',
                    messageId: r.messageId,
                    error: r.status === 'Success' ? undefined : r.status,
                }));

                return {
                    success: true,
                    messageId: data.SMSMessageData.Recipients[0]?.messageId,
                    recipientResults: results,
                };
            }

            return {
                success: false,
                error: data?.errorMessage || data?.error || 'Failed to send SMS',
            };
        } catch (error) {
            console.error('[SMS Provider] Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async getDeliveryStatus(messageId: string): Promise<{
        status: 'sent' | 'delivered' | 'failed';
        details?: any;
    }> {
        try {
            const url = `${this.baseUrl}/version1/messaging?username=${encodeURIComponent(this.config.username)}&messageId=${messageId}`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'apiKey': this.config.apiKey,
                },
            });

            const data = await response.json();
            const recipient = data?.SMSMessageData?.Recipients?.[0];

            if (!recipient) {
                return { status: 'failed' };
            }

            return {
                status: recipient.status === 'Success' ? 'delivered' : 'failed',
                details: recipient,
            };
        } catch (error) {
            console.error('[SMS Provider] Delivery status error:', error);
            return { status: 'failed' };
        }
    }

    async getBalance(): Promise<{ balance: number; currency: string }> {
        try {
            const url = `${this.baseUrl}/version1/user?username=${encodeURIComponent(this.config.username)}`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'apiKey': this.config.apiKey,
                },
            });

            const data = await response.json();
            const userData = data?.UserData;

            if (userData) {
                const balanceStr = userData.balance || '0';
                const parts = balanceStr.trim().split(' ');

                // Matches standard "KES 100.00" return format
                const currency = parts.length > 1 ? parts[0] : 'KES';
                const balance = parseFloat(balanceStr.replace(/[^0-9.]/g, '')) || 0;

                return { balance, currency };
            }

            return { balance: 0, currency: 'KES' };
        } catch (error) {
            console.error('[SMS Provider] Balance error:', error);
            return { balance: 0, currency: 'KES' };
        }
    }
}

// Mock provider for development
export class MockSMSProvider implements ISMSProvider {
    async sendSMS(recipients: string[], message: string): Promise<SendSMSResponse> {
        await new Promise(resolve => setTimeout(resolve, 300));

        return {
            success: true,
            messageId: `mock_${Date.now()}`,
            recipientResults: recipients.map(phone => ({
                phone,
                status: 'sent',
                messageId: `mock_${Date.now()}_${phone}`,
            })),
        };
    }

    async getDeliveryStatus(messageId: string) {
        return { status: 'delivered' as const };
    }

    async getBalance() {
        return { balance: 500, currency: 'KES' };
    }
}

// Consolidated factory function
export function createSMSProvider(useMock: boolean = false): ISMSProvider {
    if (useMock || process.env.NODE_ENV === 'development') {
        return new MockSMSProvider();
    }

    const apiKey = process.env.AFRICA_TALKING_API_KEY;
    const username = process.env.AFRICA_TALKING_USERNAME;
    const senderId = process.env.AFRICA_TALKING_SENDER_ID || 'HOPM';

    if (!apiKey || !username) {
        throw new Error('SMS provider configuration missing: AFRICA_TALKING_API_KEY or AFRICA_TALKING_USERNAME is not set');
    }

    return new AfricaTalkingProvider({ apiKey, username, senderId });
}