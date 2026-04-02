// components/dashboard/workflow/manage-members-drawer.tsx
"use client";

import { useState, useMemo, useTransition } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
    Search,
    Loader2,
    UserPlus,
    UserMinus,
    Users,
    Filter,
    X,
    CheckCircle2,
} from "lucide-react";
import { useMembersQuery } from "@/queries/member-queries";
import { useDebounce } from "@/hooks/use-debounce";
import { addWorkflowMembers, removeWorkflowMembers } from "@/actions/workflow";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { WorkflowMember } from "@/lib/types/workflow";

const GROUP_OPTIONS = [
    { value: "all", label: "All Groups" },
    { value: "youth", label: "Youth" },
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
];

interface ManageMembersDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workflowId: string;
    currentMembers: WorkflowMember[];
    onMembersChanged: () => void;
}

export function ManageMembersDrawer({
    open,
    onOpenChange,
    workflowId,
    currentMembers,
    onMembersChanged,
}: ManageMembersDrawerProps) {
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<"add" | "remove">("add");

    // Add tab state
    const [addSearch, setAddSearch] = useState("");
    const [addGroupFilter, setAddGroupFilter] = useState("all");
    const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
    const debouncedAddSearch = useDebounce(addSearch, 300);

    // Remove tab state
    const [removeSearch, setRemoveSearch] = useState("");
    const [removeGroupFilter, setRemoveGroupFilter] = useState("all");
    const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
    const [confirmRemove, setConfirmRemove] = useState(false);

    const currentMemberIds = useMemo(
        () => new Set(currentMembers.map((m) => m.memberId)),
        [currentMembers]
    );

    // Fetch all members for the "Add" tab
    const { data: allMembersData, isLoading: loadingMembers } = useMembersQuery({
        page: 1,
        pageSize: 500,
        search: debouncedAddSearch,
    });

    // Members available to add (not already in workflow)
    const availableMembers = useMemo(() => {
        const members = (allMembersData?.data ?? []).filter(
            (m) => !currentMemberIds.has(m.id)
        );
        if (addGroupFilter === "all") return members;
        return members.filter(
            (m) => m.memberGroup?.toLowerCase() === addGroupFilter
        );
    }, [allMembersData?.data, currentMemberIds, addGroupFilter]);

    // Current members filtered for the "Remove" tab
    const filteredCurrentMembers = useMemo(() => {
        let members = currentMembers;
        if (removeSearch.trim()) {
            const q = removeSearch.toLowerCase();
            members = members.filter(
                (m) =>
                    m.firstName.toLowerCase().includes(q) ||
                    m.lastName.toLowerCase().includes(q) ||
                    m.membershipId?.toLowerCase().includes(q)
            );
        }
        if (removeGroupFilter !== "all") {
            members = members.filter(
                (m) => m.memberGroup?.toLowerCase() === removeGroupFilter
            );
        }
        return members;
    }, [currentMembers, removeSearch, removeGroupFilter]);

    function toggleAddMember(id: string) {
        setSelectedToAdd((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
        );
    }

    function toggleRemoveMember(id: string) {
        setSelectedToRemove((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
        );
    }

    function selectAllAvailable() {
        setSelectedToAdd(availableMembers.map((m) => m.id));
    }

    function selectAllCurrent() {
        setSelectedToRemove(filteredCurrentMembers.map((m) => m.memberId));
    }

    async function handleAddMembers() {
        if (selectedToAdd.length === 0) return;

        startTransition(async () => {
            try {
                const result = await addWorkflowMembers(workflowId, selectedToAdd);
                toast.success(`${result.added} member(s) added to workflow`);
                setSelectedToAdd([]);
                onMembersChanged();
            } catch (error: any) {
                toast.error("Failed to add members", { description: error.message });
            }
        });
    }

    async function handleRemoveMembers() {
        if (selectedToRemove.length === 0) return;

        startTransition(async () => {
            try {
                const result = await removeWorkflowMembers(workflowId, selectedToRemove);
                toast.success(`${result.removed} member(s) removed from workflow`);
                setSelectedToRemove([]);
                setConfirmRemove(false);
                onMembersChanged();
            } catch (error: any) {
                toast.error("Failed to remove members", { description: error.message });
            }
        });
    }

    function handleClose() {
        if (!isPending) {
            setSelectedToAdd([]);
            setSelectedToRemove([]);
            setAddSearch("");
            setRemoveSearch("");
            setAddGroupFilter("all");
            setRemoveGroupFilter("all");
            onOpenChange(false);
        }
    }

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col gap-0">
                    <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-muted/30">
                        <SheetHeader className="text-left">
                            <SheetTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Manage Members
                            </SheetTitle>
                            <SheetDescription>
                                Add or remove members from this workflow. Currently {currentMembers.length} member(s).
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "add" | "remove")} className="flex-1 flex flex-col min-h-0">
                        <div className="px-6 pt-3">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="add" className="gap-1.5 text-xs">
                                    <UserPlus className="h-3.5 w-3.5" />
                                    Add Members
                                </TabsTrigger>
                                <TabsTrigger value="remove" className="gap-1.5 text-xs">
                                    <UserMinus className="h-3.5 w-3.5" />
                                    Remove Members
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* ── ADD TAB ── */}
                        <TabsContent value="add" className="flex-1 flex flex-col min-h-0 mt-0">
                            <div className="px-6 py-3 space-y-2 border-b">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search members..."
                                            value={addSearch}
                                            onChange={(e) => setAddSearch(e.target.value)}
                                            className="pl-9 h-9 text-sm"
                                        />
                                    </div>
                                    <Select value={addGroupFilter} onValueChange={setAddGroupFilter}>
                                        <SelectTrigger className="w-[130px] h-9 text-xs">
                                            <Filter className="h-3 w-3 mr-1.5" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GROUP_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-xs">
                                        {availableMembers.length} available
                                    </Badge>
                                    <div className="flex gap-2">
                                        {availableMembers.length > 0 && (
                                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllAvailable}>
                                                Select all
                                            </Button>
                                        )}
                                        {selectedToAdd.length > 0 && (
                                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedToAdd([])}>
                                                Clear ({selectedToAdd.length})
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                {loadingMembers ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : availableMembers.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-12 text-center px-6">
                                        <Users className="h-8 w-8 text-muted-foreground/30" />
                                        <p className="text-sm text-muted-foreground">No members available to add.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {availableMembers.map((member) => {
                                            const isSelected = selectedToAdd.includes(member.id);
                                            const initials = (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");
                                            return (
                                                <div
                                                    key={member.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => toggleAddMember(member.id)}
                                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleAddMember(member.id); } }}
                                                    className={cn(
                                                        "flex items-center gap-3 px-6 py-2.5 cursor-pointer transition-colors",
                                                        "hover:bg-muted/50",
                                                        isSelected && "bg-primary/5"
                                                    )}
                                                >
                                                    <Checkbox checked={isSelected} className="shrink-0" />
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
                                                        <p className="text-[10px] text-muted-foreground font-mono">
                                                            {member.membershipId ?? "No ID"}
                                                            {member.memberGroup && ` · ${member.memberGroup.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>

                            {selectedToAdd.length > 0 && (
                                <div className="shrink-0 px-6 py-3 border-t bg-muted/20">
                                    <Button onClick={handleAddMembers} disabled={isPending} className="w-full">
                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                        Add {selectedToAdd.length} Member(s)
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* ── REMOVE TAB ── */}
                        <TabsContent value="remove" className="flex-1 flex flex-col min-h-0 mt-0">
                            <div className="px-6 py-3 space-y-2 border-b">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search current members..."
                                            value={removeSearch}
                                            onChange={(e) => setRemoveSearch(e.target.value)}
                                            className="pl-9 h-9 text-sm"
                                        />
                                    </div>
                                    <Select value={removeGroupFilter} onValueChange={setRemoveGroupFilter}>
                                        <SelectTrigger className="w-[130px] h-9 text-xs">
                                            <Filter className="h-3 w-3 mr-1.5" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GROUP_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-xs">
                                        {filteredCurrentMembers.length} member(s)
                                    </Badge>
                                    <div className="flex gap-2">
                                        {filteredCurrentMembers.length > 0 && (
                                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllCurrent}>
                                                Select all
                                            </Button>
                                        )}
                                        {selectedToRemove.length > 0 && (
                                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedToRemove([])}>
                                                Clear ({selectedToRemove.length})
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                {filteredCurrentMembers.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-12 text-center px-6">
                                        <Users className="h-8 w-8 text-muted-foreground/30" />
                                        <p className="text-sm text-muted-foreground">No members match your search.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredCurrentMembers.map((member) => {
                                            const isSelected = selectedToRemove.includes(member.memberId);
                                            const initials = (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");
                                            return (
                                                <div
                                                    key={member.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => toggleRemoveMember(member.memberId)}
                                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRemoveMember(member.memberId); } }}
                                                    className={cn(
                                                        "flex items-center gap-3 px-6 py-2.5 cursor-pointer transition-colors",
                                                        "hover:bg-muted/50",
                                                        isSelected && "bg-destructive/5"
                                                    )}
                                                >
                                                    <Checkbox checked={isSelected} className="shrink-0" />
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
                                                        <p className="text-[10px] text-muted-foreground font-mono">
                                                            {member.membershipId ?? "No ID"}
                                                            {member.memberGroup && ` · ${member.memberGroup.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>

                            {selectedToRemove.length > 0 && (
                                <div className="shrink-0 px-6 py-3 border-t bg-muted/20">
                                    <Button
                                        variant="destructive"
                                        onClick={() => setConfirmRemove(true)}
                                        disabled={isPending}
                                        className="w-full"
                                    >
                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserMinus className="mr-2 h-4 w-4" />}
                                        Remove {selectedToRemove.length} Member(s)
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </SheetContent>
            </Sheet>

            <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove {selectedToRemove.length} member(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove them from the workflow and delete all their entries. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMembers}
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