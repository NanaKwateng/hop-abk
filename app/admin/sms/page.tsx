// app/admin/sms/page.tsx

import { Suspense } from "react";
import { SMSComposer } from "@/components/sms/sms-composer";
import { SMSHistory } from "@/components/sms/sms-history";
import { SMSAnalytics } from "@/components/sms/sms-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, History, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "SMS Messaging",
    description: "Send and manage SMS messages to members",
};

export default function SMSPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SMS Messaging</h1>
                <p className="text-muted-foreground">
                    Send messages to members via SMS
                </p>
            </div>

            <Tabs defaultValue="compose" className="space-y-4">
                <TabsList className="bg-transparent w-1/4 max-w-sm py-2 rounded-full justify-start gap-2">
                    <TabsTrigger value="compose" className="gap-2">
                        <Send className="h-4 w-4" />
                        Compose
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                        <History className="h-4 w-4" />
                        History
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="border-0 outline-none shadow-none">
                    <Suspense fallback={<SMSComposerSkeleton />}>
                        <SMSComposer />
                    </Suspense>
                </TabsContent>

                <TabsContent value="history" className="border-0 outline-none shadow-none">
                    <Suspense fallback={<SMSHistorySkeleton />}>
                        <SMSHistory />
                    </Suspense>
                </TabsContent>

                <TabsContent value="analytics" className="border-0 outline-none shadow-none">
                    <Suspense fallback={<SMSAnalyticsSkeleton />}>
                        <SMSAnalytics />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Skeletons
function SMSComposerSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
}

function SMSHistorySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </CardContent>
        </Card>
    );
}

function SMSAnalyticsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}