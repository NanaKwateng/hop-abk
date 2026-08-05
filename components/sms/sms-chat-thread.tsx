"use client";

import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getDeliveryStatus } from "@/actions/sms/get-delivery-status";
import { getMessageHistory } from "@/actions/sms/get-message-history";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Users2, User, Filter } from "lucide-react";
import { StatusTicks } from "./sms-status-ticks";
import { SMSDeliveryStatus } from "./sms-delivery-status";

interface SMSChatThreadProps {
    messageId: string;
    onBack: () => void;
}

function recipientIcon(type: string) {
    if (type === "group") return Users2;
    if (type === "individual") return User;
    if (type === "filtered") return Filter;
    return Users;
}

export function SMSChatThread({ messageId, onBack }: SMSChatThreadProps) {
    // Reuse history query cache — cheap since it's already fetched for the list
    const { data: historyData } = useQuery({
        queryKey: ["sms-history", 1, "all", ""],
        queryFn: () => getMessageHistory(1, 30),
        staleTime: 30000,
    });

    const { data: delivery, isLoading } = useQuery({
        queryKey: ["sms-delivery", messageId],
        queryFn: () => getDeliveryStatus(messageId),
        staleTime: 15000,
    });

    const message = historyData?.messages.find((m: any) => m.id === messageId);
    const Icon = message ? recipientIcon(message.recipientType) : Users;

    const recipientLabel = (() => {
        if (!message) return "";
        if (message.recipientType === "all") return "All Members";
        if (message.recipientType === "group") {
            const map: Record<string, string> = {
                mens_fellowship: "Men's Fellowship",
                womens_fellowship: "Women's Fellowship",
                youth_fellowship: "Youth Fellowship",
            };
            return map[message.recipientGroup as string] || message.recipientGroup;
        }
        if (message.recipientType === "individual") return `${message.recipientIds?.length || 0} Members`;
        return "Filtered";
    })();

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 bg-[#075E54] px-3 py-3 text-white">
                <Button size="icon" variant="ghost" onClick={onBack} className="text-white hover:bg-white/10 hover:text-white md:hidden">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{recipientLabel || "Message"}</p>
                    {message && (
                        <p className="text-xs text-white/70">{message.totalRecipients} recipients</p>
                    )}
                </div>
            </div>

            {/* Bubble area — WhatsApp wallpaper background */}
            <div className="flex-1 overflow-y-auto bg-[#ECE5DD] dark:bg-[#0b141a] p-4">
                {!message ? (
                    <div className="space-y-3">
                        <Skeleton className="h-20 w-2/3 ml-auto rounded-2xl" />
                    </div>
                ) : (
                    <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] dark:bg-[#005c4b] px-3 py-2 shadow-sm">
                            {message.subject && (
                                <p className="text-sm font-semibold mb-1">{message.subject}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[11px] text-muted-foreground">
                                    {message.sentAt
                                        ? format(new Date(message.sentAt), "h:mm a")
                                        : message.scheduledFor
                                            ? `Scheduled ${format(new Date(message.scheduledFor), "MMM d, h:mm a")}`
                                            : ""}
                                </span>
                                <StatusTicks
                                    status={message.status}
                                    deliveredCount={message.deliveredCount}
                                    totalRecipients={message.totalRecipients}
                                    className="h-3.5 w-3.5"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delivery breakdown */}
            <div className="border-t p-4 bg-background overflow-y-auto max-h-[35%]">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Delivery Details
                </h3>
                <SMSDeliveryStatus messageId={messageId} />
            </div>
        </div>
    );
}