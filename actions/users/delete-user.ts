"use server"

import { createClient } from "@/lib/supabase/server"

export async function deleteUser(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", id)

    if (error) throw new Error(error.message)

    return true
}