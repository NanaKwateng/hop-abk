// actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { loginSchema, signUpSchema } from "@/lib/validations/auth";
import { z } from "zod";

// ── Rate Limiting ──

async function checkRateLimit(email: string, supabase: any) {
    const sevenMinutesAgo = new Date(
        Date.now() - 7 * 60 * 1000
    ).toISOString();

    const { count } = await supabase
        .from("otp_rate_limits")
        .select("*", { count: "exact", head: true })
        .eq("email", email)
        .gte("created_at", sevenMinutesAgo);

    if (count && count >= 6) {
        throw new Error("Too many attempts. Please wait 7 minutes.");
    }

    await supabase.from("otp_rate_limits").insert({ email });
}

// ══════════════════════════════════════════════════════════
// LOGIN — Magic Link (unchanged)
// ══════════════════════════════════════════════════════════

export async function loginAction(data: z.infer<typeof loginSchema>) {
    const supabase = await createClient();
    const { email } = data;

    try {
        await checkRateLimit(email, supabase);

        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .single();

        if (!profile) {
            return { error: "Account not found. Please Sign Up." };
        }

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false,
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            },
        });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

// ══════════════════════════════════════════════════════════
// SIGN UP — Email + Password (FIXED)
// ══════════════════════════════════════════════════════════
//
// Uses supabase.auth.signUp() which:
//   1. Creates the user in auth.users (with hashed password)
//   2. Sends a confirmation email with a link
//   3. When user clicks → callback → profile check → redirect
//
// We ALSO pre-create the profiles row using the service client
// so the profile exists immediately with first_name/last_name.
// The callback will find it and read the role for routing.
//
// If the email has a pending admin invite, we set role = 'admin'
// immediately (no waiting for callback to check).
// ══════════════════════════════════════════════════════════

export async function signUpAction(
    data: z.infer<typeof signUpSchema>
) {
    const supabase = await createClient();
    const { email, password, firstName, lastName } = data;

    try {
        await checkRateLimit(email, supabase);

        // ── Check if user already exists ──
        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email.toLowerCase())
            .maybeSingle();

        if (existingProfile) {
            return { error: "User already exists. Please Log In." };
        }

        console.log("[SIGNUP] Creating user:", email);

        // ── Create auth user with password ──
        const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
                    data: {
                        firstName,
                        lastName,
                    },
                },
            });

        if (signUpError) {
            console.error("[SIGNUP] Auth error:", signUpError.message);
            throw signUpError;
        }

        if (!signUpData.user) {
            return { error: "Failed to create account. Please try again." };
        }

        console.log("[SIGNUP] Auth user created:", signUpData.user.id);

        // ── Pre-create profile using service client (bypasses RLS) ──
        // This ensures the profile exists BEFORE the user confirms.
        // The callback will find it and use its role for routing.

        const serviceClient = createServiceClient();

        // Check if there's a pending admin invite for this email
        const { data: adminInvite } = await serviceClient
            .from("admin_invites")
            .select("id, first_name, last_name")
            .eq("email", email.toLowerCase())
            .maybeSingle();

        const role = adminInvite ? "admin" : "member";

        const { error: profileError } = await serviceClient
            .from("profiles")
            .upsert(
                {
                    id: signUpData.user.id,
                    email: email.toLowerCase(),
                    role,
                    first_name: firstName,
                    last_name: lastName,
                },
                { onConflict: "id" }
            );

        if (profileError) {
            console.error(
                "[SIGNUP] Profile creation error:",
                profileError.message
            );
            // Non-fatal — callback will self-heal
        } else {
            console.log("[SIGNUP] Profile created with role:", role);
        }

        // ── Clean up admin invite if used ──
        if (adminInvite) {
            await serviceClient
                .from("admin_invites")
                .delete()
                .eq("id", adminInvite.id);

            console.log("[SIGNUP] Admin invite consumed for:", email);
        }

        return { success: true };
    } catch (error: any) {
        console.error("[SIGNUP] Error:", error.message);
        return { error: error.message };
    }
}

// ── LOGOUT ──

export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
}





