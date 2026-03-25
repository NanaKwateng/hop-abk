// lib/utils/cache-helpers.ts
import { unstable_cache } from "next/cache";

/**
 * Caches heavy database queries. If multiple admins load the dashboard, 
 * the database is queried only ONCE. The rest get the lightning-fast cached version.
 * 
 * @param queryFn The async function fetching the data
 * @param keyParts Array of strings/numbers identifying this specific data
 * @param revalidateTime Time in seconds before checking the database again (default: 60s)
 */
export function withAnalyticsCache<T>(
    queryFn: () => Promise<T>,
    keyParts: string[],
    revalidateTime: number = 60
): () => Promise<T> {
    return unstable_cache(
        async () => {
            return await queryFn();
        },
        keyParts,
        {
            revalidate: revalidateTime,
            tags: keyParts, // Allows targeted clearing via revalidateTag if needed
        }
    );
}