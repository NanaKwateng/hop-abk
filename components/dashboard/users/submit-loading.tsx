// src/components/users/submit-loading.tsx

"use client"

import { Loader2 } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export function SubmitLoading() {
    return (
        <Card className="mx-auto max-w-md text-center">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <CardTitle>Registering Member</CardTitle>
                <CardDescription>
                    Please wait while we process the registration…
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                <Skeleton className="mx-auto h-4 w-3/4" />
                <Skeleton className="mx-auto h-4 w-1/2" />
                <Skeleton className="mx-auto h-4 w-2/3" />
            </CardContent>
        </Card>
    )
}