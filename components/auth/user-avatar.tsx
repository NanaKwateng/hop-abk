"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function UserAvatar({ className }: { className?: string }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("first_name, last_name, avatar_url")
                    .eq("id", user.id)
                    .single()
                setProfile({ ...data, email: user.email })
            }
            setLoading(false)
        }
        fetchProfile()
    }, [supabase])

    if (loading) {
        return <Skeleton className={cn("h-9 w-9 rounded-full", className)} />
    }

    const initials = (
        (profile?.first_name?.charAt(0) || "") + (profile?.last_name?.charAt(0) || "")
    ).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || "?"

    return (
        <Avatar className={cn("h-9 w-9 border shadow-sm", className)}>
            <AvatarImage src={profile?.avatar_url} alt="User Profile" />
            <AvatarFallback className="bg-muted font-medium text-xs">
                {initials}
            </AvatarFallback>
        </Avatar>
    )
}
