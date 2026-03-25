"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ShieldAlert } from "lucide-react"

export function ImpersonationBanner() {
    // In a real app, you'd check a cookie or state to show/hide this
    async function stopImpersonation() {
        const res = await fetch("/api/admin/stop-impersonate", {
            method: "POST",
        })

        const data = await res.json()

        if (data.error) {
            toast.error(data.error)
            return
        }

        toast.success("Returned to Admin session")
        window.location.href = data.redirect
    }

    return (
        <div className="bg-red-600 text-white py-2 px-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldAlert size={16} />
                Viewing app as User: <span className="font-bold underline">ID-HERE</span>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={stopImpersonation}
                className="bg-white text-red-600 hover:bg-gray-100 border-none h-7"
            >
                Stop Impersonation
            </Button>
        </div>
    )
}






