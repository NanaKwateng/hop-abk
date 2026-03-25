import { createClient } from "@/lib/supabase/server"

export default async function WelcomeText() {
    // FIX: Added 'await' here because createClient returns a Promise
    const supabase = await createClient()

    // Now 'supabase' is the actual client, and 'auth' will exist on it
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let fullName = "Guest"

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", user.id)
            .single()

        if (profile) {
            fullName = `${profile.first_name} ${profile.last_name}`
        }
    }

    return (
        <main className="max-w-sm space-y-3">
            <h2>
                Welcome aboard 👋 <br />
                <span className=" text-5xl max-w-sm tracking-wide">
                    {fullName}
                </span>
            </h2>

            <p className="text-sm max-w-sm">
                We're excited to have you here. Manage your activities,
                track your contributions, and stay connected with your community.
            </p>
        </main>
    )
}
