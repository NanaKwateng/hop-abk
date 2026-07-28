// components/sms/sms-history.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSMS } from "@/hooks/use-sms";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Eye, Users, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
    sent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    sending: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    sent: <CheckCircle2 className="h-3 w-3" />,
    delivered: <CheckCircle2 className="h-3 w-3" />,
    pending: <Loader2 className="h-3 w-3 animate-spin" />,
    scheduled: <Clock className="h-3 w-3" />,
    sending: <Loader2 className="h-3 w-3 animate-spin" />,
    failed: <XCircle className="h-3 w-3" />,
    cancelled: <XCircle className="h-3 w-3" />,
};

export function SMSHistory() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    const { useMessageHistory } = useSMS();
    const { data, isLoading, isFetching } = useMessageHistory(page, pageSize, statusFilter, searchQuery);

    const messages = data?.messages || [];
    const totalPages = data?.totalPages || 1;
    const totalCount = data?.totalCount || 0;

    const handleViewMessage = (id: string) => {
        router.push(`/admin/sms/${id}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    const getRecipientLabel = (message: any) => {
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
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Message History
                            <Badge variant="secondary" className="text-xs">
                                {totalCount} total
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            View all sent and scheduled SMS messages
                        </CardDescription>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by subject or message..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </form>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Status</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent>
                {isLoading && !data ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No messages found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            {searchQuery || statusFilter
                                ? "Try adjusting your filters or search query"
                                : "Send your first SMS message to get started"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject / Message</TableHead>
                                        <TableHead>Recipients</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Sent At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {messages.map((message) => (
                                        <TableRow key={message.id} className="group">
                                            <TableCell className="max-w-[300px]">
                                                <div className="space-y-0.5">
                                                    {message.subject && (
                                                        <p className="font-medium truncate">
                                                            {message.subject}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {message.message}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {getRecipientLabel(message)}
                                                    </span>
                                                    {message.totalRecipients > 0 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {message.totalRecipients}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "gap-1 text-xs",
                                                        STATUS_COLORS[message.status] || "bg-muted"
                                                    )}
                                                >
                                                    {STATUS_ICONS[message.status]}
                                                    {message.status}
                                                </Badge>
                                                {message.deliveredCount > 0 && (
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        ({message.deliveredCount}/{message.totalRecipients})
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {message.sentAt ? (
                                                        format(new Date(message.sentAt), "MMM d, h:mm a")
                                                    ) : message.scheduledFor ? (
                                                        <span className="text-muted-foreground">
                                                            Scheduled: {format(new Date(message.scheduledFor), "MMM d, h:mm a")}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewMessage(message.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination className="mt-4">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5) {
                                            if (page > 3) {
                                                pageNum = page - 2 + i;
                                            }
                                            if (pageNum > totalPages) return null;
                                        }
                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    onClick={() => setPage(pageNum)}
                                                    isActive={page === pageNum}
                                                    className="cursor-pointer"
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}
                                    {totalPages > 5 && page < totalPages - 2 && (
                                        <PaginationItem>
                                            <span className="px-2">...</span>
                                        </PaginationItem>
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}