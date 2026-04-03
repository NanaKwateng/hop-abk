// components/dashboard/workflow/workflow-detail-page.tsx
"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft, CreditCard, FileText, Users, Clock, AlertCircle, Search,
    Loader2, Trash2, Save, CheckCircle2, UserCheck, Shield, Activity,
    BarChart3, Download, UserPlus, Filter,
} from "lucide-react";
import { format, isBefore } from "date-fns";
import { createWorkflowEntry, deleteWorkflowEntry } from "@/actions/workflow";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PaymentEntryDrawer } from "./payment-entry-drawer";
import { RoleEntryDrawer } from "./role-entry-drawer";
import { ManageMembersDrawer } from "./manage-member-drawer";
import type { WorkflowDetail, WorkflowMember, WorkflowEntry } from "@/lib/types/workflow";

interface WorkflowDetailPageProps {
    workflow: WorkflowDetail;
}

const GROUP_FILTER_OPTIONS = [
    { value: "all", label: "All Groups" },
    { value: "youth", label: "Youth" },
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
];

const TYPE_CONFIG = {
    payments: {
        icon: CreditCard, label: "Payments", color: "text-green-600",
        bg: "bg-green-100 dark:bg-green-950/50", actionLabel: "Record Payment", badge: "💳 Payments",
    },
    records: {
        icon: FileText, label: "Records", color: "text-primary",
        bg: "bg-primary/10", actionLabel: "Create Record", badge: "📄 Records",
    },
    roles: {
        icon: Shield, label: "Assign Roles", color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-950/50", actionLabel: "Assign Role", badge: "🛡️ Roles",
    },
    monitor: {
        icon: Activity, label: "Monitor", color: "text-orange-600",
        bg: "bg-orange-100 dark:bg-orange-950/50", actionLabel: "Add Note", badge: "📊 Monitor",
    },
} as const;

function fireConfetti() {
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#fbbf24"],
        gravity: 1.2,
        scalar: 0.9,
        ticks: 120,
    });
}

export function WorkflowDetailPage({ workflow }: WorkflowDetailPageProps) {
    const router = useRouter();
    const [entries, setEntries] = useState<WorkflowEntry[]>(workflow.entries);
    const [members, setMembers] = useState<WorkflowMember[]>(workflow.members);
    const [selectedMember, setSelectedMember] = useState<WorkflowMember | null>(null);
    const [memberSearch, setMemberSearch] = useState("");
    const [memberGroupFilter, setMemberGroupFilter] = useState("all");
    const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Drawer states
    const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
    const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
    const [manageMembersOpen, setManageMembersOpen] = useState(false);
    const [drawerMember, setDrawerMember] = useState<WorkflowMember | null>(null);

    // Form state for records/monitor
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const isExpired = isBefore(new Date(workflow.endDate), new Date());
    const config = TYPE_CONFIG[workflow.type] ?? TYPE_CONFIG.records;
    const TypeIcon = config.icon;

    // ── Filtered members with group filter ──
    const filteredMembers = useMemo(() => {
        let result = members;

        if (memberGroupFilter !== "all") {
            result = result.filter(
                (m) => m.memberGroup?.toLowerCase() === memberGroupFilter
            );
        }

        if (memberSearch.trim()) {
            const q = memberSearch.toLowerCase();
            result = result.filter(
                (m) =>
                    m.firstName.toLowerCase().includes(q) ||
                    m.lastName.toLowerCase().includes(q) ||
                    m.membershipId?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [members, memberSearch, memberGroupFilter]);

    const processedMemberIds = useMemo(
        () => new Set(entries.map((e) => e.memberId)),
        [entries]
    );

    const memberEntryCounts = useMemo(() => {
        const counts = new Map<string, number>();
        entries.forEach((e) => counts.set(e.memberId, (counts.get(e.memberId) ?? 0) + 1));
        return counts;
    }, [entries]);

    const memberTotals = useMemo(() => {
        if (workflow.type !== "payments") return new Map<string, number>();
        const totals = new Map<string, number>();
        entries.forEach((e) => {
            if (e.amount != null) totals.set(e.memberId, (totals.get(e.memberId) ?? 0) + e.amount);
        });
        return totals;
    }, [entries, workflow.type]);

    function handleMemberClick(member: WorkflowMember) {
        if (workflow.type === "payments") {
            setDrawerMember(member);
            setPaymentDrawerOpen(true);
        } else if (workflow.type === "roles") {
            setDrawerMember(member);
            setRoleDrawerOpen(true);
        } else {
            setSelectedMember(member);
            setTitle("");
            setDescription("");
        }
    }

    const handleDrawerEntryChange = useCallback(
        (newEntries: WorkflowEntry[]) => {
            setEntries((prev) => {
                const otherEntries = prev.filter(
                    (e) => e.memberId !== drawerMember?.memberId
                );
                const merged = [...newEntries, ...otherEntries].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                return merged;
            });

            if (workflow.type === "payments" && newEntries.length > 0) {
                fireConfetti();
            }
        },
        [drawerMember, workflow.type]
    );

    function handleMembersChanged() {
        router.refresh();
        setManageMembersOpen(false);
    }

    async function handleSaveEntry() {
        if (!selectedMember) return;
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        startTransition(async () => {
            try {
                const entry = await createWorkflowEntry({
                    workflowId: workflow.id,
                    memberId: selectedMember.memberId,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    entryType: workflow.type === "monitor" ? "monitor" : "record",
                    status: "completed",
                });

                setEntries((prev) => [entry, ...prev]);
                setTitle("");
                setDescription("");
                setSelectedMember(null);

                toast.success("Entry saved", {
                    description: `${entry.memberFirstName} ${entry.memberLastName} — ${entry.title}`,
                });
            } catch (error: any) {
                toast.error("Failed to save", { description: error.message });
            }
        });
    }

    async function handleDeleteEntry() {
        if (!deleteEntryId) return;

        startTransition(async () => {
            try {
                await deleteWorkflowEntry(deleteEntryId, workflow.id);
                setEntries((prev) => prev.filter((e) => e.id !== deleteEntryId));
                toast.success("Entry deleted");
            } catch (error: any) {
                toast.error("Failed to delete", { description: error.message });
            } finally {
                setDeleteEntryId(null);
            }
        });
    }

    // ── Export ──
    const handleExport = useCallback((formatType: "csv" | "excel") => {
        const columns = [
            { header: "Member Name", key: "memberName" },
            workflow.type === "roles"
                ? { header: "Role", key: "title" }
                : { header: "Title", key: "title" },
            { header: "Description", key: "description" },
            ...(workflow.type === "payments"
                ? [{ header: "Amount (GH₵)", key: "amount" }]
                : []),
            { header: "Status", key: "status" },
            { header: "Date Recorded", key: "date" },
        ];

        const data = entries.map((entry) => ({
            memberName: `${entry.memberFirstName} ${entry.memberLastName}`,
            title: entry.roleTitle ?? entry.title ?? "",
            description: entry.roleDescription ?? entry.description ?? "",
            amount: entry.amount != null ? entry.amount.toFixed(2) : "",
            status: entry.status.toUpperCase(),
            date: format(new Date(entry.createdAt), "MMM d, yyyy"),
        }));

        const fileName = `${workflow.slug}-entries-${format(new Date(), "yyyy-MM-dd")}`;

        if (formatType === "csv") {
            const headerRow = columns.map((c) => `"${c.header}"`).join(",");
            const rows = data.map((d) =>
                columns.map((c) => {
                    const val = String(d[c.key as keyof typeof d] ?? "");
                    return `"${val.replace(/"/g, '""')}"`;
                }).join(",")
            );
            const csvContent = "\uFEFF" + [headerRow, ...rows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            let html = "<html><head><meta charset='utf-8'></head><body><table border='1'><tr>";
            columns.forEach((c) => {
                html += `<th style="background-color:#4472C4;color:white;font-weight:bold;padding:8px">${c.header}</th>`;
            });
            html += "</tr>";
            data.forEach((d, i) => {
                const bgColor = i % 2 === 0 ? "#ffffff" : "#f2f2f2";
                html += `<tr style="background-color:${bgColor}">`;
                columns.forEach((c) => {
                    html += `<td style="padding:6px">${d[c.key as keyof typeof d]}</td>`;
                });
                html += "</tr>";
            });
            html += "</table></body></html>";
            const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.xls`;
            link.click();
            URL.revokeObjectURL(url);
        }
    }, [entries, workflow]);

    const totalPayments = entries.reduce((sum, e) => sum + (e.amount ?? 0), 0);
    const completedCount = entries.filter((e) => e.status === "completed").length;
    const pendingCount = entries.filter((e) => e.status === "pending").length;

    return (
        <TooltipProvider>
            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">

                {/* ✅ FIXED: /admin/all-workflows → /admin/workflows */}
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/workflows">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All Workflows
                    </Link>
                </Button>

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.bg)}>
                                <TypeIcon className={cn("h-5 w-5", config.color)} />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{workflow.name}</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {format(new Date(workflow.startDate), "MMM d")} – {format(new Date(workflow.endDate), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {members.length} members
                            </span>
                            <Badge variant="secondary">{config.badge}</Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setManageMembersOpen(true)}>
                            <UserPlus className="mr-2 h-3.5 w-3.5" />
                            Manage Members
                        </Button>
                        <Badge variant={isExpired ? "destructive" : "default"} className="w-fit">
                            {isExpired ? "Expired" : "Active"}
                        </Badge>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <BarChart3 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Entries</p>
                                <p className="text-lg font-bold tabular-nums">{entries.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/50">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <p className="text-lg font-bold tabular-nums">{completedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-950/50">
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Pending</p>
                                <p className="text-lg font-bold tabular-nums">{pendingCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", config.bg)}>
                                <TypeIcon className={cn("h-4 w-4", config.color)} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {workflow.type === "payments" ? "Total Amount" : "Processed"}
                                </p>
                                <p className="text-lg font-bold tabular-nums">
                                    {workflow.type === "payments"
                                        ? `GH₵ ${totalPayments.toFixed(2)}`
                                        : `${processedMemberIds.size}/${members.length}`}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {isExpired && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Workflow Expired</AlertTitle>
                        <AlertDescription>
                            This workflow&apos;s end date has passed. You can still view and add entries.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Main content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Members panel */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-3 space-y-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Members ({members.length})
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {workflow.type === "payments"
                                    ? "Click a member to record payments"
                                    : workflow.type === "roles"
                                        ? "Click a member to assign roles"
                                        : "Click a member to create entries"}
                            </CardDescription>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search…"
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        className="pl-9 h-8 text-sm"
                                    />
                                </div>
                                <Select value={memberGroupFilter} onValueChange={setMemberGroupFilter}>
                                    <SelectTrigger className="w-[100px] h-8 text-xs">
                                        <Filter className="h-3 w-3 mr-1" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GROUP_FILTER_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[500px]">
                                <div className="divide-y">
                                    {filteredMembers.map((member) => {
                                        const isProcessed = processedMemberIds.has(member.memberId);
                                        const isActive = selectedMember?.memberId === member.memberId;
                                        const initials = (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");
                                        const entryCount = memberEntryCounts.get(member.memberId) ?? 0;
                                        const memberTotal = memberTotals.get(member.memberId) ?? 0;

                                        return (
                                            <div
                                                key={member.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => handleMemberClick(member)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        handleMemberClick(member);
                                                    }
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors outline-none",
                                                    "hover:bg-muted/50 focus-visible:bg-muted/50",
                                                    isActive && "bg-primary/5 border-l-2 border-primary"
                                                )}
                                            >
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarImage src={member.avatarUrl || ""} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {initials.toUpperCase() || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {member.firstName} {member.lastName}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[11px] text-muted-foreground font-mono">
                                                            {member.membershipId ?? "—"}
                                                        </p>
                                                        {entryCount > 0 && (
                                                            <Badge variant="secondary" className="text-[9px] h-4 px-1">
                                                                {entryCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {workflow.type === "payments" && memberTotal > 0 && (
                                                        <span className="text-[10px] text-green-600 font-medium tabular-nums">
                                                            GH₵{memberTotal.toFixed(0)}
                                                        </span>
                                                    )}
                                                    {isProcessed && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>{entryCount} entries</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredMembers.length === 0 && (
                                        <p className="text-center py-8 text-sm text-muted-foreground">
                                            No members found.
                                        </p>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Right panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Form for records/monitor */}
                        {(workflow.type === "records" || workflow.type === "monitor") && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">{config.actionLabel}</CardTitle>
                                    <CardDescription>
                                        {selectedMember ? (
                                            <span className="flex items-center gap-2">
                                                <UserCheck className="h-3.5 w-3.5 text-primary" />
                                                <strong>
                                                    {selectedMember.firstName} {selectedMember.lastName}
                                                </strong>
                                            </span>
                                        ) : (
                                            "Select a member from the list."
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                {selectedMember ? (
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="entry-title">Title</Label>
                                            <Input
                                                id="entry-title"
                                                placeholder={
                                                    workflow.type === "monitor"
                                                        ? "e.g., Attendance note"
                                                        : "e.g., Service Duty"
                                                }
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="entry-desc">
                                                Description{" "}
                                                <span className="text-muted-foreground font-normal">
                                                    (optional)
                                                </span>
                                            </Label>
                                            <Textarea
                                                id="entry-desc"
                                                placeholder="Add notes…"
                                                rows={3}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                onClick={handleSaveEntry}
                                                disabled={isPending || !title.trim()}
                                            >
                                                {isPending ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="mr-2 h-4 w-4" />
                                                )}
                                                Save Entry
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedMember(null);
                                                    setTitle("");
                                                    setDescription("");
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardContent>
                                ) : (
                                    <CardContent>
                                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                                <Users className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Click a member to create an entry.
                                            </p>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        )}

                        {/* Info card for payments/roles */}
                        {(workflow.type === "payments" || workflow.type === "roles") && (
                            <Card>
                                <CardContent className="py-6">
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", config.bg)}>
                                            <TypeIcon className={cn("h-6 w-6", config.color)} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {workflow.type === "payments"
                                                    ? "Click a member to open the payment recorder"
                                                    : "Click a member to assign roles"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Each member&apos;s data opens in a dedicated panel.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Entries table */}
                        <Card>
                            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-base">
                                        All Entries ({entries.length})
                                    </CardTitle>
                                    <CardDescription>
                                        Processed {config.label.toLowerCase()} for this workflow.
                                    </CardDescription>
                                </div>
                                {entries.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport("csv")}
                                            className="h-8"
                                        >
                                            <Download className="mr-2 h-3.5 w-3.5" />CSV
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport("excel")}
                                            className="h-8"
                                        >
                                            <Download className="mr-2 h-3.5 w-3.5" />Excel
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {entries.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-12">
                                        <FileText className="h-10 w-10 text-muted-foreground/30" />
                                        <p className="text-sm text-muted-foreground">No entries yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Member</TableHead>
                                                    <TableHead>
                                                        {workflow.type === "roles" ? "Role" : "Title"}
                                                    </TableHead>
                                                    {workflow.type === "payments" && (
                                                        <TableHead className="text-right">Amount</TableHead>
                                                    )}
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                                                    <TableHead className="w-10" />
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {entries.map((entry) => {
                                                    const initials = (
                                                        (entry.memberFirstName[0] ?? "") +
                                                        (entry.memberLastName[0] ?? "")
                                                    ).toUpperCase();
                                                    return (
                                                        <TableRow key={entry.id}>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage src={entry.memberAvatarUrl || ""} />
                                                                        <AvatarFallback className="text-[8px]">
                                                                            {initials}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm truncate max-w-[120px]">
                                                                        {entry.memberFirstName} {entry.memberLastName}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="text-sm">
                                                                        {entry.roleTitle ?? entry.title}
                                                                    </p>
                                                                    {(entry.roleDescription ?? entry.description) && (
                                                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                                                            {entry.roleDescription ?? entry.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            {workflow.type === "payments" && (
                                                                <TableCell className="text-right tabular-nums">
                                                                    {entry.amount != null
                                                                        ? `GH₵ ${entry.amount.toFixed(2)}`
                                                                        : "—"}
                                                                </TableCell>
                                                            )}
                                                            <TableCell>
                                                                <Badge
                                                                    variant={
                                                                        entry.status === "completed"
                                                                            ? "default"
                                                                            : entry.status === "cancelled"
                                                                                ? "destructive"
                                                                                : "secondary"
                                                                    }
                                                                    className="text-[10px]"
                                                                >
                                                                    {entry.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                                                                {format(new Date(entry.createdAt), "MMM d, yyyy")}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                                    onClick={() => setDeleteEntryId(entry.id)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Delete dialog */}
                <AlertDialog
                    open={deleteEntryId !== null}
                    onOpenChange={(open) => !open && setDeleteEntryId(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteEntry}
                                disabled={isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isPending ? "Deleting…" : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Drawers */}
                {drawerMember && workflow.type === "payments" && (
                    <PaymentEntryDrawer
                        open={paymentDrawerOpen}
                        onOpenChange={(open) => {
                            setPaymentDrawerOpen(open);
                            if (!open) router.refresh();
                        }}
                        workflowId={workflow.id}
                        member={drawerMember}
                        onEntryChange={handleDrawerEntryChange}
                    />
                )}

                {drawerMember && workflow.type === "roles" && (
                    <RoleEntryDrawer
                        open={roleDrawerOpen}
                        onOpenChange={(open) => {
                            setRoleDrawerOpen(open);
                            if (!open) router.refresh();
                        }}
                        workflowId={workflow.id}
                        member={drawerMember}
                        onEntryChange={handleDrawerEntryChange}
                    />
                )}

                <ManageMembersDrawer
                    open={manageMembersOpen}
                    onOpenChange={setManageMembersOpen}
                    workflowId={workflow.id}
                    currentMembers={members}
                    onMembersChanged={handleMembersChanged}
                />
            </div>
        </TooltipProvider>
    );
}