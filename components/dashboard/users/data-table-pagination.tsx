// src/components/users/data-table-pagination.tsx
// ============================================================
// Table pagination controls with page size selector.
// Shows: "Showing 1-20 of 85 members | Rows per page: [20] | Page 1 of 5"
// ============================================================

"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
} from "lucide-react";

interface DataTablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    selectedCount?: number;
}

export function DataTablePagination({
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
    selectedCount = 0,
}: DataTablePaginationProps) {
    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex flex-col gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Selection count or item range */}
            <div className="text-sm text-muted-foreground">
                {selectedCount > 0 ? (
                    <span>{selectedCount} of {totalCount} member(s) selected</span>
                ) : (
                    <span>
                        Showing {startItem}–{endItem} of {totalCount} members
                    </span>
                )}
            </div>

            {/* Right: Page size + navigation */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
                {/* Page size selector */}
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Page indicator */}
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {totalPages || 1}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden size-8 p-0 lg:flex"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage <= 1}
                        aria-label="First page"
                    >
                        <ChevronsLeftIcon className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8 p-0"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label="Previous page"
                    >
                        <ChevronLeftIcon className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8 p-0"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        aria-label="Next page"
                    >
                        <ChevronRightIcon className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden size-8 p-0 lg:flex"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                        aria-label="Last page"
                    >
                        <ChevronsRightIcon className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}