"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUsers(page: number, limit = 20) {
    const supabase = await createClient()

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
        .from("members")
        .select("*", { count: "exact" })
        .range(from, to)
        .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    return { users: data, total: count }
}