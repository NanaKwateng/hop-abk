// src/lib/utils/generate-member-id.ts

export function generateMembershipId(
    prefix = "HOP",
    branch = "ABK"
): string {
    const num = Math.floor(Math.random() * 999) + 1
    const padded = num.toString().padStart(3, "0")
    return `${prefix}-${branch}-${padded}`
}