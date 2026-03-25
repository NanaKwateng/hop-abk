// components/finance/Avatar.tsx
"use client";

import * as React from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { fetchFullyPaidMembers } from "@/actions/finance-dashboard";
import type { FullyPaidMembersData, FullyPaidMember } from "@/lib/types/finance-dashboard";
import { cn } from "@/lib/utils";

// ── Avatar group shown in the tab trigger ──

export function AvatarGroupCountExample() {
    const [data, setData] = React.useState<FullyPaidMembersData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setIsLoading(true);
                const result = await fetchFullyPaidMembers();
                if (!cancelled) setData(result);
            } catch {
                // Silently fail in tab trigger — data will show "0"
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
            <div className="flex items-center gap-1">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-6" />
            </div>
        );
    }

    if (!data || data.fullyPaidMembers.length === 0) {
        return (
            <span className="text-xs text-muted-foreground">
                0 fully paid
            </span>
        );
    }

    // Show first 3 avatars, +N for the rest
    const displayMembers = data.fullyPaidMembers.slice(0, 3);
    const remaining = data.totalFullyPaid - displayMembers.length;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    className="flex items-center gap-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                    aria-label={`${data.totalFullyPaid} fully paid members — click to view`}
                >
                    <AvatarGroup>
                        {displayMembers.map((member) => (
                            <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                                {member.avatarUrl?.startsWith("http") ? (
                                    <AvatarImage
                                        src={member.avatarUrl}
                                        alt={`${member.firstName} ${member.lastName}`}
                                    />
                                ) : null}
                                <AvatarFallback className="text-[10px] font-medium">
                                    {(member.firstName?.[0] ?? "") +
                                        (member.lastName?.[0] ?? "")}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {remaining > 0 && (
                            <AvatarGroupCount>
                                +{remaining}
                            </AvatarGroupCount>
                        )}
                    </AvatarGroup>
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Fully Paid Members
                    </DialogTitle>
                    <DialogDescription>
                        {data.totalFullyPaid} of {data.totalMembers} members
                        have paid all {data.monthsElapsed} months
                        (Jan–{data.currentMonth} {data.currentYear})
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-auto flex-1 -mx-6 px-6">
                    <FullyPaidTable data={data} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Table showing all fully-paid members with progress bars ──

function FullyPaidTable({ data }: { data: FullyPaidMembersData }) {
    const totalAmount = data.fullyPaidMembers.reduce(
        (sum, m) => sum + m.totalAmount,
        0
    );

    return (
        <Table>
            <TableCaption>
                Members with 100% payment compliance through{" "}
                {data.currentMonth} {data.currentYear}
            </TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="hidden sm:table-cell">Group</TableHead>
                    <TableHead className="min-w-[200px]">Progress</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.fullyPaidMembers.map((member) => (
                    <FullyPaidRow
                        key={member.id}
                        member={member}
                        currentYear={data.currentYear}
                        currentMonth={data.currentMonth}
                    />
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3}>
                        Total ({data.totalFullyPaid} members)
                    </TableCell>
                    <TableCell className="hidden sm:table-cell" />
                    <TableCell className="text-right font-semibold">
                        GH₵ {totalAmount.toLocaleString("en-GH", {
                            minimumFractionDigits: 2,
                        })}
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    );
}

// ── Individual row with avatar, progress bar, and description ──

function FullyPaidRow({
    member,
    currentYear,
    currentMonth,
}: {
    member: FullyPaidMember;
    currentYear: number;
    currentMonth: string;
}) {
    const initials =
        (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

    const progressPercent = Math.round(
        (member.monthsPaid / 12) * 100
    );

    const hasValidAvatar =
        member.avatarUrl?.startsWith("http") && member.avatarUrl.length > 0;

    function formatGroup(group: string | null): string {
        if (!group) return "—";
        return group
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return (
        <TableRow>
            {/* Membership ID */}
            <TableCell className="font-mono text-xs text-muted-foreground">
                {member.membershipId ?? "—"}
            </TableCell>

            {/* Member with avatar */}
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        {hasValidAvatar ? (
                            <AvatarImage
                                src={member.avatarUrl!}
                                alt={`${member.firstName} ${member.lastName}`}
                            />
                        ) : null}
                        <AvatarFallback className="text-xs font-medium">
                            {initials.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                            {member.firstName} {member.lastName}
                        </p>
                    </div>
                </div>
            </TableCell>

            {/* Group */}
            <TableCell className="hidden sm:table-cell">
                <Badge variant="outline" className="text-xs capitalize">
                    {formatGroup(member.memberGroup)}
                </Badge>
            </TableCell>

            {/* Progress bar + description */}
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
                        {member.monthsPaid}/12 payments made for{" "}
                        {currentYear} till {currentMonth}
                    </p>
                </div>
            </TableCell>

            {/* Amount */}
            <TableCell className="text-right tabular-nums text-sm font-medium">
                GH₵ {member.totalAmount.toLocaleString("en-GH", {
                    minimumFractionDigits: 2,
                })}
            </TableCell>
        </TableRow>
    );
}