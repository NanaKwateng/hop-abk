// components/finance/paid-members-view.tsx
"use client";

import * as React from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { Search, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
    MemberPaymentProgress,
    MembersProgressData,
} from "@/lib/types/finance-analytics";

// ═══════════════════════════════════════════════════════════
// AVATAR GROUP — Shown in the TabsTrigger
// ═══════════════════════════════════════════════════════════
// Shows first 3 fully-paid members' avatars + remaining count.
// If no one is fully paid, shows a fallback icon.
// ═══════════════════════════════════════════════════════════

const MAX_AVATARS = 3;

export function PaidMembersAvatar({
    members,
}: {
    members: MemberPaymentProgress[];
}) {
    if (members.length === 0) {
        return (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Members</span>
            </span>
        );
    }

    const shown = members.slice(0, MAX_AVATARS);
    const remaining = members.length - shown.length;

    return (
        <AvatarGroup>
            {shown.map((m) => {
                const initials =
                    (m.firstName?.[0] ?? "") + (m.lastName?.[0] ?? "");
                const hasAvatar =
                    m.avatarUrl?.startsWith("http") &&
                    m.avatarUrl.length > 0;

                return (
                    <Avatar key={m.id} className="h-6 w-6 border-2 border-background">
                        {hasAvatar ? (
                            <AvatarImage
                                src={m.avatarUrl!}
                                alt={`${m.firstName} ${m.lastName}`}
                            />
                        ) : null}
                        <AvatarFallback className="text-[9px] font-medium">
                            {initials.toUpperCase() || "?"}
                        </AvatarFallback>
                    </Avatar>
                );
            })}
            {remaining > 0 && (
                <AvatarGroupCount>+{remaining}</AvatarGroupCount>
            )}
        </AvatarGroup>
    );
}

// ═══════════════════════════════════════════════════════════
// PROGRESS TABLE — Full member list with progress bars
// ═══════════════════════════════════════════════════════════
// Shows every member's payment progress for the current year.
// Includes search, filter toggles, progress bars, and badges.
//
// Sorted: fully-paid first, then by paid months descending.
// ═══════════════════════════════════════════════════════════

type FilterMode = "all" | "paid" | "behind";

export function MembersProgressTable({
    data,
}: {
    data: MembersProgressData;
}) {
    const {
        allMembers,
        totalCount,
        fullyPaidCount,
        currentYear,
        currentMonthName,
        currentMonthNumber,
    } = data;

    const [search, setSearch] = React.useState("");
    const [filter, setFilter] = React.useState<FilterMode>("all");

    // ── Filtered + searched members ──
    const displayMembers = React.useMemo(() => {
        let list = allMembers;

        // Filter
        if (filter === "paid") {
            list = list.filter((m) => m.isFullyPaid);
        } else if (filter === "behind") {
            list = list.filter((m) => !m.isFullyPaid);
        }

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (m) =>
                    m.firstName.toLowerCase().includes(q) ||
                    m.lastName.toLowerCase().includes(q) ||
                    m.membershipId?.toLowerCase().includes(q) ||
                    m.memberGroup?.toLowerCase().includes(q)
            );
        }

        return list;
    }, [allMembers, filter, search]);

    const behindCount = totalCount - fullyPaidCount;

    // ── Total amount in current filtered view ──
    const totalFilteredAmount = displayMembers.reduce(
        (sum, m) => sum + m.totalAmount,
        0
    );

    return (
        <div className="space-y-4">
            {/* ── Toolbar: search + filters ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, ID, or group..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <FilterButton
                        active={filter === "all"}
                        onClick={() => setFilter("all")}
                        label={`All (${totalCount})`}
                    />
                    <FilterButton
                        active={filter === "paid"}
                        onClick={() => setFilter("paid")}
                        label={`Paid (${fullyPaidCount})`}
                        className="text-green-600"
                    />
                    <FilterButton
                        active={filter === "behind"}
                        onClick={() => setFilter("behind")}
                        label={`Behind (${behindCount})`}
                        className="text-orange-600"
                    />
                </div>
            </div>

            {/* ── Table ── */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableCaption className="pb-4">
                        {displayMembers.length === 0
                            ? "No members match your search."
                            : `Showing ${displayMembers.length} of ${totalCount} members • ${currentYear} progress through ${currentMonthName}`}
                    </TableCaption>

                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[200px]">
                                Member
                            </TableHead>
                            <TableHead className="hidden md:table-cell w-[120px]">
                                Member ID
                            </TableHead>
                            <TableHead className="hidden lg:table-cell w-[130px]">
                                Group
                            </TableHead>
                            <TableHead className="min-w-[240px]">
                                Progress
                            </TableHead>
                            <TableHead className="hidden sm:table-cell w-[100px] text-right">
                                Amount
                            </TableHead>
                            <TableHead className="w-[100px] text-center">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {displayMembers.map((member) => (
                            <MemberRow
                                key={member.id}
                                member={member}
                                currentYear={currentYear}
                                currentMonthName={currentMonthName}
                            />
                        ))}
                    </TableBody>

                    {displayMembers.length > 0 && (
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4}>
                                    Total ({displayMembers.length} member
                                    {displayMembers.length !== 1 ? "s" : ""})
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-right font-semibold">
                                    GH₵{" "}
                                    {totalFilteredAmount.toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function MemberRow({
    member,
    currentYear,
    currentMonthName,
}: {
    member: MemberPaymentProgress;
    currentYear: number;
    currentMonthName: string;
}) {
    const initials =
        (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");
    const hasAvatar =
        member.avatarUrl?.startsWith("http") && member.avatarUrl.length > 0;

    const percentage = Math.round((member.paidMonths / 12) * 100);

    return (
        <TableRow>
            {/* ── Member (avatar + name) ── */}
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
                            {initials.toUpperCase() || "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                            {member.firstName} {member.lastName}
                        </p>
                        {/* Show membership ID on mobile where column is hidden */}
                        {member.membershipId && (
                            <p className="text-xs text-muted-foreground md:hidden font-mono">
                                {member.membershipId}
                            </p>
                        )}
                    </div>
                </div>
            </TableCell>

            {/* ── Member ID ── */}
            <TableCell className="hidden md:table-cell">
                <span className="font-mono text-xs text-muted-foreground">
                    {member.membershipId ?? "—"}
                </span>
            </TableCell>

            {/* ── Group ── */}
            <TableCell className="hidden lg:table-cell">
                <span className="text-xs">
                    {member.memberGroup
                        ? member.memberGroup
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())
                        : "—"}
                </span>
            </TableCell>

            {/* ── Progress bar + description ── */}
            <TableCell>
                <div className="space-y-1.5">
                    <Progress
                        value={percentage}
                        className={cn(
                            "h-2",
                            percentage === 100
                                ? "[&>div]:bg-green-500"
                                : percentage >= 75
                                    ? "[&>div]:bg-blue-500"
                                    : percentage >= 50
                                        ? "[&>div]:bg-yellow-500"
                                        : percentage >= 25
                                            ? "[&>div]:bg-orange-500"
                                            : "[&>div]:bg-red-500"
                        )}
                    />
                    <p className="text-[11px] text-muted-foreground leading-none">
                        {member.paidMonths}/12 payments made for{" "}
                        {currentYear} till {currentMonthName}
                    </p>
                </div>
            </TableCell>

            {/* ── Amount ── */}
            <TableCell className="hidden sm:table-cell text-right">
                <span className="text-sm font-medium tabular-nums">
                    {member.totalAmount > 0
                        ? `GH₵ ${member.totalAmount.toFixed(2)}`
                        : "—"}
                </span>
            </TableCell>

            {/* ── Status badge ── */}
            <TableCell className="text-center">
                {member.isFullyPaid ? (
                    <Badge
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white gap-1"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Paid</span>
                    </Badge>
                ) : member.paidMonths > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">
                            {member.paidMonths}/{member.currentMonthNumber}
                        </span>
                    </Badge>
                ) : (
                    <Badge
                        variant="destructive"
                        className="gap-1"
                    >
                        <AlertCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">None</span>
                    </Badge>
                )}
            </TableCell>
        </TableRow>
    );
}

function FilterButton({
    active,
    onClick,
    label,
    className,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    className?: string;
}) {
    return (
        <Button
            variant={active ? "default" : "outline"}
            size="sm"
            className={cn("h-8 text-xs", !active && className)}
            onClick={onClick}
        >
            {label}
        </Button>
    );
}