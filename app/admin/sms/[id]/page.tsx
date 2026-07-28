// app/admin/sms/[id]/page.tsx

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SMSDeliveryStatus } from "@/components/sms/sms-delivery-status";
import {
    ArrowLeft,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Calendar,
    Mail,
    User,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SMSDetailPageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: SMSDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data } = await supabase
        .from("sms_messages")
        .select("subject, message")
        .eq("id", id)
        .single();

    return {
        title: data?.subject || "SMS Message Details",
        description: data?.message?.slice(0, 160) || "View SMS message details",
    };
}

export default async function SMSDetailPage({ params }: SMSDetailPageProps) {
    const { id } = await params;

    const supabase = await createClient();

    // Get message details
    const { data: message, error } = await supabase
        .from("sms_messages")
        .select(`
            *,
            sender:created_by (first_name, last_name)
        `)
        .eq("id", id)
        .single();

    if (error || !message) {
        notFound();
    }

    const STATUS_COLORS: Record<string, string> = {
        sent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        sending: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };

    const getRecipientLabel = () => {
        if (message.recipient_type === "all") return "All Members";
        if (message.recipient_type === "group") {
            const groupMap: Record<string, string> = {
                mens_fellowship: "Men's Fellowship",
                womens_fellowship: "Women's Fellowship",
                youth_fellowship: "Youth Fellowship",
            };
            return groupMap[message.recipient_group] || message.recipient_group;
        }
        if (message.recipient_type === "individual") {
            return `${message.recipient_ids?.length || 0} Members`;
        }
        return message.recipient_type;
    };

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/sms">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Messages
                </Link>
            </Button>

            {/* Message Details */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {message.subject || "No Subject"}
                                <Badge className={cn(STATUS_COLORS[message.status] || "bg-muted")}>
                                    {message.status}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <User className="h-3 w-3" />
                                {message.sender?.first_name || "Unknown"} {message.sender?.last_name || ""}
                                <span className="text-muted-foreground/50">•</span>
                                <Clock className="h-3 w-3" />
                                {format(new Date(message.created_at), "MMM d, yyyy h:mm a")}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                                <Users className="h-3 w-3" />
                                {getRecipientLabel()}
                            </Badge>
                            {message.total_recipients > 0 && (
                                <Badge variant="secondary" className="gap-1">
                                    {message.total_recipients} recipients
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Message Content */}
                    <div className="rounded-lg bg-muted/30 p-4">
                        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                        <div className="text-center p-4 rounded-lg border">
                            <p className="text-2xl font-bold">{message.total_recipients || 0}</p>
                            <p className="text-xs text-muted-foreground">Total Recipients</p>
                        </div>
                        <div className="text-center p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-2xl font-bold text-green-600">{message.delivered_count || 0}</p>
                            <p className="text-xs text-muted-foreground">Delivered</p>
                        </div>
                        <div className="text-center p-4 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-2xl font-bold text-red-600">{message.failed_count || 0}</p>
                            <p className="text-xs text-muted-foreground">Failed</p>
                        </div>
                        <div className="text-center p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-2xl font-bold text-yellow-600">
                                {message.scheduled_for ? "Scheduled" : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {message.scheduled_for
                                    ? format(new Date(message.scheduled_for), "MMM d, h:mm a")
                                    : "Sent immediately"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Delivery Status */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Delivery Status</h3>
                        <Suspense fallback={<DeliveryStatusSkeleton />}>
                            <SMSDeliveryStatus messageId={id} />
                        </Suspense>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function DeliveryStatusSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
    );
}