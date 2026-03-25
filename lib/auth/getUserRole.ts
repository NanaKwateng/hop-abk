import { createClient } from "@/lib/supabase/client"

export async function getUserRole(userId: string) {
    // Add parentheses here to call the function
    const { data, error } = await createClient()
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()

    if (error) throw error

    return data.role
}
