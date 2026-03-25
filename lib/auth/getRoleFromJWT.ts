import { createClient } from "@/lib/supabase/client"

export async function getRoleFromJWT() {

    const {
        data: { session }
    } = await createClient().auth.getSession() // Added () here

    if (!session) return null

    return session.user.app_metadata?.role
}
