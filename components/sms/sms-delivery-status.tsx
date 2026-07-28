// components/sms/sms-delivery-status.tsx

"use client";

import { useSMS } from "@/hooks/use-sms";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SMSDeliveryStatusProps {
    messageId: string;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
    sent: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
    delivered: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    pending: <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
};

const STATUS_LABELS: Record<string, string> = {
    sent: "Sent",
    delivered: "Delivered",
    pending: "Pending",
    failed: "Failed",
};

export function SMSDeliveryStatus({ messageId }: SMSDeliveryStatusProps) {
    const { useDeliveryStatus } = useSMS();
    const { data, isLoading } = useDeliveryStatus(messageId);

    if (isLoading) {
        return <DeliveryStatusSkeleton />;
    }

    if (!data || data.logs.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    No delivery information available
                </CardContent>
            </Card>
        );
    }

    const statusSummary = {
        delivered: data.delivered,
        failed: data.failed,
        pending: data.pending,
        total: data.totalRecipients,
    };

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Summary:</span>
                    <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {statusSummary.delivered} delivered
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        {statusSummary.failed} failed
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                        <Loader2 className="h-3 w-3 text-yellow-500" />
                        {statusSummary.pending} pending
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                        (Total: {statusSummary.total})
                    </span>
                </div>
            </div>

            {/* Logs Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent At</TableHead>
                            {data.logs.some((l) => l.deliveredAt) && (
                                <TableHead>Delivered At</TableHead>
                            )}
                            {data.logs.some((l) => l.errorMessage) && (
                                <TableHead>Error</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>
                                    {log.memberName || "Unknown Member"}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                    {log.phone}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        {STATUS_ICONS[log.status]}
                                        <span className="text-sm">
                                            {STATUS_LABELS[log.status] || log.status}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {log.sentAt
                                        ? new Date(log.sentAt).toLocaleString()
                                        : "—"}
                                </TableCell>
                                {data.logs.some((l) => l.deliveredAt) && (
                                    <TableCell className="text-sm text-muted-foreground">
                                        {log.deliveredAt
                                            ? new Date(log.deliveredAt).toLocaleString()
                                            : "—"}
                                    </TableCell>
                                )}
                                {data.logs.some((l) => l.errorMessage) && (
                                    <TableCell className="text-sm text-red-500">
                                        {log.errorMessage || "—"}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function DeliveryStatusSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-32" />
                ))}
            </div>
            <div className="rounded-md border">
                <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}