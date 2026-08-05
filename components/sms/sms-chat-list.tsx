"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, format, isToday } from "date-fns";
import { getMessageHistory } from "@/actions/sms/get-message-history";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, Users2, User, Filter, MessageSquarePlus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StatusTicks, getWhatsAppStatus } from "./sms-status-ticks";

const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "sent", label: "Sent" },
    { value: "delivered", label: "Delivered" },
    { value: "scheduled", label: "Scheduled" },
    { value: "failed", label: "Failed" },
];

function recipientIcon(type: string) {
    if (type === "group") return Users2;
    if (type === "individual") return User;
    if (type === "filtered") return Filter;
    return Users;
}

function recipientLabel(message: any) {
    if (message.recipientType === "all") return "All Members";
    if (message.recipientType === "group") {
        const map: Record<string, string> = {
            mens_fellowship: "Men's Fellowship",
            womens_fellowship: "Women's Fellowship",
            youth_fellowship: "Youth Fellowship",
        };
        return map[message.recipientGroup] || message.recipientGroup || "Group";
    }
    if (message.recipientType === "individual") {
        return `${message.recipientIds?.length || 0} Members`;
    }
    return "Filtered";
}

function formatListTime(dateStr: string) {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "h:mm a");
    return format(date, "MMM d");
}

interface SMSChatListProps {
    selectedId?: string | null;
    onSelect: (id: string) => void;
    onCompose: () => void;
}

export function SMSChatList({ selectedId, onSelect, onCompose }: SMSChatListProps) {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all"); // fixed: was "" which crashed Radix Select
    const [searchQuery, setSearchQuery] = useState("");

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["sms-history", page, statusFilter, searchQuery],
        queryFn: () =>
            getMessageHistory(page, 30, statusFilter === "all" ? undefined : statusFilter, searchQuery || undefined),
        staleTime: 30000,
        retry: 1,
    });

    useEffect(() => {
        if (isError && error) {
            toast.error("Failed to load message history", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        }
    }, [isError, error]);

    const messages = data?.messages || [];

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Header — WhatsApp-style dark green bar */}
            <div className="flex items-center justify-between gap-3 bg-[#075E54] px-4 py-3 text-white">
                <h2 className="text-lg font-semibold">Messages</h2>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onCompose}
                    className="text-white hover:bg-white/10 hover:text-white"
                    aria-label="New message"
                >
                    <MessageSquarePlus className="h-5 w-5" />
                </Button>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search messages"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9 h-9 rounded-full bg-muted/50 border-none"
                    />
                </div>
            </div>

            {/* Status pill filters (replaces the crashing Select) */}
            <div className="flex gap-2 overflow-x-auto px-3 py-2 border-b scrollbar-none">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => {
                            setStatusFilter(f.value);
                            setPage(1);
                        }}
                        className={cn(
                            "shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                            statusFilter === f.value
                                ? "bg-[#075E54] text-white border-[#075E54]"
                                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {isError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                        <AlertCircle className="h-6 w-6 text-destructive mb-3" />
                        <p className="text-sm font-medium mb-1">Couldn't load messages</p>
                        <p className="text-xs text-muted-foreground mb-4">
                            {error instanceof Error ? error.message : "Please try again"}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => refetch()}>
                            Try Again
                        </Button>
                    </div>
                ) : isLoading && !data ? (
                    <div className="space-y-0">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                        <div className="rounded-full bg-muted p-4 mb-3">
                            <MessageSquarePlus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tap the compose icon to send your first message
                        </p>
                    </div>
                ) : (
                    messages.map((message: any) => {
                        const Icon = recipientIcon(message.recipientType);
                        const isSelected = selectedId === message.id;
                        return (
                            <button
                                key={message.id}
                                onClick={() => onSelect(message.id)}
                                className={cn(
                                    "flex w-full items-center gap-3 px-4 py-3 text-left border-b border-border/40 transition-colors",
                                    isSelected ? "bg-muted" : "hover:bg-muted/50"
                                )}
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#075E54]/10">
                                    <Icon className="h-5 w-5 text-[#075E54]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-sm truncate">
                                            {recipientLabel(message)}
                                        </span>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {formatListTime(message.sentAt || message.scheduledFor || message.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <StatusTicks
                                            status={message.status}
                                            deliveredCount={message.deliveredCount}
                                            totalRecipients={message.totalRecipients}
                                        />
                                        <span className="text-xs text-muted-foreground truncate">
                                            {message.subject || message.message}
                                        </span>
                                    </div>
                                </div>
                                {message.status === "failed" && (
                                    <Badge className="bg-red-500 text-white text-[10px] px-1.5 shrink-0">!</Badge>
                                )}
                            </button>
                        );
                    })
                )}

                {data && data.totalPages > page && (
                    <div className="p-3 text-center">
                        <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)}>
                            Load more
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}