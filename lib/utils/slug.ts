// lib/utils/slug.ts

/**
 * Generate a URL-safe slug from a workflow name.
 * Appends a short unique suffix to prevent collisions.
 *
 * "Q3 Tithe Collection" → "q3-tithe-collection-a1b2c3"
 */
export function generateSlug(name: string): string {
    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")    // remove special chars
        .replace(/\s+/g, "-")         // spaces → hyphens
        .replace(/-+/g, "-")          // collapse multiple hyphens
        .replace(/^-|-$/g, "");       // trim leading/trailing hyphens

    // 6-char random suffix for uniqueness
    const suffix = Math.random().toString(36).substring(2, 8);

    return `${base}-${suffix}`;
}

/**
 * Sanitize a slug for safe database lookup.
 */
export function sanitizeSlug(slug: string): string {
    return slug
        .toLowerCase()
        .trim()
        .replace(/[^\w-]/g, "")
        .substring(0, 200);
}