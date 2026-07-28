// components/sms/sms-recipient-selector.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
    Check,
    X,
    Search,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUP_OPTIONS = [
    { value: "mens_fellowship", label: "Men's Fellowship" },
    { value: "womens_fellowship", label: "Women's Fellowship" },
    { value: "youth_fellowship", label: "Youth Fellowship" },
];

interface SMSRecipientSelectorProps {
    value: "all" | "group" | "individual" | "filtered";
    onValueChange: (value: "all" | "group" | "individual" | "filtered") => void;
    selectedGroup: string;
    onGroupChange: (value: string) => void;
    selectedMembers: string[];
    onMembersChange: (members: string[]) => void;
}

const spring = {
    type: "spring" as const,
    stiffness: 350,
    damping: 25,
    mass: 0.8,
};

export function SMSRecipientSelector({
    value,
    onValueChange,
    selectedGroup,
    onGroupChange,
    selectedMembers,
    onMembersChange,
}: SMSRecipientSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
    const { useRecipients } = useSMS();

    // Fetch recipients for member picker
    const { data: allMembersData, isLoading: membersLoading } = useRecipients("all");
    const allMembers = allMembersData?.recipients || [];

    // Filter members by search
    const filteredMembers = useMemo(() => {
        if (!searchQuery.trim()) return allMembers;
        return allMembers.filter((m) =>
            `${m.firstName} ${m.lastName} ${m.membershipId || ""}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
    }, [allMembers, searchQuery]);

    // Toggle member selection
    const toggleMember = (memberId: string) => {
        if (selectedMembers.includes(memberId)) {
            onMembersChange(selectedMembers.filter((id) => id !== memberId));
        } else {
            onMembersChange([...selectedMembers, memberId]);
        }
    };

    // Select all members
    const selectAllMembers = () => {
        const ids = filteredMembers.map((m) => m.id);
        onMembersChange(ids);
    };

    // Clear all members
    const clearAllMembers = () => {
        onMembersChange([]);
    };

    // Get display text for recipient type
    const getRecipientLabel = () => {
        switch (value) {
            case "all":
                return "All Members";
            case "group":
                return GROUP_OPTIONS.find((g) => g.value === selectedGroup)?.label || "Group";
            case "individual":
                return `${selectedMembers.length} Member${selectedMembers.length > 1 ? "s" : ""}`;
            case "filtered":
                return "Filtered Members";
            default:
                return "Select Recipients";
        }
    };

    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Recipients
            </Label>

            <div className="flex flex-wrap items-center gap-2">
                {/* Recipient Type Selector */}
                <Select
                    value={value}
                    onValueChange={(v) => onValueChange(v as any)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue>
                            <span className="flex items-center gap-2">
                                {value === "all" && <Users className="h-4 w-4" />}
                                {value === "group" && <Users2 className="h-4 w-4" />}
                                {value === "individual" && <User className="h-4 w-4" />}
                                {value === "filtered" && <Filter className="h-4 w-4" />}
                                {getRecipientLabel()}
                            </span>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                All Members
                            </span>
                        </SelectItem>
                        <SelectItem value="group">
                            <span className="flex items-center gap-2">
                                <Users2 className="h-4 w-4" />
                                By Group
                            </span>
                        </SelectItem>
                        <SelectItem value="individual">
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Select Members
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Group Selector */}
                {value === "group" && (
                    <Select value={selectedGroup} onValueChange={onGroupChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                            {GROUP_OPTIONS.map((group) => (
                                <SelectItem key={group.value} value={group.value}>
                                    {group.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Individual Member Picker */}
                {value === "individual" && (
                    <Popover open={isMemberPickerOpen} onOpenChange={setIsMemberPickerOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <User className="h-4 w-4" />
                                {selectedMembers.length > 0
                                    ? `${selectedMembers.length} selected`
                                    : "Select members"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                            <div className="p-3 border-b border-border/40">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search members..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 h-9"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllMembers}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllMembers}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="h-[300px]">
                                {membersLoading ? (
                                    <div className="p-4 space-y-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={i} className="h-12 w-full" />
                                        ))}
                                    </div>
                                ) : filteredMembers.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        {searchQuery ? "No members found" : "No members available"}
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {filteredMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                                                    selectedMembers.includes(member.id)
                                                        ? "bg-primary/10"
                                                        : "hover:bg-muted/50"
                                                )}
                                                onClick={() => toggleMember(member.id)}
                                            >
                                                <Checkbox
                                                    checked={selectedMembers.includes(member.id)}
                                                    onCheckedChange={() => toggleMember(member.id)}
                                                    className="pointer-events-none"
                                                />
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.firstName} ${member.lastName}`}
                                                    />
                                                    <AvatarFallback>
                                                        {member.firstName[0]}
                                                        {member.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {member.firstName} {member.lastName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {member.membershipId || "No ID"}
                                                    </p>
                                                </div>
                                                {selectedMembers.includes(member.id) && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>

                            <div className="p-3 border-t border-border/40 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {selectedMembers.length} members selected
                                </span>
                                <Button
                                    size="sm"
                                    onClick={() => setIsMemberPickerOpen(false)}
                                >
                                    Done
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {/* Selected count badge */}
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                    {value === "all" && <Users className="h-3 w-3" />}
                    {value === "group" && <Users2 className="h-3 w-3" />}
                    {value === "individual" && <User className="h-3 w-3" />}
                    {value === "group" ? GROUP_OPTIONS.find((g) => g.value === selectedGroup)?.label || "Group" : getRecipientLabel()}
                </Badge>
                {value === "individual" && selectedMembers.length > 0 && (
                    <Badge variant="outline" className="gap-1">
                        {selectedMembers.length} members
                    </Badge>
                )}
            </div>
        </div>
    );
}