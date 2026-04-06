// components/dashboard/tasks/task-member-selection.tsx
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Loader2,
    CheckSquare,
    Square,
    X,
    Users,
    Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TaskMemberSelectionProps {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

type GenderFilter = "all" | "male" | "female";
type GroupFilter = "all" | "men" | "women" | "youth";

export function TaskMemberSelection({
    selectedIds,
    onSelectionChange,
}: TaskMemberSelectionProps) {
    const [search, setSearch] = useState("");
    const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
    const [groupFilter, setGroupFilter] = useState<GroupFilter>("all");
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    const { data, isLoading } = useMembersQuery({
        page: 1,
        pageSize: 1000, // ✅ No limit - load all members
        search: debouncedSearch,
    });

    const allMembers = data?.data ?? [];

    // ✅ Advanced filtering by gender and group
    const displayMembers = useMemo(() => {
        let filtered = allMembers;

        // Filter by gender
        if (genderFilter !== "all") {
            filtered = filtered.filter((m) => m.gender?.toLowerCase() === genderFilter);
        }

        // Filter by group
        if (groupFilter !== "all") {
            filtered = filtered.filter((m) => {
                const memberGroup = m.memberGroup?.toLowerCase();
                return memberGroup === groupFilter;
            });
        }

        // Show only selected
        if (showSelectedOnly) {
            filtered = filtered.filter((m) => selectedIds.includes(m.id));
        }

        return filtered;
    }, [allMembers, genderFilter, groupFilter, showSelectedOnly, selectedIds]);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    function toggleMember(id: string) {
        if (selectedSet.has(id)) {
            onSelectionChange(selectedIds.filter((v) => v !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    }

    function selectAllVisible() {
        const newIds = new Set(selectedIds);
        let added = 0;

        for (const member of displayMembers) {
            if (!newIds.has(member.id)) {
                newIds.add(member.id);
                added++;
            }
        }

        onSelectionChange(Array.from(newIds));
        if (added > 0) {
            toast.success(`${added} member(s) selected`);
        }
    }

    function deselectAll() {
        onSelectionChange([]);
    }

    function removeMember(id: string) {
        onSelectionChange(selectedIds.filter((v) => v !== id));
    }

    const hasActiveFilters = genderFilter !== "all" || groupFilter !== "all" || search.trim() !== "";

    function clearFilters() {
        setGenderFilter("all");
        setGroupFilter("all");
        setSearch("");
    }

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 p-4 border-b bg-muted/30">
                {/* Search Bar */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or ID..."
                            className="pl-9 h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                                onClick={() => setSearch("")}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs shrink-0"
                        onClick={selectAllVisible}
                        disabled={displayMembers.length === 0 || displayMembers.every((m) => selectedSet.has(m.id))}
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

                {/* Filter Row */}
                <div className="flex items-center gap-2">
                    {/* Gender Filter */}
                    <Select value={genderFilter} onValueChange={(v) => setGenderFilter(v as GenderFilter)}>
                        <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Genders</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Group Filter */}
                    <Select value={groupFilter} onValueChange={(v) => setGroupFilter(v as GroupFilter)}>
                        <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue placeholder="Group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Groups</SelectItem>
                            <SelectItem value="men">Men</SelectItem>
                            <SelectItem value="women">Women</SelectItem>
                            <SelectItem value="youth">Youth</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={clearFilters}
                        >
                            <X className="mr-1 h-3 w-3" />
                            Clear Filters
                        </Button>
                    )}

                    <div className="flex-1" />

                    {selectedIds.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 text-xs",
                                showSelectedOnly && "bg-primary/10 text-primary"
                            )}
                            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                        >
                            {showSelectedOnly
                                ? "Show all"
                                : `Selected (${selectedIds.length})`}
                        </Button>
                    )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="default" className="tabular-nums">
                            <Users className="mr-1 h-3 w-3" />
                            {selectedIds.length} selected
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {displayMembers.length} shown · {allMembers.length} total
                        </span>
                    </div>

                    {hasActiveFilters && (
                        <Badge variant="secondary" className="text-[10px]">
                            <Filter className="mr-1 h-2.5 w-2.5" />
                            Filtered
                        </Badge>
                    )}
                </div>
            </div>

            {/* Member List */}
            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading members...</p>
                    </div>
                ) : displayMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12">
                        <Users className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            {showSelectedOnly
                                ? "No members selected yet."
                                : hasActiveFilters
                                    ? "No members match your filters."
                                    : "No members found."}
                        </p>
                        {hasActiveFilters && !showSelectedOnly && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y">
                        {displayMembers.map((member) => {
                            const isSelected = selectedSet.has(member.id);
                            const initials =
                                (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

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
                                            {member.gender && (
                                                <>
                                                    <span>·</span>
                                                    <span className="capitalize">{member.gender}</span>
                                                </>
                                            )}
                                        </div>
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