// components/finance/FullyPaidReportClient.tsx
"use client";

import * as React from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { fetchFullyPaidMembers } from "@/actions/finance-dashboard";
import type { FullyPaidMembersData } from "@/lib/types/finance-dashboard";
import { cn } from "@/lib/utils";

export default function FullyPaidReportClient() {
    const [data, setData] = React.useState<FullyPaidMembersData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setIsLoading(true);
                const result = await fetchFullyPaidMembers();
                if (!cancelled) setData(result);
            } catch (err: any) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2 flex-1" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 text-sm text-destructive py-8 justify-center">
                <AlertCircle className="h-4 w-4" />
                {error}
            </div>
        );
    }

    if (!data || data.fullyPaidMembers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
                <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">
                    No members have completed all payments through{" "}
                    {data?.currentMonth ?? "this month"} {data?.currentYear ?? ""} yet.
                </p>
            </div>
        );
    }

    const totalAmount = data.fullyPaidMembers.reduce(
        (sum, m) => sum + m.totalAmount,
        0
    );

    function formatGroup(group: string | null): string {
        if (!group) return "—";
        return group
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return (
        <div className="space-y-4">
            {/* Summary badge */}
            <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                    {data.totalFullyPaid} of {data.totalMembers} members
                </span>
                <span className="text-xs text-muted-foreground">
                    fully paid through {data.currentMonth} {data.currentYear}
                </span>
            </div>

            <Table>
                <TableCaption>
                    {data.monthsElapsed}/12 months elapsed for {data.currentYear}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead className="hidden sm:table-cell">
                            Group
                        </TableHead>
                        <TableHead className="min-w-[200px]">
                            Progress
                        </TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.fullyPaidMembers.map((member) => {
                        const initials =
                            (member.firstName?.[0] ?? "") +
                            (member.lastName?.[0] ?? "");
                        const progressPercent = Math.round(
                            (member.monthsPaid / 12) * 100
                        );
                        const hasAvatar =
                            member.avatarUrl?.startsWith("http") &&
                            member.avatarUrl.length > 0;

                        return (
                            <TableRow key={member.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {member.membershipId ?? "—"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            {hasAvatar ? (
                                                <AvatarImage
                                                    src={member.avatarUrl!}
                                                    alt={`${member.firstName} ${member.lastName}`}
                                                />
                                            ) : null}
                                            <AvatarFallback className="text-xs font-medium">
                                                {initials.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium truncate">
                                            {member.firstName}{" "}
                                            {member.lastName}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge
                                        variant="outline"
                                        className="text-xs capitalize"
                                    >
                                        {formatGroup(member.memberGroup)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Progress
                                                value={progressPercent}
                                                className={cn(
                                                    "h-2 flex-1",
                                                    progressPercent === 100 &&
                                                    "[&>div]:bg-green-600"
                                                )}
                                            />
                                            <span className="text-xs font-medium tabular-nums text-muted-foreground w-10 text-right">
                                                {progressPercent}%
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            {member.monthsPaid}/12 payments
                                            made for {data.currentYear} till{" "}
                                            {data.currentMonth}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-sm font-medium">
                                    GH₵{" "}
                                    {member.totalAmount.toLocaleString(
                                        "en-GH",
                                        { minimumFractionDigits: 2 }
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>
                            Total ({data.totalFullyPaid} members)
                        </TableCell>
                        <TableCell className="hidden sm:table-cell" />
                        <TableCell className="text-right font-semibold">
                            GH₵{" "}
                            {totalAmount.toLocaleString("en-GH", {
                                minimumFractionDigits: 2,
                            })}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}