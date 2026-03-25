import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function adminGuard() {
    // 1. AWAIT the client creation (Required for Next.js 15)
    const supabase = await createClient()

    // 2. Get the user session
    const {
        data: { user }
    } = await supabase.auth.getUser()

    // 3. Redirect if not logged in
    if (!user) {
        redirect("/auth/login")
    }

    // 4. Fetch the role from the profiles table
    const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    // 5. Redirect if the user is not an admin
    if (data?.role !== "admin") {
        redirect("/users")
    }

    // Return the user or profile if you need to use it in the calling component
    return { user, role: data?.role }
}






