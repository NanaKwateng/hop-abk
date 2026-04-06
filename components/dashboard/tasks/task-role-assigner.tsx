// components/dashboard/tasks/task-role-assigner.tsx
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
    Shield,
    X,
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

interface TaskRoleAssignerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskId: string;
    member: TaskMember;
    onActivityChange: (activities: TaskActivity[]) => void;
}

export function TaskRoleAssigner({
    open,
    onOpenChange,
    taskId,
    member,
    onActivityChange,
}: TaskRoleAssignerProps) {
    const [isSaving, startSaveTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [activities, setActivities] = useState<TaskActivity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState<TaskActivity | null>(null);
    const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);

    const [roleTitle, setRoleTitle] = useState("");
    const [roleDescription, setRoleDescription] = useState("");

    const initials = (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

    useEffect(() => {
        if (!open) return;
        let cancelled = false;

        setIsLoading(true);
        getMemberTaskActivities(taskId, member.memberId)
            .then((data) => {
                if (!cancelled) {
                    const roleActivities = data.filter((a) => a.activityType === "role");
                    setActivities(roleActivities);
                    onActivityChange(roleActivities);
                }
            })
            .catch(() => {
                if (!cancelled) toast.error("Failed to load roles");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, member.memberId, taskId]);

    function resetForm() {
        setRoleTitle("");
        setRoleDescription("");
        setEditingActivity(null);
        setShowForm(false);
    }

    function startEdit(activity: TaskActivity) {
        setEditingActivity(activity);
        setRoleTitle(activity.roleTitle ?? activity.title);
        setRoleDescription(activity.roleDescription ?? activity.description ?? "");
        setShowForm(true);
    }

    async function handleSave() {
        if (!roleTitle.trim()) {
            toast.error("Role title is required");
            return;
        }

        startSaveTransition(async () => {
            try {
                if (editingActivity) {
                    const updated = await updateTaskActivity({
                        id: editingActivity.id,
                        taskId,
                        title: roleTitle.trim(),
                        roleTitle: roleTitle.trim(),
                        roleDescription: roleDescription.trim() || undefined,
                        description: roleDescription.trim() || undefined,
                    });

                    const newActivities = activities.map((a) =>
                        a.id === updated.id ? updated : a
                    );
                    setActivities(newActivities);
                    onActivityChange(newActivities);
                    toast.success("Role updated");
                } else {
                    const activity = await createTaskActivity({
                        taskId,
                        memberId: member.memberId,
                        activityType: "role",
                        title: roleTitle.trim(),
                        description: roleDescription.trim() || undefined,
                        roleTitle: roleTitle.trim(),
                        roleDescription: roleDescription.trim() || undefined,
                    });

                    const newActivities = [activity, ...activities];
                    setActivities(newActivities);
                    onActivityChange(newActivities);
                    toast.success("Role assigned", {
                        description: `${member.firstName} ${member.lastName} — ${activity.roleTitle}`,
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
                toast.success("Role assignment deleted");
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
                                <Shield className="h-5 w-5 text-purple-600" />
                                Role Assignment
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
                                <span className="text-muted-foreground">Roles assigned:</span>
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
                                    Assign Role
                                </Button>
                            )}

                            {showForm && (
                                <div className="rounded-lg border bg-card p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">
                                            {editingActivity ? "Edit Role" : "New Role"}
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
                                        <Label htmlFor="role-title" className="text-xs">
                                            Role Title *
                                        </Label>
                                        <Input
                                            id="role-title"
                                            placeholder="e.g., Choir Leader"
                                            value={roleTitle}
                                            onChange={(e) => setRoleTitle(e.target.value)}
                                            className="h-9"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role-desc" className="text-xs">
                                            Role Description
                                        </Label>
                                        <Textarea
                                            id="role-desc"
                                            placeholder="Describe the responsibilities..."
                                            rows={4}
                                            value={roleDescription}
                                            onChange={(e) => setRoleDescription(e.target.value)}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !roleTitle.trim()}
                                            size="sm"
                                            className="flex-1"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            {editingActivity ? "Update" : "Assign"}
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
                                Assigned Roles
                            </h4>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <Shield className="h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">No roles assigned yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="rounded-lg border bg-card p-3 space-y-2"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                                        <p className="text-sm font-medium truncate">
                                                            {activity.roleTitle ?? activity.title}
                                                        </p>
                                                    </div>
                                                    {(activity.roleDescription ?? activity.description) && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3 pl-5">
                                                            {activity.roleDescription ?? activity.description}
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
                                            <div className="text-[10px] text-muted-foreground pl-5">
                                                Assigned {format(new Date(activity.createdAt), "MMM d, yyyy")}
                                            </div>
                                        </div>
                                    ))}
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
                        <AlertDialogTitle>Remove role?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the role assignment. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteActivity}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Removing…" : "Remove"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}