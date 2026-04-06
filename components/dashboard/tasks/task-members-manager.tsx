// components/dashboard/tasks/task-members-manager.tsx
"use client";

import { useState, useTransition } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Loader2, UserPlus, UserMinus, Users, X } from "lucide-react";
import { addTaskMembers, removeTaskMembers } from "@/actions/task";
import { toast } from "sonner";
import { TaskMemberSelection } from "./task-member-selection";
import type { TaskMember } from "@/lib/types/task";

interface TaskMembersManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskId: string;
    currentMembers: TaskMember[];
    onMembersChanged: () => void;
}

export function TaskMembersManager({
    open,
    onOpenChange,
    taskId,
    currentMembers,
    onMembersChanged,
}: TaskMembersManagerProps) {
    const [activeTab, setActiveTab] = useState<"add" | "remove">("add");
    const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
    const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
    const [isAdding, startAddTransition] = useTransition();
    const [isRemoving, startRemoveTransition] = useTransition();
    const [confirmRemove, setConfirmRemove] = useState(false);

    const currentMemberIds = currentMembers.map((m) => m.memberId);

    async function handleAddMembers() {
        if (selectedToAdd.length === 0) {
            toast.error("Select at least one member to add");
            return;
        }

        startAddTransition(async () => {
            try {
                const result = await addTaskMembers(taskId, selectedToAdd);
                toast.success(`${result.added} member(s) added to task`);
                setSelectedToAdd([]);
                onMembersChanged();
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : "Failed to add members";
                toast.error(message);
            }
        });
    }

    async function handleRemoveMembers() {
        if (selectedToRemove.length === 0) {
            toast.error("Select at least one member to remove");
            return;
        }

        startRemoveTransition(async () => {
            try {
                const result = await removeTaskMembers(taskId, selectedToRemove);
                toast.success(`${result.removed} member(s) removed from task`);
                setSelectedToRemove([]);
                setConfirmRemove(false);
                onMembersChanged();
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : "Failed to remove members";
                toast.error(message);
            }
        });
    }

    function handleClose() {
        if (!isAdding && !isRemoving) {
            setSelectedToAdd([]);
            setSelectedToRemove([]);
            setActiveTab("add");
            onOpenChange(false);
        }
    }

    const isPending = isAdding || isRemoving;

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent side="right" className="w-full sm:max-w-2xl px-2 flex flex-col gap-0">
                    <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-muted/30">
                        <SheetHeader className="text-left">
                            <SheetTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Manage Members
                            </SheetTitle>
                            <SheetDescription>
                                Add or remove members from this task.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex items-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Current members:</span>
                                <Badge variant="secondary" className="text-xs">
                                    {currentMembers.length}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
                        <div className="px-6 pt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="add">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Members
                                </TabsTrigger>
                                <TabsTrigger value="remove">
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Remove Members
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="add" className="flex-1 mt-0 min-h-0">
                            <TaskMemberSelection
                                selectedIds={selectedToAdd}
                                onSelectionChange={setSelectedToAdd}
                            />
                        </TabsContent>

                        <TabsContent value="remove" className="flex-1 mt-0 min-h-0">
                            <ScrollArea className="h-full">
                                {currentMembers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-2 py-12">
                                        <Users className="h-8 w-8 text-muted-foreground/40" />
                                        <p className="text-sm text-muted-foreground">No members in this task.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {currentMembers.map((member) => {
                                            const isSelected = selectedToRemove.includes(member.memberId);
                                            const initials =
                                                (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

                                            return (
                                                <div
                                                    key={member.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedToRemove((prev) =>
                                                                prev.filter((id) => id !== member.memberId)
                                                            );
                                                        } else {
                                                            setSelectedToRemove((prev) => [...prev, member.memberId]);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            if (isSelected) {
                                                                setSelectedToRemove((prev) =>
                                                                    prev.filter((id) => id !== member.memberId)
                                                                );
                                                            } else {
                                                                setSelectedToRemove((prev) => [...prev, member.memberId]);
                                                            }
                                                        }
                                                    }}
                                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 ${isSelected ? "bg-destructive/5" : ""
                                                        }`}
                                                >
                                                    <Avatar className="h-8 w-8 shrink-0 border">
                                                        <AvatarImage src={member.avatarUrl || ""} />
                                                        <AvatarFallback className="text-[10px] font-medium">
                                                            {initials.toUpperCase() || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {member.firstName} {member.lastName}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                            <span className="font-mono">
                                                                {member.membershipId ?? "No ID"}
                                                            </span>
                                                            {member.memberGroup && (
                                                                <>
                                                                    <span>·</span>
                                                                    <Badge variant="outline" className="text-[9px] h-4 px-1">
                                                                        {member.memberGroup
                                                                            .replace(/_/g, " ")
                                                                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                                                                    </Badge>
                                                                </>
                                                            )}
                                                        </div>
                                                        {member.progress > 0 && (
                                                            <div className="mt-1.5">
                                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-0.5">
                                                                    <span>Progress: {member.progress}%</span>
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

                                                    {isSelected && (
                                                        <Badge variant="destructive" className="shrink-0">
                                                            Remove
                                                        </Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>

                    <div className="shrink-0 px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
                        <Button variant="outline" onClick={handleClose} disabled={isPending}>
                            Cancel
                        </Button>

                        {activeTab === "add" ? (
                            <Button
                                onClick={handleAddMembers}
                                disabled={isAdding || selectedToAdd.length === 0}
                            >
                                {isAdding ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <UserPlus className="mr-2 h-4 w-4" />
                                )}
                                Add {selectedToAdd.length > 0 && `(${selectedToAdd.length})`}
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={() => setConfirmRemove(true)}
                                disabled={isRemoving || selectedToRemove.length === 0}
                            >
                                {isRemoving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <UserMinus className="mr-2 h-4 w-4" />
                                )}
                                Remove {selectedToRemove.length > 0 && `(${selectedToRemove.length})`}
                            </Button>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove members from task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove <strong>{selectedToRemove.length}</strong> member(s) from
                            the task and delete all their associated activities. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMembers}
                            disabled={isRemoving}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isRemoving ? "Removing…" : "Remove Members"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}