// components/dashboard/tasks/tasks-list.tsx
"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    LayoutGrid,
    Search,
    MoreHorizontal,
    Eye,
    Trash2,
    AlertCircle,
    Loader2,
    FolderOpen,
    Calendar,
    Users,
    TrendingUp,
    LayoutList,
    X,
    CreditCard,
    FileText,
    Shield,
    Activity,
    UsersIcon,
    MoreVertical,
    ArrowUpRight,
    Globe,
    Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { deleteTask } from "@/actions/task";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TaskCreateTrigger from "./task-create-trigger";
import {
    getStatusVariant,
    getPurposeConfig,
    getDaysUntilExpiry,
    isExpiringSoon,
    isTaskExpired,
    getExpiryVariant,
    sortTasks,
    filterTasks,
} from "@/lib/utils/task-utils";
import type {
    TaskWithStats,
    TaskViewMode,
    TaskStatus,
    TaskPurpose,
} from "@/lib/types/task";

interface TasksListProps {
    initialTasks: TaskWithStats[];
}

const PURPOSE_ICONS = {
    payments: CreditCard,
    records: FileText,
    roles: Shield,
    monitoring: Activity,
    groups: UsersIcon,
    other: MoreVertical,
};

export function TasksList({ initialTasks }: TasksListProps) {
    const router = useRouter();
    const [tasks, setTasks] = useState(initialTasks);
    const [viewMode, setViewMode] = useState<TaskViewMode>("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
    const [purposeFilter, setPurposeFilter] = useState<TaskPurpose | "all">("all");
    const [sortBy, setSortBy] = useState<"created_at" | "name" | "completion_rate" | "end_date">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [deleteTarget, setDeleteTarget] = useState<TaskWithStats | null>(null);
    const [isPending, startTransition] = useTransition();

    // Filter and sort tasks
    const filteredAndSortedTasks = useMemo(() => {
        let result = tasks;

        result = filterTasks(result, {
            status: statusFilter === "all" ? undefined : statusFilter,
            purpose: purposeFilter === "all" ? undefined : purposeFilter,
            search: searchQuery,
        });

        result = sortTasks(result, sortBy, sortOrder);

        return result;
    }, [tasks, searchQuery, statusFilter, purposeFilter, sortBy, sortOrder]);

    const expiredCount = tasks.filter((t) => t.endDate && isTaskExpired(t.endDate)).length;
    const expiringSoonCount = tasks.filter((t) => t.endDate && isExpiringSoon(t.endDate)).length;

    const activeFiltersCount = [
        searchQuery.trim() !== "",
        statusFilter !== "all",
        purposeFilter !== "all",
    ].filter(Boolean).length;

    async function handleDelete() {
        if (!deleteTarget) return;

        startTransition(async () => {
            try {
                await deleteTask(deleteTarget.id);
                setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
                toast.success("Task deleted");
                router.refresh();
            } catch (error: any) {
                toast.error("Failed to delete", { description: error.message });
            } finally {
                setDeleteTarget(null);
            }
        });
    }

    function clearFilters() {
        setSearchQuery("");
        setStatusFilter("all");
        setPurposeFilter("all");
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#09090b] text-white min-h-screen">
            {/* Header Bento Box */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12] p-6 sm:p-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 z-10 max-w-xl">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/10">
                            <Sparkles className="h-3.5 w-3.5 text-white" />
                        </span>
                        <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                            Management
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Tasks Overview</h1>
                    <p className="text-xs sm:text-sm text-neutral-400">
                        Track operations, manage member activities, and monitor platform progress.
                        {tasks.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white font-medium">
                                {tasks.length} total
                            </span>
                        )}
                    </p>
                </div>

                <div className="z-10 shrink-0">
                    <TaskCreateTrigger />
                </div>

                {/* Decorative Grid Line Graphics */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>

            {/* Alerts */}
            {expiredCount > 0 && (
                <Alert variant="destructive" className="rounded-2xl border-red-500/30 bg-red-950/20 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action Needed</AlertTitle>
                    <AlertDescription>
                        {expiredCount} task(s) have expired. Review and update their status.
                    </AlertDescription>
                </Alert>
            )}

            {expiringSoonCount > 0 && (
                <Alert className="rounded-2xl border-amber-500/30 bg-amber-950/20 text-amber-400">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <AlertTitle>Expiring Soon</AlertTitle>
                    <AlertDescription>
                        {expiringSoonCount} task(s) will expire within 7 days.
                    </AlertDescription>
                </Alert>
            )}

            {/* Control Toolbar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between p-2 rounded-2xl border border-white/10 bg-[#0f0f12]">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 text-xs rounded-xl border-white/10 bg-white/5 text-white placeholder:text-neutral-500 focus-visible:ring-white/20"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-neutral-400 hover:text-white"
                            onClick={() => setSearchQuery("")}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Filters & Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                        <SelectTrigger className="w-[120px] h-10 text-xs rounded-xl border-white/10 bg-white/5 text-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#18181b] text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Purpose Filter */}
                    <Select value={purposeFilter} onValueChange={(v) => setPurposeFilter(v as any)}>
                        <SelectTrigger className="w-[130px] h-10 text-xs rounded-xl border-white/10 bg-white/5 text-white">
                            <SelectValue placeholder="Purpose" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#18181b] text-white">
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="payments">💳 Payments</SelectItem>
                            <SelectItem value="records">📄 Records</SelectItem>
                            <SelectItem value="roles">🛡️ Roles</SelectItem>
                            <SelectItem value="groups">👥 Groups</SelectItem>
                            <SelectItem value="monitoring">📊 Monitoring</SelectItem>
                            <SelectItem value="other">📌 Other</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                        <SelectTrigger className="w-[130px] h-10 text-xs rounded-xl border-white/10 bg-white/5 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#18181b] text-white">
                            <SelectItem value="created_at">Created Date</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="completion_rate">Progress</SelectItem>
                            <SelectItem value="end_date">End Date</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort Order Toggle */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                        <TrendingUp className={cn("h-4 w-4 transition-transform", sortOrder === "desc" && "rotate-180")} />
                    </Button>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 border border-white/10 rounded-xl p-1 bg-white/5">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className={cn("h-8 w-8 rounded-lg", viewMode === "grid" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white")}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className={cn("h-8 w-8 rounded-lg", viewMode === "list" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white")}
                            onClick={() => setViewMode("list")}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 text-xs text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl"
                            onClick={clearFilters}
                        >
                            Clear ({activeFiltersCount})
                        </Button>
                    )}
                </div>
            </div>

            {/* Empty State Options (Designed matching Google I/O Bento visual grid) */}
            {tasks.length === 0 ? (
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12] p-8 sm:p-12 text-center min-h-[380px] flex flex-col items-center justify-center space-y-5">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                        <FolderOpen className="h-10 w-10 text-neutral-400" />
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="max-w-md space-y-2">
                        <h3 className="text-xl font-bold text-white">No tasks created yet</h3>
                        <p className="text-xs sm:text-sm text-neutral-400">
                            Start building your operational workflow by establishing your first task and registering members.
                        </p>
                    </div>
                    <div className="pt-2">
                        <TaskCreateTrigger />
                    </div>

                    {/* Abstract Wireframe Sphere Graphics Background */}
                    <div className="absolute -right-12 -bottom-12 pointer-events-none opacity-20">
                        <div className="w-64 h-64 rounded-full border border-white/20 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:12px_12px]" />
                    </div>
                </div>
            ) : filteredAndSortedTasks.length === 0 ? (
                /* Empty Filter State - Styled in modern Flow App dark UI layout */
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12] p-8 sm:p-12 text-center min-h-[360px] flex flex-col items-center justify-center space-y-5">
                    {/* Bento Graphical Mesh Icon Context */}
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent shadow-xl">
                        <Search className="h-9 w-9 text-amber-400" />
                        <div className="absolute inset-0 rounded-3xl border border-amber-500/20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px] opacity-40" />
                    </div>

                    <div className="max-w-md space-y-1.5">
                        <h3 className="text-xl font-bold text-white">No matching tasks found</h3>
                        <p className="text-xs sm:text-sm text-neutral-400">
                            We couldn't find any tasks matching your selected filters or search query. Try clearing filters to inspect all records.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="rounded-full border-white/20 bg-white/5 text-xs text-white hover:bg-white/10 hover:text-white px-6 py-2"
                    >
                        Clear Search & Filters
                    </Button>

                    {/* Graphic Wireframe Background Decor */}
                    <div className="absolute left-[-20px] bottom-[-20px] pointer-events-none opacity-15">
                        <div className="w-48 h-48 rounded-full border border-white/20" />
                    </div>
                </div>
            ) : (
                /* Tasks List / Grid Display */
                <div
                    className={cn(
                        "grid gap-4 sm:gap-6",
                        viewMode === "grid"
                            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1"
                    )}
                >
                    {filteredAndSortedTasks.map((task) => {
                        const config = getPurposeConfig(task.purpose);
                        const PurposeIcon = PURPOSE_ICONS[task.purpose] || MoreVertical;
                        const daysLeft = getDaysUntilExpiry(task.endDate);
                        const expiryInfo = getExpiryVariant(daysLeft);
                        const taskUrl = `/admin/task/${task.slug}`;

                        if (viewMode === "list") {
                            return (
                                <div
                                    key={task.id}
                                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all group"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div
                                            className={cn(
                                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5",
                                                config.bg
                                            )}
                                        >
                                            <PurposeIcon className="h-6 w-6 text-white" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <Link href={taskUrl} className="group-hover:text-emerald-400 transition-colors">
                                                <h3 className="font-bold text-base text-white truncate">
                                                    {task.name}
                                                </h3>
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-neutral-400">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {task.memberCount} members
                                                </span>
                                                {task.endDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(task.endDate), "MMM d, yyyy")}
                                                    </span>
                                                )}
                                                <Badge variant="secondary" className="bg-white/10 text-white rounded-full text-[10px] px-2 py-0">
                                                    {config.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                                        {/* Progress */}
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white tabular-nums">{task.completionRate}%</p>
                                                <p className="text-[10px] text-neutral-400">Complete</p>
                                            </div>
                                            <div className="w-10 h-10 relative flex items-center justify-center">
                                                <svg className="transform -rotate-90 w-10 h-10">
                                                    <circle
                                                        cx="20"
                                                        cy="20"
                                                        r="16"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        className="text-white/10"
                                                    />
                                                    <circle
                                                        cx="20"
                                                        cy="20"
                                                        r="16"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        strokeDasharray={`${2 * Math.PI * 16}`}
                                                        strokeDashoffset={`${2 * Math.PI * 16 * (1 - task.completionRate / 100)}`}
                                                        className="text-emerald-400 transition-all"
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        <Badge variant={getStatusVariant(task.status)} className="rounded-full px-3 py-0.5 text-xs">
                                            {task.status}
                                        </Badge>

                                        {/* Actions Menu */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-white/10 bg-[#18181b] text-white">
                                                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
                                                    <Link href={taskUrl}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Task
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem
                                                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                                    onClick={() => setDeleteTarget(task)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        }

                        {/* Grid View Bento Style */ }
                        return (
                            <div
                                key={task.id}
                                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12] p-6 flex flex-col justify-between hover:border-white/20 transition-all group"
                            >
                                <div className="space-y-4">
                                    {/* Top Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                                            <PurposeIcon className="h-5 w-5 text-white" />
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Badge variant={getStatusVariant(task.status)} className="rounded-full px-2.5 py-0.5 text-[10px] uppercase font-semibold">
                                                {task.status}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-neutral-400 hover:text-white"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="border-white/10 bg-[#18181b] text-white">
                                                    <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
                                                        <Link href={taskUrl}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Task
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/10" />
                                                    <DropdownMenuItem
                                                        className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                                        onClick={() => setDeleteTarget(task)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Task Title & Description */}
                                    <div>
                                        <Link href={taskUrl} className="group-hover:text-emerald-400 transition-colors">
                                            <h3 className="text-xl font-bold tracking-tight text-white line-clamp-1">
                                                {task.name}
                                            </h3>
                                        </Link>
                                        {task.description && (
                                            <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Progress Indicator Bar */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-neutral-400 font-medium">Progress</span>
                                            <span className="font-extrabold text-white tabular-nums">{task.completionRate}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-500"
                                                style={{ width: `${task.completionRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Metadata */}
                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{task.memberCount} member{task.memberCount !== 1 ? "s" : ""}</span>
                                    </div>

                                    <Link href={taskUrl}>
                                        <div className="inline-flex items-center gap-1 text-xs text-white font-medium hover:text-emerald-400 transition-colors">
                                            <span>Details</span>
                                            <ArrowUpRight className="h-3 w-3" />
                                        </div>
                                    </Link>
                                </div>

                                {/* Background Decoration Graphic */}
                                <div className="absolute right-[-10px] bottom-[-10px] pointer-events-none opacity-5">
                                    <Globe className="w-32 h-32 text-white" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="border-white/10 bg-[#18181b] text-white rounded-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold">Delete this task?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-neutral-400">
                            This will permanently delete <strong className="text-white">{deleteTarget?.name}</strong> along with all associated activity records and member assignments.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending} className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="rounded-full bg-red-600 text-white hover:bg-red-700"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                "Delete Task"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}