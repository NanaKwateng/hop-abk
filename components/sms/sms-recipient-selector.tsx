"use client";

import { useState, useMemo, useCallback } from "react";
import { useSMS } from "@/hooks/use-sms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users,
    Users2,
    User,
    Filter,
    Search,
    X,
    UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type RecipientType = "all" | "group" | "individual" | "filtered";

interface GroupOption {
    value: string;
    label: string;
}

const DEFAULT_GROUP_OPTIONS: GroupOption[] = [
    { value: "mens_fellowship", label: "Men's Fellowship" },
    { value: "womens_fellowship", label: "Women's Fellowship" },
    { value: "youth_fellowship", label: "Youth Fellowship" },
];

// Updated Member interface to allow nullable membershipId
interface Member {
    id: string;
    firstName: string;
    lastName: string;
    membershipId?: string | null;
}

interface SMSRecipientSelectorProps {
    value: RecipientType;
    onValueChange: (value: RecipientType) => void;
    selectedGroup: string;
    onGroupChange: (value: string) => void;
    selectedMembers: string[];
    onMembersChange: (members: string[]) => void;
    groupOptions?: GroupOption[];
}

export function SMSRecipientSelector({
    value,
    onValueChange,
    selectedGroup,
    onGroupChange,
    selectedMembers,
    onMembersChange,
    groupOptions = DEFAULT_GROUP_OPTIONS,
}: SMSRecipientSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
    const { useRecipients } = useSMS();

    const { data: allMembersData, isLoading: membersLoading } = useRecipients("all");
    const allMembers: Member[] = allMembersData?.recipients || [];

    const filteredMembers = useMemo(() => {
        if (!searchQuery.trim()) return allMembers;
        const query = searchQuery.toLowerCase();
        return allMembers.filter((m) =>
            `${m.firstName} ${m.lastName} ${m.membershipId || ""}`
                .toLowerCase()
                .includes(query)
        );
    }, [allMembers, searchQuery]);

    const toggleMember = useCallback(
        (memberId: string) => {
            if (selectedMembers.includes(memberId)) {
                onMembersChange(selectedMembers.filter((id) => id !== memberId));
            } else {
                onMembersChange([...selectedMembers, memberId]);
            }
        },
        [selectedMembers, onMembersChange]
    );

    const selectedMemberObjects = useMemo(() => {
        const set = new Set(selectedMembers);
        return allMembers.filter((m) => set.has(m.id));
    }, [allMembers, selectedMembers]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Target Audience
                </Label>
                <span className="text-xs text-muted-foreground font-medium">
                    {value === "all"
                        ? "All active members"
                        : value === "group"
                            ? `${groupOptions.find((g) => g.value === selectedGroup)?.label || "Group"} members`
                            : `${selectedMembers.length} selected`}
                </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Main Recipient Type Selector */}
                    <Select
                        value={value}
                        onValueChange={(v) => onValueChange(v as RecipientType)}
                    >
                        <SelectTrigger className="w-[170px] h-9 rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-xs font-medium">
                            <SelectValue>
                                <span className="flex items-center gap-2">
                                    {value === "all" && <Users className="h-3.5 w-3.5 text-primary" />}
                                    {value === "group" && <Users2 className="h-3.5 w-3.5 text-primary" />}
                                    {value === "individual" && <User className="h-3.5 w-3.5 text-primary" />}
                                    {value === "filtered" && <Filter className="h-3.5 w-3.5 text-primary" />}
                                    {value === "all"
                                        ? "All Members"
                                        : value === "group"
                                            ? "By Fellowship"
                                            : "Individual"}
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/10 backdrop-blur-xl">
                            <SelectItem value="all" className="rounded-xl text-xs">
                                <span className="flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5" /> All Members
                                </span>
                            </SelectItem>
                            <SelectItem value="group" className="rounded-xl text-xs">
                                <span className="flex items-center gap-2">
                                    <Users2 className="h-3.5 w-3.5" /> By Group/Fellowship
                                </span>
                            </SelectItem>
                            <SelectItem value="individual" className="rounded-xl text-xs">
                                <span className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" /> Pick Specific Members
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Group Dropdown */}
                    {value === "group" && (
                        <Select value={selectedGroup} onValueChange={onGroupChange}>
                            <SelectTrigger className="w-[180px] h-9 rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-xs font-medium">
                                <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/10 backdrop-blur-xl">
                                {groupOptions.map((group) => (
                                    <SelectItem key={group.value} value={group.value} className="rounded-xl text-xs">
                                        {group.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Member Picker Popover */}
                    {value === "individual" && (
                        <Popover open={isMemberPickerOpen} onOpenChange={setIsMemberPickerOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-xs font-medium gap-1.5"
                                >
                                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                                    {selectedMembers.length > 0
                                        ? `Selected (${selectedMembers.length})`
                                        : "Choose Recipients"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[360px] p-0 rounded-3xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl" align="start">
                                <div className="p-3 border-b border-black/5 dark:border-white/10">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search member..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 border-none text-xs"
                                        />
                                    </div>
                                </div>

                                <ScrollArea className="h-[240px]">
                                    {membersLoading ? (
                                        <div className="p-3 space-y-2">
                                            {Array.from({ length: 4 }).map((_, i) => (
                                                <Skeleton key={i} className="h-10 w-full rounded-xl" />
                                            ))}
                                        </div>
                                    ) : filteredMembers.length === 0 ? (
                                        <div className="p-6 text-center text-xs text-muted-foreground">
                                            No members matching "{searchQuery}"
                                        </div>
                                    ) : (
                                        <div className="p-2 space-y-1">
                                            {filteredMembers.map((member) => {
                                                const isSelected = selectedMembers.includes(member.id);
                                                return (
                                                    <div
                                                        key={member.id}
                                                        onClick={() => toggleMember(member.id)}
                                                        className={cn(
                                                            "flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-colors text-xs",
                                                            isSelected
                                                                ? "bg-primary/10 text-foreground"
                                                                : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
                                                        )}
                                                    >
                                                        <Checkbox checked={isSelected} className="rounded-md" />
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage
                                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                                                    `${member.firstName} ${member.lastName}`
                                                                )}`}
                                                            />
                                                            <AvatarFallback className="text-[10px]">
                                                                {member.firstName[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium truncate flex-1">
                                                            {member.firstName} {member.lastName}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>

                                <div className="p-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5 rounded-b-3xl">
                                    <span className="text-[11px] text-muted-foreground pl-2">
                                        {selectedMembers.length} selected
                                    </span>
                                    <Button
                                        size="sm"
                                        className="h-7 text-xs rounded-xl px-3"
                                        onClick={() => setIsMemberPickerOpen(false)}
                                    >
                                        Done
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

                {/* Selected Member Badges View */}
                {value === "individual" && selectedMemberObjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedMemberObjects.map((member) => (
                            <Badge
                                key={member.id}
                                variant="secondary"
                                className="pl-1.5 pr-1 py-0.5 rounded-full text-[11px] bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"
                            >
                                <span>
                                    {member.firstName} {member.lastName}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => toggleMember(member.id)}
                                    className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                                    aria-label={`Remove ${member.firstName}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}