// src/components/users/user-bulk-actions.tsx
// ============================================================
// Appears when rows are selected. Shows count and available actions.
// Slides in from the bottom of the table area.
// ============================================================

"use client";

import { Button } from "@/components/ui/button";
import { TrashIcon, XIcon, DownloadIcon } from "lucide-react";

interface UserBulkActionsProps {
    selectedCount: number;
    onDelete: () => void;
    onClearSelection: () => void;
    onExport: () => void;
    isDeleting?: boolean;
}

export function UserBulkActions({
    selectedCount,
    onDelete,
    onClearSelection,
    onExport,
    isDeleting = false,
}: UserBulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
                {/* Selection count */}
                <span className="text-sm font-medium">
                    {selectedCount} member{selectedCount > 1 ? "s" : ""} selected
                </span>

                {/* Divider */}
                <div className="h-6 w-px bg-border" />

                {/* Actions */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    className="h-8"
                >
                    <DownloadIcon className="mr-1.5 size-3.5" />
                    Export
                </Button>

                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="h-8"
                >
                    <TrashIcon className="mr-1.5 size-3.5" />
                    {isDeleting ? "Deleting..." : "Delete"}
                </Button>

                {/* Clear selection */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={onClearSelection}
                >
                    <XIcon className="size-4" />
                    <span className="sr-only">Clear selection</span>
                </Button>
            </div>
        </div>
    );
}