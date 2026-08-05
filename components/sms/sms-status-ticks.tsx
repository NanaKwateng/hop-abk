"use client";

import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusTicksProps {
    status: string;
    deliveredCount?: number;
    totalRecipients?: number;
    className?: string;
}

export function getWhatsAppStatus(status: string, deliveredCount = 0, totalRecipients = 0) {
    if (status === "scheduled") return "scheduled" as const;
    if (status === "failed") return "failed" as const;
    if (status === "pending" || status === "sending") return "sending" as const;
    if (totalRecipients > 0 && deliveredCount >= totalRecipients) return "read" as const;
    if (deliveredCount > 0) return "delivered" as const;
    return "sent" as const;
}

export function StatusTicks({ status, deliveredCount = 0, totalRecipients = 0, className }: StatusTicksProps) {
    const state = getWhatsAppStatus(status, deliveredCount, totalRecipients);

    switch (state) {
        case "scheduled":
            return <Clock className={cn("h-3.5 w-3.5 text-muted-foreground", className)} />;
        case "failed":
            return <AlertCircle className={cn("h-3.5 w-3.5 text-red-500", className)} />;
        case "sending":
            return <Check className={cn("h-3.5 w-3.5 text-muted-foreground", className)} />;
        case "delivered":
            return <CheckCheck className={cn("h-3.5 w-3.5 text-muted-foreground", className)} />;
        case "read":
            return <CheckCheck className={cn("h-3.5 w-3.5 text-[#53bdeb]", className)} />;
    }
}