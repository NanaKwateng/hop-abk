"use client"

import type { Member, MemberPayment, MemberTestimonial } from "@/lib/types/index"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { PaymentsTab } from "@/components/dashboard/users/payments-tab"
import { AnalyticsTab } from "@/components/dashboard/users/analytics-tab"
import { TestimonialsTab } from "@/components/dashboard/users/testimonials-tab"

interface MemberTabsProps {
    member: Member
    payments: MemberPayment[]
    testimonials: MemberTestimonial[]
}

export function MemberTabs({
    member,
    payments,
    testimonials,
}: MemberTabsProps) {
    return (
        <Tabs defaultValue="payments" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-fit">
                <TabsTrigger value="payments">Charges / Payments</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
            </TabsList>

            <TabsContent value="payments">
                <Card>
                    <CardHeader>
                        <CardTitle>Charges & Monthly Payments</CardTitle>
                        <CardDescription>
                            Track this member&apos;s monthly payment status from January to December.
                            A member cannot be checked for more than three months at a time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PaymentsTab memberId={member.id} payments={payments} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="analytics">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Analytics</CardTitle>
                        <CardDescription>
                            Review monthly and yearly payment trends, history, and insights for this member.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnalyticsTab member={member} payments={payments} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="info">
                <Card>
                    <CardHeader>
                        <CardTitle>Member Information & Testimonials</CardTitle>
                        <CardDescription>
                            Record testimonies, duties, special remarks, and other important notes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TestimonialsTab memberId={member.id} testimonials={testimonials} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}