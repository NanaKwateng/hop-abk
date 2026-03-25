// components/dashboard/workflow/role-entry-drawer.tsx
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
    Check,
} from "lucide-react";
import {
    createWorkflowEntry,
    updateWorkflowEntry,
    deleteWorkflowEntry,
    getMemberWorkflowEntries,
} from "@/actions/workflow";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type {
    WorkflowMember,
    WorkflowEntry,
} from "@/lib/types/workflow";

interface RoleEntryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workflowId: string;
    member: WorkflowMember;
    onEntryChange: (entries: WorkflowEntry[]) => void;
}

export function RoleEntryDrawer({
    open,
    onOpenChange,
    workflowId,
    member,
    onEntryChange,
}: RoleEntryDrawerProps) {
    const [isPending, startTransition] = useTransition();
    const [entries, setEntries] = useState<WorkflowEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingEntry, setEditingEntry] = useState<WorkflowEntry | null>(null);
    const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

    // Form state
    const [roleTitle, setRoleTitle] = useState("");
    const [roleDescription, setRoleDescription] = useState("");

    const initials =
        (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

    useEffect(() => {
        if (open && member) {
            setIsLoading(true);
            getMemberWorkflowEntries(workflowId, member.memberId)
                .then((data) => setEntries(data))
                .catch(() => toast.error("Failed to load entries"))
                .finally(() => setIsLoading(false));
        }
    }, [open, member, workflowId]);

    function resetForm() {
        setRoleTitle("");
        setRoleDescription("");
        setEditingEntry(null);
        setShowForm(false);
    }

    function startEdit(entry: WorkflowEntry) {
        setEditingEntry(entry);
        setRoleTitle(entry.roleTitle ?? entry.title);
        setRoleDescription(entry.roleDescription ?? entry.description ?? "");
        setShowForm(true);
    }

    async function handleSave() {
        if (!roleTitle.trim()) {
            toast.error("Role title is required");
            return;
        }

        startTransition(async () => {
            try {
                if (editingEntry) {
                    const updated = await updateWorkflowEntry({
                        id: editingEntry.id,
                        workflowId,
                        title: roleTitle.trim(),
                        roleTitle: roleTitle.trim(),
                        roleDescription: roleDescription.trim() || undefined,
                        description: roleDescription.trim() || undefined,
                    });

                    setEntries((prev) =>
                        prev.map((e) => (e.id === updated.id ? updated : e))
                    );
                    toast.success("Role updated");
                } else {
                    const entry = await createWorkflowEntry({
                        workflowId,
                        memberId: member.memberId,
                        title: roleTitle.trim(),
                        description: roleDescription.trim() || undefined,
                        roleTitle: roleTitle.trim(),
                        roleDescription: roleDescription.trim() || undefined,
                        entryType: "role",
                        status: "completed",
                    });

                    setEntries((prev) => [entry, ...prev]);
                    toast.success("Role assigned");
                }

                onEntryChange(entries);
                resetForm();
            } catch (error: any) {
                toast.error("Failed to save", { description: error.message });
            }
        });
    }

    async function handleDeleteEntry() {
        if (!deleteEntryId) return;

        startTransition(async () => {
            try {
                await deleteWorkflowEntry(deleteEntryId, workflowId);
                setEntries((prev) => prev.filter((e) => e.id !== deleteEntryId));
                onEntryChange(entries.filter((e) => e.id !== deleteEntryId));
                toast.success("Role assignment deleted");
            } catch (error: any) {
                toast.error("Failed to delete", { description: error.message });
            } finally {
                setDeleteEntryId(null);
            }
        });
    }

    function handleClose() {
        if (!isPending) {
            resetForm();
            onOpenChange(false);
        }
    }

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-lg p-0 flex flex-col gap-0"
                >
                    {/* Header */}
                    <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-muted/30">
                        <SheetHeader className="text-left">
                            <SheetTitle className="text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
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
                                    {entries.length}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
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
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Assign Role
                                </Button>
                            )}

                            {showForm && (
                                <div className="rounded-lg border bg-card p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">
                                            {editingEntry ? "Edit Role" : "New Role"}
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={resetForm}
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
                                            rows={3}
                                            value={roleDescription}
                                            onChange={(e) => setRoleDescription(e.target.value)}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isPending || !roleTitle.trim()}
                                            size="sm"
                                            className="flex-1"
                                        >
                                            {isPending ? (
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            {editingEntry ? "Update" : "Assign"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetForm}
                                            disabled={isPending}
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
                            ) : entries.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <Shield className="h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        No roles assigned yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {entries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="rounded-lg border bg-card p-3 space-y-2"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                        <p className="text-sm font-medium truncate">
                                                            {entry.roleTitle ?? entry.title}
                                                        </p>
                                                    </div>
                                                    {(entry.roleDescription ?? entry.description) && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 pl-5">
                                                            {entry.roleDescription ?? entry.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => startEdit(entry)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteEntryId(entry.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground pl-5">
                                                Assigned {format(new Date(entry.createdAt), "MMM d, yyyy")}
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
                open={deleteEntryId !== null}
                onOpenChange={(open) => !open && setDeleteEntryId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove role?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the role assignment. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteEntry}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Removing…" : "Remove"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}