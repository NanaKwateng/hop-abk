import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { targetUserId } = await req.json()

        // FIX: Add 'await' before createClient()
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Now .from is accessible because supabase is resolved
        const { error: insertError } = await supabase.from("impersonation_logs").insert({
            admin_id: user.id,
            target_user_id: targetUserId,
        })

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json({
            redirect: `/users/${targetUserId}`,
        })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}




