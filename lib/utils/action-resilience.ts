// // lib/utils/action-resilience.ts
// "use server";

// /**
//  * Wraps a Server Action with an exponential backoff retry mechanism.
//  * Acts like a lightweight queue: if Supabase throws a transient traffic error 
//  * (deadlock, connection timeout, network failure), it waits and retries silently.
//  */
// export async function withActionRetry<T>(
//     actionFn: () => Promise<T>,
//     maxRetries: number = 3,
//     baseDelayMs: number = 500
// ): Promise<T> {
//     let attempt = 0;

//     while (attempt < maxRetries) {
//         try {
//             return await actionFn();
//         } catch (error: any) {
//             attempt++;

//             // Check if it's a transient error (network, DB lock, timeout)
//             // We DO NOT retry validation errors (e.g., "Member not found")
//             const msg = error.message?.toLowerCase() || "";
//             const isTransient =
//                 msg.includes("fetch") ||
//                 msg.includes("timeout") ||
//                 msg.includes("connection") ||
//                 msg.includes("deadlock") ||
//                 msg.includes("network");

//             // If it's a fatal error or we reached max attempts, throw immediately
//             if (!isTransient || attempt >= maxRetries) {
//                 console.error(`[ACTION FAILED] Final attempt ${attempt} failed:`, error.message);
//                 throw error;
//             }

//             // Exponential backoff: 500ms, 1000ms, 2000ms...
//             const delay = baseDelayMs * Math.pow(2, attempt - 1);
//             console.warn(`[ACTION QUEUED] Traffic/Network issue. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);

//             await new Promise((resolve) => setTimeout(resolve, delay));
//         }
//     }

//     throw new Error("Action failed after multiple retry attempts.");
// }


// lib/utils/action-resilience.ts

/**
 * ✅ PRODUCTION-READY: Retry wrapper with exponential backoff + jitter
 * 
 * @param actionFn - The async function to retry
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @param baseDelayMs - Base delay in ms (default: 500)
 * @returns Result of actionFn
 */
export async function withActionRetry<T>(
    actionFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 500
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await actionFn();
        } catch (error: any) {
            lastError = error;

            // ✅ Check for transient errors
            const msg = error?.message?.toLowerCase() || "";
            const isTransient =
                msg.includes("fetch") ||
                msg.includes("timeout") ||
                msg.includes("connection") ||
                msg.includes("deadlock") ||
                msg.includes("network") ||
                msg.includes("econnreset") ||
                msg.includes("enotfound") ||
                msg.includes("temporarily unavailable") ||
                error?.code === "ECONNRESET" ||
                error?.code === "ETIMEDOUT";

            // ✅ Don't retry validation/authorization errors
            const isFatal =
                msg.includes("not found") ||
                msg.includes("unauthorized") ||
                msg.includes("forbidden") ||
                msg.includes("invalid") ||
                msg.includes("duplicate") ||
                error?.code === "PGRST116"; // Supabase "not found" code

            // ✅ If fatal OR last attempt, throw immediately
            if (isFatal || attempt === maxRetries - 1) {
                if (process.env.NODE_ENV === "development") {
                    console.error(`[ACTION FAILED] Attempt ${attempt + 1}/${maxRetries}:`, error.message);
                }
                throw error;
            }

            // ✅ Only retry transient errors
            if (!isTransient) {
                throw error;
            }

            // ✅ Exponential backoff with jitter
            const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
            const jitter = Math.random() * 200; // Add 0-200ms randomness
            const delay = exponentialDelay + jitter;

            if (process.env.NODE_ENV === "development") {
                console.warn(
                    `[ACTION RETRY] Transient error. Retrying in ${Math.round(delay)}ms... ` +
                    `(Attempt ${attempt + 1}/${maxRetries})`
                );
            }

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    // ✅ This should never be reached, but TypeScript needs it
    throw lastError || new Error("Action failed after multiple retries");
}

/**
 * ✅ NEW: Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
    const msg = error?.message?.toLowerCase() || "";
    return (
        msg.includes("fetch") ||
        msg.includes("timeout") ||
        msg.includes("connection") ||
        msg.includes("deadlock") ||
        msg.includes("network") ||
        error?.code === "ECONNRESET" ||
        error?.code === "ETIMEDOUT"
    );
}