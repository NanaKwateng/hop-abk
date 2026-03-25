// components/dashboard/workflow/workflows-list.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
    Clock,
    Users,
    CreditCard,
    FileText,
    MoreHorizontal,
    Eye,
    Trash2,
    AlertCircle,
    Loader2,
    FolderOpen,
    Shield,
    Activity,
} from "lucide-react";
import { format, isBefore, isAfter } from "date-fns";
import { deleteWorkflow } from "@/actions/workflow";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WorkflowCreateTrigger } from "./workflow-create-trigger";
import type { Workflow } from "@/lib/types/workflow";

interface WorkflowsListProps {
    initialWorkflows: Workflow[];
}

const TYPE_CONFIG = {
    payments: {
        icon: CreditCard,
        label: "💳 Payments",
        iconColor: "text-[#3B82F6]", // Blue from "relevant lists" card
        bgColor: "bg-[#E0E7FF]",
        cardBg: "bg-[#6366F1]", // Indigo/Blue card
        textColor: "text-white",
        descColor: "text-indigo-100",
    },
    records: {
        icon: FileText,
        label: "📄 Records",
        iconColor: "text-[#D97706]", // Amber from "Auto-prioritize" card
        bgColor: "bg-[#FEF3C7]",
        cardBg: "bg-[#FBBF24]", // Yellow card
        textColor: "text-[#451a03]",
        descColor: "text-[#92400e]",
    },
    roles: {
        icon: Shield,
        label: "🛡️ Roles",
        iconColor: "text-[#7C3AED]", // Purple from "categories" card
        bgColor: "bg-[#EDE9FE]",
        cardBg: "bg-[#A78BFA]", // Purple card
        textColor: "text-white",
        descColor: "text-purple-100",
    },
    monitor: {
        icon: Activity,
        label: "📊 Monitor",
        iconColor: "text-[#EA580C]", // Coral from "voice memos" card
        bgColor: "bg-[#FFEDD5]",
        cardBg: "bg-[#FB7185]", // Coral/Red card
        textColor: "text-white",
        descColor: "text-rose-100",
    },
} as const;

export function WorkflowsList({ initialWorkflows }: WorkflowsListProps) {
    const router = useRouter();
    const [workflows, setWorkflows] = useState(initialWorkflows);
    const [deleteTarget, setDeleteTarget] = useState<Workflow | null>(null);
    const [isPending, startTransition] = useTransition();

    const now = new Date();
    const expiredCount = workflows.filter((wf) =>
        isBefore(new Date(wf.endDate), now)
    ).length;

    function getStatus(wf: Workflow) {
        const start = new Date(wf.startDate);
        const end = new Date(wf.endDate);
        if (isBefore(end, now)) return "expired" as const;
        if (isAfter(start, now)) return "upcoming" as const;
        return "active" as const;
    }

    async function handleDelete() {
        if (!deleteTarget) return;

        startTransition(async () => {
            try {
                await deleteWorkflow(deleteTarget.id);
                setWorkflows((prev) =>
                    prev.filter((w) => w.id !== deleteTarget.id)
                );
                toast.success("Workflow deleted");
                router.refresh();
            } catch (error: any) {
                toast.error("Failed to delete", { description: error.message });
            } finally {
                setDeleteTarget(null);
            }
        });
    }

    function navigateToWorkflow(wf: Workflow) {
        router.push(`/workflow/${wf.slug}`);
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage bulk member tasks, payments, and records.
                        {workflows.length > 0 && (
                            <span className="ml-1">
                                · {workflows.length} workflow
                                {workflows.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </p>
                </div>
                <WorkflowCreateTrigger />
            </div>

            {/* Expired alert */}
            {expiredCount > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action Needed</AlertTitle>
                    <AlertDescription>
                        {expiredCount} workflow(s) have passed their end date.
                    </AlertDescription>
                </Alert>
            )}

            {/* Grid */}
            {workflows.length === 0 ? (
                <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center gap-4 py-20">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                            <FolderOpen className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-medium">No workflows yet</p>
                            <p className="text-sm text-muted-foreground">
                                Create your first workflow to start processing members.
                            </p>
                        </div>
                        <WorkflowCreateTrigger />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workflows.map((wf) => {
                        const status = getStatus(wf);
                        const config = TYPE_CONFIG[wf.type] ?? TYPE_CONFIG.records;
                        const TypeIcon = config.icon;

                        return (
                            <Card
                                key={wf.id}
                                className={cn(
                                    "group flex flex-col transition-all duration-300 cursor-pointer border-none rounded-[2rem] shadow-sm",
                                    "hover:shadow-xl hover:-translate-y-1",
                                    config.cardBg,
                                    status === "expired" && "ring-2 ring-destructive/50"
                                )}
                                onClick={() => navigateToWorkflow(wf)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={cn(
                                                "flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner bg-white/90"
                                            )}
                                        >
                                            <TypeIcon
                                                className={cn("h-6 w-6", config.iconColor)}
                                            />
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-inherit opacity-60 hover:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => navigateToWorkflow(wf)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Open Workspace
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeleteTarget(wf)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <CardTitle className={cn("text-xl mt-4 font-bold tracking-tight", config.textColor)}>
                                        {wf.name}
                                    </CardTitle>

                                    <CardDescription className={cn("flex items-center gap-1.5 font-medium opacity-90", config.descColor)}>
                                        <Clock className="h-3.5 w-3.5" />
                                        {format(new Date(wf.startDate), "MMM d")} –{" "}
                                        {format(new Date(wf.endDate), "MMM d, yyyy")}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 pb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-md font-medium">
                                        {config.label}
                                    </Badge>
                                </CardContent>

                                <CardFooter className="pt-3 flex items-center justify-between bg-black/5 rounded-b-[2rem]">
                                    <span className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", config.descColor)}>
                                        <Users className="h-3.5 w-3.5" />
                                        {wf.memberCount} member
                                        {wf.memberCount !== 1 ? "s" : ""}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] uppercase font-bold border-none",
                                            status === "active" ? "bg-green-400 text-green-950" :
                                                status === "expired" ? "bg-red-400 text-red-950" : "bg-white/50 text-slate-900"
                                        )}
                                    >
                                        {status}
                                    </Badge>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Delete dialog */}
            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this workflow?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            <strong>{deleteTarget?.name}</strong> and all its entries
                            and enrolled members. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                            Cancel
                        </AlertDialogCancel>
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