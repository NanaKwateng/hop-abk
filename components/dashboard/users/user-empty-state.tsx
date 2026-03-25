// src/components/users/user-empty-state.tsx
// ============================================================
// Shows when there are no results (no users, or search returned nothing).
// A good empty state tells users WHY it's empty and WHAT to do next.
// ============================================================

import { Button } from "@/components/ui/button";
import { SearchIcon, UserPlusIcon, UsersIcon, FilterXIcon } from "lucide-react";

interface UserEmptyStateProps {
    type: "no-users" | "no-results" | "no-filtered-results";
    searchQuery?: string;
    onClearFilters?: () => void;
    onAddUser?: () => void;
}

export function UserEmptyState({
    type,
    searchQuery,
    onClearFilters,
    onAddUser,
}: UserEmptyStateProps) {
    // Different empty states for different scenarios
    const states = {
        "no-users": {
            icon: UsersIcon,
            title: "No members yet",
            description:
                "Get started by adding your first member to the system.",
            action: onAddUser ? (
                <Button onClick={onAddUser}>
                    <UserPlusIcon className="mr-2 size-4" />
                    Add First Member
                </Button>
            ) : null,
        },
        "no-results": {
            icon: SearchIcon,
            title: "No members found",
            description: searchQuery
                ? `No members match "${searchQuery}". Try a different search term.`
                : "No members match your current search.",
            action: onClearFilters ? (
                <Button variant="outline" onClick={onClearFilters}>
                    <FilterXIcon className="mr-2 size-4" />
                    Clear Search
                </Button>
            ) : null,
        },
        "no-filtered-results": {
            icon: FilterXIcon,
            title: "No matching members",
            description:
                "No members match your current filters. Try adjusting or clearing your filters.",
            action: onClearFilters ? (
                <Button variant="outline" onClick={onClearFilters}>
                    <FilterXIcon className="mr-2 size-4" />
                    Clear All Filters
                </Button>
            ) : null,
        },
    };

    const state = states[type];
    const Icon = state.icon;

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
            {/* Icon with subtle background */}
            <div className="rounded-full bg-muted p-6">
                <Icon className="size-10 text-muted-foreground" />
            </div>

            {/* Text */}
            <div className="text-center">
                <h3 className="text-lg font-semibold">{state.title}</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {state.description}
                </p>
            </div>

            {/* Action button */}
            {state.action}
        </div>
    );
}