"use client"

import { useMemo } from "react"
import type { Member, MemberPayment } from "@/lib/types"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

interface AnalyticsTabProps {
    member: Member
    payments: MemberPayment[]
}

export function AnalyticsTab({ member, payments }: AnalyticsTabProps) {
    const currentYear = new Date().getFullYear()

    const monthlyData = useMemo(() => {
        return MONTHS.map((label, index) => {
            const month = index + 1
            const paid = payments.some(
                (p) =>
                    p.paymentYear === currentYear &&
                    p.paymentMonth === month &&
                    p.status === "paid"
            )

            return {
                month: label,
                paid: paid ? 1 : 0,
            }
        })
    }, [payments, currentYear])

    const yearlyData = useMemo(() => {
        const grouped = new Map<number, number>()

        for (const payment of payments) {
            if (payment.status !== "paid") continue
            grouped.set(payment.paymentYear, (grouped.get(payment.paymentYear) || 0) + 1)
        }

        return Array.from(grouped.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([year, total]) => ({
                year: String(year),
                total,
            }))
    }, [payments])

    const paidCount = monthlyData.filter((m) => m.paid === 1).length
    const unpaidCount = 12 - paidCount

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Current Year Paid</CardTitle>
                        <CardDescription>{currentYear}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">{paidCount}</CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Remaining Unpaid</CardTitle>
                        <CardDescription>{currentYear}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold">{unpaidCount}</CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Member</CardTitle>
                        <CardDescription>Analytics subject</CardDescription>
                    </CardHeader>
                    <CardContent className="text-lg font-semibold">
                        {member.firstName} {member.lastName}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Payment Overview</CardTitle>
                    <CardDescription>
                        Shows whether the member has completed monthly payments for the current year.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis allowDecimals={false} domain={[0, 1]} />
                            <Tooltip />
                            <Bar dataKey="paid" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Yearly Payment History</CardTitle>
                    <CardDescription>
                        Total paid months recorded across previous years for this member.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={yearlyData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="year" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Insights</CardTitle>
                    <CardDescription>
                        Auto-generated summary based on recorded member payments.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        This member has completed <strong>{paidCount}</strong> out of 12 months for {currentYear}.
                    </p>
                    <p>
                        The remaining unpaid months for the year are <strong>{unpaidCount}</strong>.
                    </p>
                    <p>
                        Historical yearly trends help identify the consistency of contributions over time.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}