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
    List,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Trash2,
    AlertCircle,
    Loader2,
    FolderOpen,
    Calendar,
    Users,
    TrendingUp,
    Grid3x3,
    LayoutList,
    X,
    CreditCard,
    FileText,
    Shield,
    Activity,
    UsersIcon,
    MoreVertical,
} from "lucide-react";
import { format, isBefore } from "date-fns";
import { deleteTask } from "@/actions/task";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TaskCreateTrigger } from "./task-create-trigger";
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

    const now = new Date();

    // Filter and sort tasks
    const filteredAndSortedTasks = useMemo(() => {
        let result = tasks;

        // Apply filters
        result = filterTasks(result, {
            status: statusFilter === "all" ? undefined : statusFilter,
            purpose: purposeFilter === "all" ? undefined : purposeFilter,
            search: searchQuery,
        });

        // Apply sorting
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
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage member tasks, activities, and progress tracking.
                        {tasks.length > 0 && (
                            <span className="ml-1">
                                · {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </p>
                </div>
                <TaskCreateTrigger />
            </div>

            {/* Alerts */}
            {expiredCount > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action Needed</AlertTitle>
                    <AlertDescription>
                        {expiredCount} task(s) have expired. Review and update their status.
                    </AlertDescription>
                </Alert>
            )}

            {expiringSoonCount > 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Expiring Soon</AlertTitle>
                    <AlertDescription>
                        {expiringSoonCount} task(s) will expire within 7 days.
                    </AlertDescription>
                </Alert>
            )}

            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1 sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                            onClick={() => setSearchQuery("")}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Filters & View */}
                <div className="flex items-center gap-2">
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Purpose Filter */}
                    <Select value={purposeFilter} onValueChange={(v) => setPurposeFilter(v as any)}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="Purpose" />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_at">Created Date</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="completion_rate">Progress</SelectItem>
                            <SelectItem value="end_date">End Date</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort Order */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    >
                        <TrendingUp className={cn("h-4 w-4 transition-transform", sortOrder === "desc" && "rotate-180")} />
                    </Button>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 border rounded-md p-1">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setViewMode("list")}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-9" onClick={clearFilters}>
                            Clear ({activeFiltersCount})
                        </Button>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {tasks.length === 0 ? (
                <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center gap-4 py-20">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                            <FolderOpen className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-medium">No tasks yet</p>
                            <p className="text-sm text-muted-foreground">
                                Create your first task to start tracking member activities.
                            </p>
                        </div>
                        <TaskCreateTrigger />
                    </CardContent>
                </Card>
            ) : filteredAndSortedTasks.length === 0 ? (
                <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-medium">No tasks found</p>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your filters or search query.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                /* Task Cards/List */
                <div
                    className={cn(
                        "grid gap-6",
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
                                <Card key={task.id} className="hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 p-4">
                                        {/* Icon */}
                                        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", config.bg)}>
                                            <PurposeIcon className={cn("h-6 w-6", config.color)} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link href={taskUrl} className="group">
                                                <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                                                    {task.name}
                                                </h3>
                                            </Link>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {task.memberCount}
                                                </span>
                                                {task.endDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(task.endDate), "MMM d, yyyy")}
                                                    </span>
                                                )}
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {config.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{task.completionRate}%</p>
                                                <p className="text-xs text-muted-foreground">Complete</p>
                                            </div>
                                            <div className="w-16 h-16">
                                                <svg className="transform -rotate-90" width="64" height="64">
                                                    <circle
                                                        cx="32"
                                                        cy="32"
                                                        r="28"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        fill="none"
                                                        className="text-muted"
                                                    />
                                                    <circle
                                                        cx="32"
                                                        cy="32"
                                                        r="28"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        fill="none"
                                                        strokeDasharray={`${2 * Math.PI * 28}`}
                                                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - task.completionRate / 100)}`}
                                                        className="text-primary transition-all"
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <Badge variant={getStatusVariant(task.status)} className="shrink-0">
                                            {task.status}
                                        </Badge>

                                        {/* Actions */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={taskUrl}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Task
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeleteTarget(task)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </Card>
                            );
                        }

                        // Grid View
                        return (
                            <Link
                                key={task.id}
                                href={taskUrl}
                                className={cn(
                                    "group flex flex-col transition-all duration-300 border-none rounded-3xl shadow-sm",
                                    "hover:shadow-xl hover:-translate-y-1",
                                    config.cardBg
                                )}
                            >
                                <Card className="border-none shadow-none bg-transparent h-full flex flex-col">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner bg-white/90")}>
                                                <PurposeIcon className={cn("h-6 w-6", config.color)} />
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-inherit opacity-60 hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={taskUrl}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Task
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setDeleteTarget(task);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <CardTitle className="text-xl mt-4 font-bold tracking-tight text-white line-clamp-2">
                                            {task.name}
                                        </CardTitle>

                                        {task.description && (
                                            <CardDescription className="text-white/80 line-clamp-2 text-sm">
                                                {task.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>

                                    <CardContent className="flex-1 pb-3 space-y-2">
                                        <Badge className="bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-md font-medium">
                                            {config.label}
                                        </Badge>

                                        {/* Progress Bar */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs text-white/90">
                                                <span>Progress</span>
                                                <span className="font-medium">{task.completionRate}%</span>
                                            </div>
                                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white/90 transition-all duration-500"
                                                    style={{ width: `${task.completionRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-3 flex flex-col gap-2 bg-black/5 rounded-b-3xl">
                                        <div className="flex items-center justify-between w-full">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/90">
                                                <Users className="h-3.5 w-3.5" />
                                                {task.memberCount} member{task.memberCount !== 1 ? "s" : ""}
                                            </span>
                                            <Badge variant={getStatusVariant(task.status)} className="text-[10px] uppercase font-bold">
                                                {task.status}
                                            </Badge>
                                        </div>

                                        {task.endDate && (
                                            <div className="flex items-center gap-1.5 text-xs text-white/80">
                                                <Calendar className="h-3 w-3" />
                                                <span>Ends {format(new Date(task.endDate), "MMM d, yyyy")}</span>
                                                {daysLeft !== null && daysLeft <= 7 && (
                                                    <Badge variant={expiryInfo.variant} className="text-[9px] ml-auto">
                                                        {expiryInfo.label}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </CardFooter>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Delete Dialog */}
            <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteTarget?.name}</strong> and all its activities and member assignments.
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}