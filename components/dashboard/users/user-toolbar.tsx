// src/components/dashboard/users/user-toolbar.tsx

"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserSearchTrigger } from "./user-search-command";
import { UserExportMenu } from "./user-export-menu";
import { DataTableViewOptions } from "./data-table-view-options";
import type { Member, FilterConfig } from "@/lib/types";
import {
    GENDER_OPTIONS,
    MEMBER_POSITION_OPTIONS,
    MEMBER_GROUP_OPTIONS,
    OCCUPATION_OPTIONS,
    POSITION_LABELS,
    GROUP_LABELS,
    OCCUPATION_LABELS,
    GENDER_LABELS,
} from "@/lib/constants";
import { FilterIcon, SearchIcon, XIcon, PlusIcon } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

interface UserToolbarProps {
    table: Table<Member>;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filters: FilterConfig[];
    onFilterChange: (field: keyof Member, value: string) => void;
    onFilterRemove: (field: keyof Member) => void;
    onClearAllFilters: () => void;
    filteredMembers: Member[];
    selectedMembers: Member[];
    onAddMember: () => void;
    debouncedSearch: string;
    currentFilters: FilterConfig[];
}

export function UserToolbar({
    table,
    searchValue,
    onSearchChange,
    filters,
    onFilterChange,
    onFilterRemove,
    onClearAllFilters,
    filteredMembers,
    selectedMembers,
    onAddMember,
    debouncedSearch,
    currentFilters,
}: UserToolbarProps) {
    const activeFilterCount = filters.filter(
        (f) => f.value && f.value !== "all"
    ).length;
    const hasActiveFilters =
        activeFilterCount > 0 || searchValue.trim().length > 0;

    // Human-readable label for filter badges
    const getFilterLabel = (field: string, value: string): string => {
        const labelMaps: Record<string, Record<string, string>> = {
            gender: GENDER_LABELS,
            memberPosition: POSITION_LABELS,
            memberGroup: GROUP_LABELS,
            occupationType: OCCUPATION_LABELS,
        };
        const map = labelMaps[field];
        return map ? map[value] || value : value;
    };

    const getFieldLabel = (field: string): string => {
        const map: Record<string, string> = {
            gender: "Gender",
            memberPosition: "Position",
            memberGroup: "Group",
            occupationType: "Occupation",
            placeOfStay: "Location",
        };
        return map[field] || field;
    };

    return (
        <div className="space-y-4">
            {/* Top Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: Search */}
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 sm:max-w-xs">
                        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search members..."
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9"
                        />
                        {searchValue && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 size-6 -translate-y-1/2"
                                onClick={() => onSearchChange("")}
                            >
                                <XIcon className="size-3" />
                            </Button>
                        )}
                    </div>
                    <UserSearchTrigger />
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Filters */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                                <FilterIcon className="mr-2 size-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-2 rounded-full px-1.5 py-0.5 text-xs"
                                    >
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Filters</h4>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 text-xs text-muted-foreground"
                                            onClick={onClearAllFilters}
                                        >
                                            Clear all
                                        </Button>
                                    )}
                                </div>
                                <Separator />

                                <FilterSelect
                                    label="Gender"
                                    value={
                                        filters.find((f) => f.field === "gender")?.value
                                    }
                                    options={GENDER_OPTIONS}
                                    onChange={(v) => onFilterChange("gender", v)}
                                />

                                <FilterSelect
                                    label="Position"
                                    value={
                                        filters.find((f) => f.field === "memberPosition")
                                            ?.value
                                    }
                                    options={MEMBER_POSITION_OPTIONS}
                                    onChange={(v) => onFilterChange("memberPosition", v)}
                                />

                                <FilterSelect
                                    label="Group"
                                    value={
                                        filters.find((f) => f.field === "memberGroup")
                                            ?.value
                                    }
                                    options={MEMBER_GROUP_OPTIONS}
                                    onChange={(v) => onFilterChange("memberGroup", v)}
                                />

                                <FilterSelect
                                    label="Occupation"
                                    value={
                                        filters.find((f) => f.field === "occupationType")
                                            ?.value
                                    }
                                    options={OCCUPATION_OPTIONS}
                                    onChange={(v) => onFilterChange("occupationType", v)}
                                />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input
                                        placeholder="Filter by location..."
                                        className="h-8"
                                        value={
                                            filters.find((f) => f.field === "placeOfStay")
                                                ?.value || ""
                                        }
                                        onChange={(e) =>
                                            onFilterChange("placeOfStay", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <DataTableViewOptions table={table} />

                    <UserExportMenu
                        filteredMembers={filteredMembers}
                        selectedMembers={selectedMembers}
                        hasSelection={selectedMembers.length > 0}
                        hasFilters={hasActiveFilters}
                        debouncedSearch={debouncedSearch}
                        currentFilters={currentFilters}
                    />

                    <HoverBorderGradient
                        containerClassName="rounded-md"
                        as="button"
                        className="dark:bg-black bg-white text-black py-2 px-2 dark:text-white flex items-center space-x-2 text-xs"
                        onClick={onAddMember}
                    >


                        <PlusIcon className="mr-2 size-4" />
                        Add Member

                    </HoverBorderGradient>

                </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active:</span>
                    {searchValue && (
                        <Badge variant="secondary" className="gap-1">
                            Search: &ldquo;{searchValue}&rdquo;
                            <button onClick={() => onSearchChange("")}>
                                <XIcon className="size-3" />
                            </button>
                        </Badge>
                    )}
                    {filters
                        .filter((f) => f.value && f.value !== "all")
                        .map((filter) => (
                            <Badge
                                key={filter.field}
                                variant="secondary"
                                className="gap-1"
                            >
                                {getFieldLabel(filter.field)}:{" "}
                                {getFilterLabel(filter.field, filter.value)}
                                <button onClick={() => onFilterRemove(filter.field)}>
                                    <XIcon className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={onClearAllFilters}
                    >
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}

// ---- Helper ----

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value?: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <Select value={value || "all"} onValueChange={onChange}>
                <SelectTrigger className="h-8">
                    <SelectValue placeholder={`All ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}