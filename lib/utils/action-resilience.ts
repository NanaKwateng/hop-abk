// lib/utils/action-resilience.ts
"use server";

/**
 * Wraps a Server Action with an exponential backoff retry mechanism.
 * Acts like a lightweight queue: if Supabase throws a transient traffic error 
 * (deadlock, connection timeout, network failure), it waits and retries silently.
 */
export async function withActionRetry<T>(
    actionFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 500
): Promise<T> {
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            return await actionFn();
        } catch (error: any) {
            attempt++;

            // Check if it's a transient error (network, DB lock, timeout)
            // We DO NOT retry validation errors (e.g., "Member not found")
            const msg = error.message?.toLowerCase() || "";
            const isTransient =
                msg.includes("fetch") ||
                msg.includes("timeout") ||
                msg.includes("connection") ||
                msg.includes("deadlock") ||
                msg.includes("network");

            // If it's a fatal error or we reached max attempts, throw immediately
            if (!isTransient || attempt >= maxRetries) {
                console.error(`[ACTION FAILED] Final attempt ${attempt} failed:`, error.message);
                throw error;
            }

            // Exponential backoff: 500ms, 1000ms, 2000ms...
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            console.warn(`[ACTION QUEUED] Traffic/Network issue. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw new Error("Action failed after multiple retry attempts.");
}