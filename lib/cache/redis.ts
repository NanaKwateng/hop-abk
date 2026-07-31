// lib/cache/redis.ts

import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
    if (redisClient) return redisClient;

    try {
        const host = process.env.REDIS_HOST || "localhost";
        const port = parseInt(process.env.REDIS_PORT || "6379");
        const password = process.env.REDIS_PASSWORD;

        redisClient = new Redis({
            host,
            port,
            password,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        });

        // Handle errors
        redisClient.on("error", (error) => {
            console.error("[Redis] Connection error:", error);
        });

        redisClient.on("connect", () => {
            console.log("[Redis] Connected successfully");
        });

        return redisClient;
    } catch (error) {
        console.error("[Redis] Failed to initialize:", error);
        return null;
    }
}

/**
 * Rate limiter using Redis
 */
export async function rateLimit(
    key: string,
    limit: number = 10,
    window: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
    const redis = getRedisClient();
    if (!redis) {
        // If Redis is not available, allow all requests
        return { success: true, remaining: limit, reset: Date.now() + window * 1000 };
    }

    try {
        const now = Date.now();
        const windowKey = `${key}:${Math.floor(now / (window * 1000))}`;

        const count = await redis.incr(windowKey);
        if (count === 1) {
            await redis.expire(windowKey, window);
        }

        const remaining = Math.max(0, limit - count);
        const reset = Math.floor((Math.floor(now / (window * 1000)) + 1) * window * 1000);

        return {
            success: count <= limit,
            remaining,
            reset,
        };
    } catch (error) {
        console.error("[Rate Limit] Error:", error);
        return { success: true, remaining: limit, reset: Date.now() + window * 1000 };
    }
}

/**
 * Cache data in Redis
 */
export async function cacheSet(key: string, value: any, ttl: number = 300): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
        const serialized = JSON.stringify(value);
        await redis.setex(key, ttl, serialized);
        return true;
    } catch (error) {
        console.error("[Cache] Set error:", error);
        return false;
    }
}

/**
 * Get cached data from Redis
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch (error) {
        console.error("[Cache] Get error:", error);
        return null;
    }
}

/**
 * Delete cached data from Redis
 */
export async function cacheDelete(key: string): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
        await redis.del(key);
        return true;
    } catch (error) {
        console.error("[Cache] Delete error:", error);
        return false;
    }
}

/**
 * Clear all cached data with a prefix
 */
export async function cacheClearPrefix(prefix: string): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
        const keys = await redis.keys(`${prefix}:*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
        return true;
    } catch (error) {
        console.error("[Cache] Clear prefix error:", error);
        return false;
    }
}