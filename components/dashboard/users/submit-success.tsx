// src/components/users/submit-success.tsx

"use client"

import { CheckCircle2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SubmitSuccessProps {
    memberName: string
    membershipId: string
    onReset: () => void
}

export function SubmitSuccess({
    memberName,
    membershipId,
    onReset,
}: SubmitSuccessProps) {
    return (
        <Card className="mx-auto max-w-md text-center">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Registration Successful!</CardTitle>
                <CardDescription>
                    <strong>{memberName}</strong> has been successfully registered.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="mb-1 text-xs text-muted-foreground">Membership ID</p>
                    <Badge
                        variant="outline"
                        className="font-mono text-lg tracking-wider"
                    >
                        {membershipId}
                    </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                    The member&apos;s details have been saved to the database.
                    You can view or edit them from the members directory.
                </p>

                <Button onClick={onReset} className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Another Member
                </Button>
            </CardContent>
        </Card>
    )
}