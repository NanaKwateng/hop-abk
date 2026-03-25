// components/dashboard/workflow/member-selection-table.tsx
"use client";

import { useState, useMemo } from "react";
import { useMembersQuery } from "@/queries/member-queries";
import { useDebounce } from "@/hooks/use-debounce";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    Loader2,
    CheckSquare,
    Square,
    X,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_MEMBERS = 150;

interface MemberSelectionTableProps {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export function MemberSelectionTable({
    selectedIds,
    onSelectionChange,
}: MemberSelectionTableProps) {
    const [search, setSearch] = useState("");
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    const { data, isLoading } = useMembersQuery({
        page: 1,
        pageSize: 500,
        search: debouncedSearch,
    });

    const allMembers = data?.data ?? [];

    const displayMembers = useMemo(() => {
        if (showSelectedOnly) {
            return allMembers.filter((m) => selectedIds.includes(m.id));
        }
        return allMembers;
    }, [allMembers, selectedIds, showSelectedOnly]);

    const selectedSet = useMemo(
        () => new Set(selectedIds),
        [selectedIds]
    );

    function toggleMember(id: string) {
        if (selectedSet.has(id)) {
            onSelectionChange(selectedIds.filter((v) => v !== id));
        } else {
            if (selectedIds.length >= MAX_MEMBERS) {
                toast.error(`Maximum ${MAX_MEMBERS} members allowed.`);
                return;
            }
            onSelectionChange([...selectedIds, id]);
        }
    }

    function selectAllVisible() {
        const currentIds = new Set(selectedIds);
        let added = 0;
        for (const member of displayMembers) {
            if (currentIds.size >= MAX_MEMBERS) {
                toast.warning(`Limit reached. ${added} member(s) added.`);
                break;
            }
            if (!currentIds.has(member.id)) {
                currentIds.add(member.id);
                added++;
            }
        }
        onSelectionChange(Array.from(currentIds));
        if (added > 0) toast.success(`${added} member(s) selected`);
    }

    function deselectAll() {
        onSelectionChange([]);
    }

    function removeMember(id: string) {
        onSelectionChange(selectedIds.filter((v) => v !== id));
    }

    const isAtLimit = selectedIds.length >= MAX_MEMBERS;

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 p-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or ID..."
                            className="pl-9 h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs shrink-0"
                        onClick={selectAllVisible}
                        disabled={
                            isAtLimit &&
                            displayMembers.every((m) => selectedSet.has(m.id))
                        }
                    >
                        <CheckSquare className="mr-1.5 h-3.5 w-3.5" />
                        All
                    </Button>

                    {selectedIds.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs shrink-0"
                            onClick={deselectAll}
                        >
                            <Square className="mr-1.5 h-3.5 w-3.5" />
                            Clear
                        </Button>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={isAtLimit ? "destructive" : "default"}
                            className="tabular-nums"
                        >
                            <Users className="mr-1 h-3 w-3" />
                            {selectedIds.length} / {MAX_MEMBERS}
                        </Badge>
                        {isAtLimit && (
                            <span className="text-[11px] text-destructive font-medium">
                                Limit reached
                            </span>
                        )}
                    </div>

                    {selectedIds.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-7 text-xs",
                                showSelectedOnly && "bg-primary/10 text-primary"
                            )}
                            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                        >
                            {showSelectedOnly
                                ? "Show all"
                                : `Selected only (${selectedIds.length})`}
                        </Button>
                    )}
                </div>
            </div>

            {/* Member list */}
            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Loading members...
                        </p>
                    </div>
                ) : displayMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12">
                        <Users className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            {showSelectedOnly
                                ? "No members selected yet."
                                : "No members found."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {displayMembers.map((member) => {
                            const isSelected = selectedSet.has(member.id);
                            const initials =
                                (member.firstName?.[0] ?? "") +
                                (member.lastName?.[0] ?? "");

                            return (
                                <div
                                    key={member.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleMember(member.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleMember(member.id);
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors outline-none",
                                        "hover:bg-muted/50 focus-visible:bg-muted/50",
                                        isSelected && "bg-primary/5"
                                    )}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleMember(member.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="shrink-0"
                                    />

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
                                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                                            {member.membershipId ?? "No ID"}
                                            {member.memberGroup && (
                                                <>
                                                    {" · "}
                                                    {member.memberGroup
                                                        .replace(/_/g, " ")
                                                        .replace(/\b\w/g, (c) =>
                                                            c.toUpperCase()
                                                        )}
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {isSelected && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeMember(member.id);
                                            }}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}