// // lib/utils/slug.ts

// /**
//  * Generate a URL-safe slug from a workflow name.
//  * Appends a short unique suffix to prevent collisions.
//  *
//  * "Q3 Tithe Collection" → "q3-tithe-collection-a1b2c3"
//  */
// export function generateSlug(name: string): string {
//     const base = name
//         .toLowerCase()
//         .trim()
//         .replace(/[^\w\s-]/g, "")    // remove special chars
//         .replace(/\s+/g, "-")         // spaces → hyphens
//         .replace(/-+/g, "-")          // collapse multiple hyphens
//         .replace(/^-|-$/g, "");       // trim leading/trailing hyphens

//     // 6-char random suffix for uniqueness
//     const suffix = Math.random().toString(36).substring(2, 8);

//     return `${base}-${suffix}`;
// }

// /**
//  * Sanitize a slug for safe database lookup.
//  */
// export function sanitizeSlug(slug: string): string {
//     return slug
//         .toLowerCase()
//         .trim()
//         .replace(/[^\w-]/g, "")
//         .substring(0, 200);
// }


// lib/utils/slug.ts

/**
 * ✅ PRODUCTION-READY: Generate URL-safe slug with collision prevention
 */
export function generateSlug(name: string): string {
    if (!name || typeof name !== "string") {
        throw new Error("Invalid name for slug generation");
    }

    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")    // Remove special chars
        .replace(/\s+/g, "-")         // Spaces → hyphens
        .replace(/-+/g, "-")          // Collapse multiple hyphens
        .replace(/^-|-$/g, "");       // Trim leading/trailing hyphens

    // ✅ ADD: Fallback if base is empty after sanitization
    const sanitizedBase = base || "workflow";

    // ✅ IMPROVED: Use timestamp + random for better uniqueness
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const random = Math.random().toString(36).substring(2, 6); // 4 random chars
    const suffix = `${timestamp}${random}`;

    return `${sanitizedBase}-${suffix}`.substring(0, 100); // ✅ ADD: Max length limit
}

/**
 * ✅ PRODUCTION-READY: Sanitize slug for safe database lookup
 */
export function sanitizeSlug(slug: string): string {
    if (!slug || typeof slug !== "string") {
        throw new Error("Invalid slug for sanitization");
    }

    return slug
        .toLowerCase()
        .trim()
        .replace(/[^\w-]/g, "")      // Keep only alphanumeric and hyphens
        .replace(/-+/g, "-")          // Collapse multiple hyphens
        .replace(/^-|-$/g, "")        // Trim edges
        .substring(0, 100);           // ✅ Enforce max length
}

/**
 * ✅ NEW: Validate if a string is a valid slug format
 */
export function isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length <= 100;
}