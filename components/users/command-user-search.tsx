"use client"

import {
    CommandDialog,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

import { useUsersStore } from "@/stores/users-store"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function CommandUserSearch() {

    const [open, setOpen] = useState(false)
    const users = useUsersStore((s) => s.users)

    const router = useRouter()

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>

            <CommandInput placeholder="Search users..." />

            <CommandList>

                {users.map((user) => (

                    <CommandItem
                        key={user.id}
                        onSelect={() => {
                            router.push(`/dashboard/users/${user.id}`)
                            setOpen(false)
                        }}
                    >
                        {user.first_name} {user.last_name}
                    </CommandItem>

                ))}

            </CommandList>

        </CommandDialog>
    )
}