// lib/supabase/service.ts
//
// This client uses the SERVICE_ROLE_KEY which bypasses Row Level Security.
// Use ONLY in server actions/components for PUBLIC operations where
// the user is NOT an authenticated admin (e.g., member self-verification).
//
// ⚠️ NEVER import this in client components or expose the key.

import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
        );
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}