// src/components/users/data-table-column-header.tsx
// ============================================================
// Reusable sortable column header for the data table.
// Shows sort direction indicators (↑ ↓ ↕) and handles click-to-sort.
// ============================================================

"use client";

import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    ChevronsUpDownIcon,
    EyeOffIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;  // TanStack Table column object
    title: string;                   // Display text
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    // If column is not sortable, just show the title text
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>;
    }

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                        <span>{title}</span>
                        {/* Show appropriate sort icon based on current state */}
                        {column.getIsSorted() === "desc" ? (
                            <ArrowDownIcon className="ml-2 size-4" />
                        ) : column.getIsSorted() === "asc" ? (
                            <ArrowUpIcon className="ml-2 size-4" />
                        ) : (
                            <ChevronsUpDownIcon className="ml-2 size-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                        <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground/70" />
                        Ascending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                        <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground/70" />
                        Descending
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                        <EyeOffIcon className="mr-2 size-3.5 text-muted-foreground/70" />
                        Hide Column
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}