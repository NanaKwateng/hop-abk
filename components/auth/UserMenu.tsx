"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "./user-avatar"
import Link from "next/link"

export function UserDropdown() {
    const router = useRouter()
    const supabase = createClient()
    const [loggingOut, setLoggingOut] = useState(false)

    const handleLogout = async () => {
        if (loggingOut) return
        setLoggingOut(true)

        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error

            // Replace so user can’t hit "Back" to protected pages
            router.replace("/auth/login")
            // Refresh to update any server components / layouts using session
            router.refresh()
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to log out")
        } finally {
            setLoggingOut(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost" // Changed to ghost for a cleaner "profile icon" look
                    className="rounded-full"
                    size={"icon-lg"}
                >
                    <UserAvatar />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-40" align="start">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <Link href={"/admin/settings"}>

                        </Link>
                        Profile
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Link href={"/admin/customize"}>

                            Settings
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />



                <DropdownMenuSeparator />



                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={(e) => {
                            // Prevent dropdown default behavior interfering with async handler
                            e.preventDefault()
                            handleLogout()
                        }}
                        disabled={loggingOut}
                    >
                        {loggingOut ? "Logging out..." : "Log out"}
                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}