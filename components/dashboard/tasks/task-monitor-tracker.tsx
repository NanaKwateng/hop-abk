// components/dashboard/tasks/task-monitor-tracker.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import {
    Loader2,
    Save,
    Plus,
    Trash2,
    Pencil,
    Activity,
    X,
    Clock,
} from "lucide-react";
import {
    createTaskActivity,
    updateTaskActivity,
    deleteTaskActivity,
    getMemberTaskActivities,
} from "@/actions/task";
import { toast } from "sonner";
import { format } from "date-fns";
import type { TaskMember, TaskActivity } from "@/lib/types/task";

const MONITOR_STATUSES = [
    { value: "on_track", label: "On Track", color: "bg-green-500" },
    { value: "needs_attention", label: "Needs Attention", color: "bg-yellow-500" },
    { value: "critical", label: "Critical", color: "bg-red-500" },
    { value: "completed", label: "Completed", color: "bg-blue-500" },
];

interface TaskMonitorTrackerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskId: string;
    member: TaskMember;
    onActivityChange: (activities: TaskActivity[]) => void;
}

export function TaskMonitorTracker({
    open,
    onOpenChange,
    taskId,
    member,
    onActivityChange,
}: TaskMonitorTrackerProps) {
    const [isSaving, startSaveTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [activities, setActivities] = useState<TaskActivity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState<TaskActivity | null>(null);
    const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [monitorNote, setMonitorNote] = useState("");
    const [monitorStatus, setMonitorStatus] = useState("");

    const initials = (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

    useEffect(() => {
        if (!open) return;
        let cancelled = false;

        setIsLoading(true);
        getMemberTaskActivities(taskId, member.memberId)
            .then((data) => {
                if (!cancelled) {
                    const monitorActivities = data.filter((a) => a.activityType === "monitor");
                    setActivities(monitorActivities);
                    onActivityChange(monitorActivities);
                }
            })
            .catch(() => {
                if (!cancelled) toast.error("Failed to load monitoring data");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, member.memberId, taskId]);

    function resetForm() {
        setTitle("");
        setMonitorNote("");
        setMonitorStatus("");
        setEditingActivity(null);
        setShowForm(false);
    }

    function startEdit(activity: TaskActivity) {
        setEditingActivity(activity);
        setTitle(activity.title);
        setMonitorNote(activity.monitorNote ?? "");
        setMonitorStatus(activity.monitorStatus ?? "");
        setShowForm(true);
    }

    async function handleSave() {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        startSaveTransition(async () => {
            try {
                if (editingActivity) {
                    const updated = await updateTaskActivity({
                        id: editingActivity.id,
                        taskId,
                        title: title.trim(),
                        monitorNote: monitorNote.trim() || undefined,
                        monitorStatus: monitorStatus || undefined,
                    });

                    const newActivities = activities.map((a) =>
                        a.id === updated.id ? updated : a
                    );
                    setActivities(newActivities);
                    onActivityChange(newActivities);
                    toast.success("Monitor entry updated");
                } else {
                    const activity = await createTaskActivity({
                        taskId,
                        memberId: member.memberId,
                        activityType: "monitor",
                        title: title.trim(),
                        monitorNote: monitorNote.trim() || undefined,
                        monitorStatus: monitorStatus || undefined,
                    });

                    const newActivities = [activity, ...activities];
                    setActivities(newActivities);
                    onActivityChange(newActivities);
                    toast.success("Monitor entry created", {
                        description: `${member.firstName} ${member.lastName} — ${activity.title}`,
                    });
                }

                resetForm();
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error("Failed to save", { description: message });
            }
        });
    }

    async function handleDeleteActivity() {
        if (!deleteActivityId) return;

        startDeleteTransition(async () => {
            try {
                await deleteTaskActivity(deleteActivityId, taskId, member.memberId);

                const newActivities = activities.filter((a) => a.id !== deleteActivityId);
                setActivities(newActivities);
                onActivityChange(newActivities);
                toast.success("Monitor entry deleted");
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error("Failed to delete", { description: message });
            } finally {
                setDeleteActivityId(null);
            }
        });
    }

    function handleClose() {
        if (!isSaving && !isDeleting) {
            resetForm();
            onOpenChange(false);
        }
    }

    const isPending = isSaving || isDeleting;

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col gap-0">
                    <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-muted/30">
                        <SheetHeader className="text-left">
                            <SheetTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-orange-600" />
                                Activity Monitoring
                            </SheetTitle>
                            <SheetDescription asChild>
                                <div className="flex items-center gap-3 mt-2">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={member.avatarUrl || ""} />
                                        <AvatarFallback className="text-xs font-medium">
                                            {initials.toUpperCase() || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {member.firstName} {member.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {member.membershipId ?? "No ID"}
                                        </p>
                                    </div>
                                </div>
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex items-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Checkpoints:</span>
                                <Badge variant="secondary" className="text-xs">
                                    {activities.length}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-6 py-4 space-y-4">
                            {!showForm && (
                                <Button
                                    onClick={() => {
                                        resetForm();
                                        setShowForm(true);
                                    }}
                                    className="w-full"
                                    variant="outline"
                                    disabled={isPending}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Checkpoint
                                </Button>
                            )}

                            {showForm && (
                                <div className="rounded-lg border bg-card p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">
                                            {editingActivity ? "Edit Checkpoint" : "New Checkpoint"}
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={resetForm}
                                            disabled={isSaving}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="monitor-title" className="text-xs">
                                            Title *
                                        </Label>
                                        <Input
                                            id="monitor-title"
                                            placeholder="e.g., Weekly Activity Check"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-9"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="monitor-status" className="text-xs">
                                            Status
                                        </Label>
                                        <Select value={monitorStatus} onValueChange={setMonitorStatus}>
                                            <SelectTrigger id="monitor-status" className="h-9">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MONITOR_STATUSES.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-2 w-2 rounded-full ${status.color}`} />
                                                            {status.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="monitor-note" className="text-xs">
                                            Notes
                                        </Label>
                                        <Textarea
                                            id="monitor-note"
                                            placeholder="Add observations and notes..."
                                            rows={4}
                                            value={monitorNote}
                                            onChange={(e) => setMonitorNote(e.target.value)}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !title.trim()}
                                            size="sm"
                                            className="flex-1"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            {editingActivity ? "Update" : "Save"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetForm}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Separator />
                            <h4 className="text-sm font-semibold text-muted-foreground">
                                Activity Timeline
                            </h4>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <Activity className="h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        No checkpoints recorded yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                                    {activities.map((activity, index) => {
                                        const statusConfig = MONITOR_STATUSES.find(
                                            (s) => s.value === activity.monitorStatus
                                        );

                                        return (
                                            <div key={activity.id} className="relative pl-10">
                                                {/* Timeline dot */}
                                                <div
                                                    className={`absolute left-2.5 top-3 h-3 w-3 rounded-full border-2 border-background ${statusConfig?.color ?? "bg-muted"
                                                        }`}
                                                />

                                                <div className="rounded-lg border bg-card p-3 space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {activity.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {format(
                                                                        new Date(activity.createdAt),
                                                                        "MMM d, yyyy 'at' h:mm a"
                                                                    )}
                                                                </span>
                                                            </div>
                                                            {activity.monitorNote && (
                                                                <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded border line-clamp-3">
                                                                    {activity.monitorNote}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => startEdit(activity)}
                                                                disabled={isPending}
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                                onClick={() => setDeleteActivityId(activity.id)}
                                                                disabled={isPending}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {activity.monitorStatus && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] w-fit"
                                                        >
                                                            <div
                                                                className={`h-2 w-2 rounded-full mr-1 ${statusConfig?.color}`}
                                                            />
                                                            {statusConfig?.label ?? activity.monitorStatus}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <AlertDialog
                open={deleteActivityId !== null}
                onOpenChange={(open) => !open && setDeleteActivityId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete checkpoint?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this monitoring checkpoint. This cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteActivity}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}