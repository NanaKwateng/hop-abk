"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "link";
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
    Plus,
    CheckCircle2,
    Clock,
    ArrowUpRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/task-utils";
import { deleteTaskAction } from "@/app/actions/task-actions";
import type { TaskItem } from "@/lib/types/task";
import { cn } from "@/lib/utils";

interface TasksListProps {
    initialTasks: TaskItem[];
}

export function TasksList({ initialTasks }: TasksListProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
    const [searchQuery, setSearchQuery] = useState("");
    const [purposeFilter, setPurposeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleteTarget, setDeleteTarget] = useState<TaskItem | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Derived unique list of purposes for filter dropdown
    const availablePurposes = useMemo(() => {
        const set = new Set<string>();
        tasks.forEach((t) => {
            if (t.purpose) set.add(t.purpose);
        });
        return Array.from(set);
    }, [tasks]);

    // Client-side Filtering
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                searchQuery === "" ||
                task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description &&
                    task.description.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesPurpose =
                purposeFilter === "all" || task.purpose === purposeFilter;

            const rate = task.completionRate || 0;
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "completed" && rate >= 100) ||
                (statusFilter === "in_progress" && rate > 0 && rate < 100) ||
                (statusFilter === "not_started" && rate === 0);

            return matchesSearch && matchesPurpose && matchesStatus;
        });
    }, [tasks, searchQuery, purposeFilter, statusFilter]);

    // Action Handler: Delete Task
    const handleDelete = () => {
        if (!deleteTarget) return;

        setError(null);
        startTransition(async () => {
            const result = await deleteTaskAction(deleteTarget.id);

            if (result.success) {
                setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
                setDeleteTarget(null);
                router.refresh();
            } else {
                setError(result.error || "Failed to delete task.");
                setDeleteTarget(null);
            }
        });
    };

    return (
        <div className="space-y-6 text-neutral-900 dark:text-white transition-colors duration-300">
            {/* Top Toolbar Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-xl p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-neutral-200 dark:border-white/10 bg-neutral-50/80 dark:bg-white/5 text-sm text-neutral-900 dark:text-white focus-visible:ring-amber-500/40"
                    />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                        <SelectTrigger className="w-[150px] h-10 rounded-xl border-neutral-200 dark:border-white/10 bg-neutral-50/80 dark:bg-white/5 text-xs text-neutral-900 dark:text-white">
                            <SelectValue placeholder="All Execution Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#0c0c0e] border-neutral-200 dark:border-white/10 text-xs">
                            <SelectItem value="all">All Purpose</SelectItem>
                            {availablePurposes.map((p) => (
                                <SelectItem key={p} value={p} className="capitalize">
                                    {p}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-neutral-200 dark:border-white/10 bg-neutral-50/80 dark:bg-white/5 text-xs text-neutral-900 dark:text-white">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#0c0c0e] border-neutral-200 dark:border-white/10 text-xs">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="not_started">Not Started</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        asChild
                        className="h-10 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold shadow-lg shadow-orange-500/20 hover:opacity-95 transition-opacity px-4"
                    >
                        <Link href="/dashboard/tasks/new">
                            <Plus className="mr-1.5 h-4 w-4" />
                            New Task
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Global Error Banner */}
            {error && (
                <Alert variant="destructive" className="rounded-2xl border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Task Grid Cards */}
            {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[280px] rounded-3xl border border-dashed border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-[#0c0c0e]/50 p-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 mb-3">
                        <FolderOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">No tasks found</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
                        Try adjusting your search criteria or create a new task to get started.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTasks.map((task, index) => {
                        const completionRate = Math.min(
                            100,
                            Math.max(0, Math.round(task.completionRate || 0))
                        );

                        // Color variants per card index for visually rich theme
                        const isOrange = index % 3 === 0;
                        const isEmerald = index % 3 === 1;
                        const isPurple = index % 3 === 2;

                        return (
                            <Card
                                key={task.id}
                                className={cn(
                                    "relative overflow-hidden rounded-3xl border border-neutral-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0c0c0e]/90 backdrop-blur-xl flex flex-col justify-between group transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl",
                                    isOrange && "hover:border-orange-500/40 hover:shadow-orange-500/10",
                                    isEmerald && "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
                                    isPurple && "hover:border-purple-500/40 hover:shadow-purple-500/10"
                                )}
                            >
                                {/* Glow Background Aura Effect */}
                                <div
                                    className={cn(
                                        "absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 pointer-events-none",
                                        isOrange && "bg-[radial-gradient(circle,rgba(251,146,60,0.3)_0%,rgba(244,63,94,0.15)_50%,transparent_70%)]",
                                        isEmerald && "bg-[radial-gradient(circle,rgba(16,185,129,0.3)_0%,rgba(20,184,166,0.15)_50%,transparent_70%)]",
                                        isPurple && "bg-[radial-gradient(circle,rgba(168,85,247,0.3)_0%,rgba(236,72,153,0.15)_50%,transparent_70%)]"
                                    )}
                                />

                                {/* SVG Concentric Arc & Geometry Pattern Background */}
                                <div className="absolute inset-0 opacity-15 dark:opacity-25 pointer-events-none group-hover:opacity-35 transition-opacity duration-500">
                                    <svg className="w-full h-full" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="260" cy="50" r="100" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" className="text-neutral-400 dark:text-white/30" />
                                        <circle cx="260" cy="50" r="60" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500 dark:text-white/40" />
                                        <path d="M-10 160 Q 80 120, 180 170 T 320 140" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-neutral-400 dark:text-white/20" />
                                    </svg>
                                </div>

                                {/* Card Header */}
                                <CardHeader className="relative z-10 pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <Badge
                                                variant="outline"
                                                className="uppercase tracking-widest text-[9px] font-bold border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md px-2 py-0.5"
                                            >
                                                {task.purpose || "General"}
                                            </Badge>
                                            <CardTitle className="text-base font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                                                {task.name}
                                            </CardTitle>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 rounded-xl bg-white dark:bg-[#0c0c0e] border-neutral-200 dark:border-white/10 text-xs">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/tasks/${task.id}`} className="cursor-pointer">
                                                        <Eye className="mr-2 h-3.5 w-3.5" />
                                                        View Task
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-neutral-100 dark:bg-white/10" />
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteTarget(task)}
                                                    className="text-red-600 dark:text-red-400 focus:text-red-600 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                    Delete Task
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {task.description && (
                                        <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                                            {task.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>

                                {/* Card Content - Metrics & Segmented Progress Bar */}
                                <CardContent className="relative z-10 space-y-4 py-2">
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 bg-neutral-100/60 dark:bg-white/5 p-2 rounded-xl">
                                            <Calendar className="h-3.5 w-3.5 text-amber-500" />
                                            <span className="truncate">{formatDate(task.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 bg-neutral-100/60 dark:bg-white/5 p-2 rounded-xl">
                                            <Users className="h-3.5 w-3.5 text-cyan-500" />
                                            <span>{task.totalMembers || 0} Members</span>
                                        </div>
                                    </div>

                                    {/* Multi-segment Pill Progress Indicator */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px] font-semibold">
                                            <span className="text-neutral-500 dark:text-neutral-400">Yield Progress</span>
                                            <span className="text-amber-600 dark:text-amber-400 tabular-nums">{completionRate}%</span>
                                        </div>

                                        <div className="flex items-center gap-1 w-full">
                                            {Array.from({ length: 16 }).map((_, i) => {
                                                const filled = i < Math.round((completionRate / 100) * 16);
                                                return (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "h-2.5 flex-1 rounded-full transition-all duration-300",
                                                            filled
                                                                ? "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                                                                : "bg-neutral-200 dark:bg-neutral-800 opacity-40 scale-90"
                                                        )}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>

                                {/* Card Footer Actions */}
                                <CardFooter className="relative z-10 pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                        {completionRate >= 100 ? (
                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                <Clock className="h-3.5 w-3.5" />
                                                In Progress
                                            </span>
                                        )}
                                    </div>

                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-full text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-white/10 group/btn"
                                    >
                                        <Link href={`/dashboard/tasks/${task.id}`}>
                                            <span>Open</span>
                                            <ArrowUpRight className="ml-1 h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Confirmation Alert Dialog for Delete */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] text-neutral-900 dark:text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                            This action will permanently remove{" "}
                            <strong className="text-neutral-900 dark:text-white">{deleteTarget?.name}</strong>{" "}
                            and all associated records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isPending}
                            className="rounded-full border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 text-xs text-neutral-800 dark:text-white"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="rounded-full bg-red-600 text-white hover:bg-red-700 text-xs font-semibold"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
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