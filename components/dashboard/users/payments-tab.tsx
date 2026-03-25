"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MemberPayment } from "@/lib/types"

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

interface PaymentsTabProps {
    memberId: string
    payments: MemberPayment[]
}

export function PaymentsTab({ memberId, payments }: PaymentsTabProps) {
    const currentYear = new Date().getFullYear()
    const [selectedMonths, setSelectedMonths] = useState<number[]>([])
    const [isPending, startTransition] = useTransition()

    const paidMonths = useMemo(() => {
        return new Set(
            payments
                .filter((p) => p.paymentYear === currentYear && p.status === "paid")
                .map((p) => p.paymentMonth)
        )
    }, [payments, currentYear])

    function handleSelect(month: number) {
        const isAlreadyPaid = paidMonths.has(month)

        if (isAlreadyPaid) {
            startTransition(async () => {
                try {
                    //await toggleMemberPayment(memberId, currentYear, month, false)
                    toast.success(`${MONTHS[month - 1]} marked as unpaid`)
                } catch (error: any) {
                    toast.error(error.message || "Failed to update payment")
                }
            })
            return
        }

        setSelectedMonths((prev) => {
            if (prev.includes(month)) {
                return prev.filter((m) => m !== month)
            }

            if (prev.length >= 3) {
                toast.error("You can only select up to 3 unpaid months at a time.")
                return prev
            }

            return [...prev, month]
        })
    }

    function handleSave() {
        if (selectedMonths.length === 0) {
            toast.error("Please select at least one month.")
            return
        }

        startTransition(async () => {
            try {
                //await saveMemberPayments(memberId, currentYear, selectedMonths)
                toast.success("Payments saved successfully")
                setSelectedMonths([])
            } catch (error: any) {
                toast.error(error.message || "Failed to save payments")
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {MONTHS.map((monthName, index) => {
                    const month = index + 1
                    const isPaid = paidMonths.has(month)
                    const isSelected = selectedMonths.includes(month)

                    return (
                        <Card
                            key={month}
                            className={cn(
                                "cursor-pointer border p-4 transition-colors",
                                isPaid && "border-green-500 bg-green-50 dark:bg-green-950/20",
                                isSelected && "border-primary bg-primary/5",
                                !isPaid && !isSelected && "hover:border-primary/40"
                            )}
                            onClick={() => handleSelect(month)}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">{monthName}</h3>
                                <Badge variant={isPaid ? "default" : "secondary"}>
                                    {isPaid ? "Paid" : isSelected ? "Selected" : "Unpaid"}
                                </Badge>
                            </div>
                        </Card>
                    )
                })}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">
                    Selected unpaid months: <span className="font-medium text-foreground">{selectedMonths.length}</span> / 3
                </div>

                <Button onClick={handleSave} disabled={selectedMonths.length === 0 || isPending}>
                    Save Payments
                </Button>
            </div>
        </div>
    )
}



