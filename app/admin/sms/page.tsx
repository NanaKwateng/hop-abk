import { Suspense } from "react";
import { SMSWorkspace } from "@/components/sms/sms-workspace";
import { SMSAnalytics } from "@/components/sms/sms-analytics";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, BarChart3 } from "lucide-react";

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
                <p className="text-muted-foreground">Send messages to members via SMS</p>
            </div>

            <Tabs defaultValue="messages" className="space-y-4">
                <TabsList className="bg-transparent w-fit rounded-full justify-start gap-2">
                    <TabsTrigger value="messages" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Messages
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="messages" className="border-0 outline-none shadow-none">
                    <Suspense fallback={<WorkspaceSkeleton />}>
                        <SMSWorkspace />
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

function WorkspaceSkeleton() {
    return <Skeleton className="h-[calc(100vh-9rem)] w-full rounded-2xl" />;
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