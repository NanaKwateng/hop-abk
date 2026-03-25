// src/actions/onboarding.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    console.log("Attempting to complete onboarding for user:", user.id);

    // 1. Get current profile to preserve existing data if we need to upsert
    const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // 2. UPSERT the profile. 
    // This ensures if the row is missing, it creates it. If it exists, it updates it.
    const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .upsert({
            id: user.id, // Primary key
            ...(existingProfile || {}), // Keep existing data if any
            onboarding_completed: true, // Force to true
            role: existingProfile?.role || 'member' // Default to member if new
        })
        .select("role, onboarding_completed") // Return what was actually saved
        .single();

    if (error) {
        console.error("SUPABASE DB ERROR:", error.message);
        throw new Error(`Database error: ${error.message}`);
    }

    // 3. Verify it actually saved as true
    if (!updatedProfile?.onboarding_completed) {
        console.error("CRITICAL: Supabase refused to save onboarding_completed as true. Check RLS policies.");
        throw new Error("Failed to save onboarding status.");
    }

    console.log("Successfully saved onboarding status!", updatedProfile);

    // 4. Return the path based on the confirmed database role
    return updatedProfile.role === "admin" ? "/admin" : "/users";
}