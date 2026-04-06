// components/dashboard/tasks/task-detail-page.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ArrowLeft,
    CreditCard,
    FileText,
    Users,
    Clock,
    AlertCircle,
    Search,
    CheckCircle2,
    Shield,
    Activity,
    BarChart3,
    Download,
    UserPlus,
    Filter,
    Calendar,
    TrendingUp,
    Archive,
    MoreVertical,
} from "lucide-react";
import { format, isBefore } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    getStatusVariant,
    getPurposeConfig,
    getDaysUntilExpiry,
    getExpiryVariant,
    formatCurrency,
} from "@/lib/utils/task-utils";
import { TaskPaymentTracker } from "./task-payment-tracker";
import { TaskRecordManager } from "./task-record-manager";
import { TaskRoleAssigner } from "./task-role-assigner";
import { TaskMonitorTracker } from "./task-monitor-tracker";
import { TaskMembersManager } from "./task-members-manager";
import { TaskExportMenu } from "./task-export-menu";
import { TaskStatsCards } from "./task-stats-cards";
import type { TaskDetail, TaskMember, TaskActivity } from "@/lib/types/task";

interface TaskDetailPageProps {
    task: TaskDetail;
}

const GROUP_FILTER_OPTIONS = [
    { value: "all", label: "All Groups" },
    { value: "youth", label: "Youth" },
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
];

export function TaskDetailPage({ task }: TaskDetailPageProps) {
    const router = useRouter();
    const [activities, setActivities] = useState<TaskActivity[]>(task.activities);
    const [members, setMembers] = useState<TaskMember[]>(task.members);
    const [selectedMember, setSelectedMember] = useState<TaskMember | null>(null);
    const [memberSearch, setMemberSearch] = useState("");
    const [memberGroupFilter, setMemberGroupFilter] = useState("all");
    const [activeTab, setActiveTab] = useState<"all" | "by-member">("all");

    // Drawers
    const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
    const [recordDrawerOpen, setRecordDrawerOpen] = useState(false);
    const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
    const [monitorDrawerOpen, setMonitorDrawerOpen] = useState(false);
    const [membersManagerOpen, setMembersManagerOpen] = useState(false);
    const [drawerMember, setDrawerMember] = useState<TaskMember | null>(null);

    const isExpired = task.endDate && isBefore(new Date(task.endDate), new Date());
    const config = getPurposeConfig(task.purpose);
    const daysLeft = getDaysUntilExpiry(task.endDate);
    const expiryInfo = getExpiryVariant(daysLeft);

    // Filtered members
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

    // Member stats
    const memberActivityCounts = useMemo(() => {
        const counts = new Map<string, number>();
        activities.forEach((a) =>
            counts.set(a.memberId, (counts.get(a.memberId) ?? 0) + 1)
        );
        return counts;
    }, [activities]);

    const memberTotals = useMemo(() => {
        if (task.purpose !== "payments") return new Map<string, number>();
        const totals = new Map<string, number>();
        activities.forEach((a) => {
            if (a.amount != null)
                totals.set(a.memberId, (totals.get(a.memberId) ?? 0) + a.amount);
        });
        return totals;
    }, [activities, task.purpose]);

    const processedMemberIds = useMemo(
        () => new Set(activities.map((a) => a.memberId)),
        [activities]
    );

    function handleMemberClick(member: TaskMember) {
        setDrawerMember(member);

        switch (task.purpose) {
            case "payments":
                setPaymentDrawerOpen(true);
                break;
            case "records":
                setRecordDrawerOpen(true);
                break;
            case "roles":
                setRoleDrawerOpen(true);
                break;
            case "monitoring":
                setMonitorDrawerOpen(true);
                break;
            default:
                setRecordDrawerOpen(true);
        }
    }

    const handleActivityChange = useCallback(
        (newActivities: TaskActivity[]) => {
            setActivities((prev) => {
                const otherActivities = prev.filter(
                    (a) => a.memberId !== drawerMember?.memberId
                );
                const merged = [...newActivities, ...otherActivities].sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                return merged;
            });
        },
        [drawerMember]
    );

    function handleMembersChanged() {
        router.refresh();
        setMembersManagerOpen(false);
    }

    // Stats calculations
    const totalPayments = activities
        .filter((a) => a.amount != null)
        .reduce((sum, a) => sum + (a.amount ?? 0), 0);

    const completedActivities = activities.filter(
        (a) => a.paymentStatus === "completed" || !a.paymentStatus
    ).length;

    const pendingActivities = activities.filter(
        (a) => a.paymentStatus === "pending"
    ).length;

    return (
        <TooltipProvider>
            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Back Button */}
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/task">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All Tasks
                    </Link>
                </Button>

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg",
                                    config.bg
                                )}
                            >
                                <div className={cn("h-5 w-5", config.color)}>
                                    {task.purpose === "payments" && <CreditCard className="h-5 w-5" />}
                                    {task.purpose === "records" && <FileText className="h-5 w-5" />}
                                    {task.purpose === "roles" && <Shield className="h-5 w-5" />}
                                    {task.purpose === "monitoring" && <Activity className="h-5 w-5" />}
                                    {task.purpose === "groups" && <Users className="h-5 w-5" />}
                                    {task.purpose === "other" && <MoreVertical className="h-5 w-5" />}
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{task.name}</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {task.startDate && task.endDate && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {format(new Date(task.startDate), "MMM d")} –{" "}
                                    {format(new Date(task.endDate), "MMM d, yyyy")}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {members.length} members
                            </span>
                            <Badge variant="secondary">{config.label}</Badge>
                        </div>
                        {task.description && (
                            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                                {task.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMembersManagerOpen(true)}
                        >
                            <UserPlus className="mr-2 h-3.5 w-3.5" />
                            Manage Members
                        </Button>
                        <Badge variant={getStatusVariant(task.status)} className="w-fit">
                            {task.status}
                        </Badge>
                        {daysLeft !== null && daysLeft <= 7 && (
                            <Badge variant={expiryInfo.variant}>{expiryInfo.label}</Badge>
                        )}
                    </div>
                </div>

                {/* Expiry Alert */}
                {isExpired && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Task Expired</AlertTitle>
                        <AlertDescription>
                            This task's end date has passed. You can still view and manage
                            activities.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                <TaskStatsCards
                    task={task}
                    totalActivities={activities.length}
                    completedActivities={completedActivities}
                    pendingActivities={pendingActivities}
                    totalPayments={totalPayments}
                    processedMembers={processedMemberIds.size}
                />

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Members Panel */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-3 space-y-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Members ({members.length})
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {task.purpose === "payments"
                                    ? "Click a member to record payments"
                                    : task.purpose === "roles"
                                        ? "Click a member to assign roles"
                                        : task.purpose === "monitoring"
                                            ? "Click a member to track activities"
                                            : "Click a member to create records"}
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
                                <Select
                                    value={memberGroupFilter}
                                    onValueChange={setMemberGroupFilter}
                                >
                                    <SelectTrigger className="w-[100px] h-8 text-xs">
                                        <Filter className="h-3 w-3 mr-1" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GROUP_FILTER_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                                className="text-xs"
                                            >
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
                                        const activityCount =
                                            memberActivityCounts.get(member.memberId) ?? 0;
                                        const memberTotal = memberTotals.get(member.memberId) ?? 0;
                                        const initials =
                                            (member.firstName?.[0] ?? "") +
                                            (member.lastName?.[0] ?? "");

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
                                                    "hover:bg-muted/50 focus-visible:bg-muted/50"
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
                                                        {activityCount > 0 && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[9px] h-4 px-1"
                                                            >
                                                                {activityCount}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Progress bar for member */}
                                                    {member.progress > 0 && (
                                                        <div className="mt-1.5">
                                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-0.5">
                                                                <span>{member.progress}%</span>
                                                            </div>
                                                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary transition-all"
                                                                    style={{ width: `${member.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {task.purpose === "payments" && memberTotal > 0 && (
                                                        <span className="text-[10px] text-green-600 font-medium tabular-nums">
                                                            GH₵{memberTotal.toFixed(0)}
                                                        </span>
                                                    )}
                                                    {isProcessed && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {activityCount} activities
                                                            </TooltipContent>
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

                    {/* Activities Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-base">
                                        Activities ({activities.length})
                                    </CardTitle>
                                    <CardDescription>
                                        All recorded activities for this task.
                                    </CardDescription>
                                </div>
                                {activities.length > 0 && (
                                    <TaskExportMenu task={task} activities={activities} />
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                    <div className="px-6 pb-4">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="all">All Activities</TabsTrigger>
                                            <TabsTrigger value="by-member">By Member</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="all" className="mt-0">
                                        {activities.length === 0 ? (
                                            <div className="flex flex-col items-center gap-2 py-12">
                                                <FileText className="h-10 w-10 text-muted-foreground/30" />
                                                <p className="text-sm text-muted-foreground">
                                                    No activities yet.
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Click a member to create an activity.
                                                </p>
                                            </div>
                                        ) : (
                                            <ScrollArea className="h-[400px]">
                                                <div className="divide-y">
                                                    {activities.map((activity) => (
                                                        <div
                                                            key={activity.id}
                                                            className="px-6 py-4 hover:bg-muted/30 transition-colors"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <Avatar className="h-8 w-8 shrink-0 mt-1">
                                                                    <AvatarImage
                                                                        src={activity.memberAvatarUrl || ""}
                                                                    />
                                                                    <AvatarFallback className="text-[10px]">
                                                                        {((activity.memberFirstName?.[0] ?? "") +
                                                                            (activity.memberLastName?.[0] ?? "")
                                                                        ).toUpperCase() || "?"}
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex-1">
                                                                            <Link
                                                                                href={`/admin/users/${activity.memberId}`}
                                                                                className="text-sm font-medium hover:text-primary transition-colors"
                                                                            >
                                                                                {activity.memberFirstName}{" "}
                                                                                {activity.memberLastName}
                                                                            </Link>
                                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                                {format(
                                                                                    new Date(activity.createdAt),
                                                                                    "MMM d, yyyy 'at' h:mm a"
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                        {activity.amount != null && (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                                                            >
                                                                                {formatCurrency(activity.amount)}
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    <div className="mt-2">
                                                                        <p className="text-sm font-medium">
                                                                            {activity.roleTitle ?? activity.title}
                                                                        </p>
                                                                        {(activity.roleDescription ??
                                                                            activity.description ??
                                                                            activity.monitorNote) && (
                                                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                                    {activity.roleDescription ??
                                                                                        activity.description ??
                                                                                        activity.monitorNote}
                                                                                </p>
                                                                            )}
                                                                    </div>

                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <Badge variant="outline" className="text-[10px]">
                                                                            {activity.activityType}
                                                                        </Badge>
                                                                        {activity.paymentStatus && (
                                                                            <Badge
                                                                                variant={
                                                                                    activity.paymentStatus === "completed"
                                                                                        ? "default"
                                                                                        : activity.paymentStatus === "cancelled"
                                                                                            ? "destructive"
                                                                                            : "secondary"
                                                                                }
                                                                                className="text-[10px]"
                                                                            >
                                                                                {activity.paymentStatus}
                                                                            </Badge>
                                                                        )}
                                                                        {activity.paymentPeriod && (
                                                                            <Badge variant="secondary" className="text-[10px]">
                                                                                {activity.paymentPeriod}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="by-member" className="mt-0">
                                        <ScrollArea className="h-[400px]">
                                            <div className="divide-y">
                                                {members
                                                    .filter((m) =>
                                                        activities.some((a) => a.memberId === m.memberId)
                                                    )
                                                    .map((member) => {
                                                        const memberActivities = activities.filter(
                                                            (a) => a.memberId === member.memberId
                                                        );
                                                        const initials =
                                                            (member.firstName?.[0] ?? "") +
                                                            (member.lastName?.[0] ?? "");

                                                        return (
                                                            <div key={member.id} className="px-6 py-4">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={member.avatarUrl || ""} />
                                                                        <AvatarFallback className="text-[10px]">
                                                                            {initials.toUpperCase() || "?"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1">
                                                                        <Link
                                                                            href={`/admin/users/${member.memberId}`}
                                                                            className="text-sm font-medium hover:text-primary transition-colors"
                                                                        >
                                                                            {member.firstName} {member.lastName}
                                                                        </Link>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {memberActivities.length} activity
                                                                            {memberActivities.length !== 1 ? "ies" : "y"}
                                                                        </p>
                                                                    </div>
                                                                    <Badge variant="secondary">
                                                                        {member.progress}%
                                                                    </Badge>
                                                                </div>

                                                                <div className="ml-11 space-y-2">
                                                                    {memberActivities.map((activity) => (
                                                                        <div
                                                                            key={activity.id}
                                                                            className="text-xs p-2 rounded-md bg-muted/30"
                                                                        >
                                                                            <p className="font-medium">
                                                                                {activity.roleTitle ?? activity.title}
                                                                            </p>
                                                                            <p className="text-muted-foreground text-[11px] mt-0.5">
                                                                                {format(
                                                                                    new Date(activity.createdAt),
                                                                                    "MMM d, yyyy"
                                                                                )}
                                                                                {activity.amount != null &&
                                                                                    ` · ${formatCurrency(activity.amount)}`}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Drawers */}
                {drawerMember && task.purpose === "payments" && (
                    <TaskPaymentTracker
                        open={paymentDrawerOpen}
                        onOpenChange={(open) => {
                            setPaymentDrawerOpen(open);
                            if (!open) router.refresh();
                        }}
                        taskId={task.id}
                        member={drawerMember}
                        onActivityChange={handleActivityChange}
                    />
                )}

                {drawerMember && task.purpose === "records" && (
                    <TaskRecordManager
                        open={recordDrawerOpen}
                        onOpenChange={(open) => {
                            setRecordDrawerOpen(open);
                            if (!open) router.refresh();
                        }}
                        taskId={task.id}
                        member={drawerMember}
                        onActivityChange={handleActivityChange}
                    />
                )}

                {drawerMember && task.purpose === "roles" && (
                    <TaskRoleAssigner
                        open={roleDrawerOpen}
                        onOpenChange={(open) => {
                            setRoleDrawerOpen(open);
                            if (!open) router.refresh();
                        }}
                        taskId={task.id}
                        member={drawerMember}
                        onActivityChange={handleActivityChange}
                    />
                )}

                {drawerMember && task.purpose === "monitoring" && (
                    <TaskMonitorTracker
                        open={monitorDrawerOpen}
                        onOpenChange={(open) => {
                            setMonitorDrawerOpen(open);
                            if (!open) router.refresh();
                        }}
                        taskId={task.id}
                        member={drawerMember}
                        onActivityChange={handleActivityChange}
                    />
                )}

                <TaskMembersManager
                    open={membersManagerOpen}
                    onOpenChange={setMembersManagerOpen}
                    taskId={task.id}
                    currentMembers={members}
                    onMembersChanged={handleMembersChanged}
                />
            </div>
        </TooltipProvider>
    );
}