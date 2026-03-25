// src/components/users/user-table-skeleton.tsx
// ============================================================
// Shows a "shimmering" placeholder while the table data loads.
// This is better than a blank screen or a spinner because users
// can see the STRUCTURE of what's coming.
// ============================================================

import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function UserTableSkeleton() {
    return (
        <div className="space-y-4">
            {/* Toolbar skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 gap-2">
                    <Skeleton className="h-9 w-full sm:w-64" /> {/* Search input */}
                    <Skeleton className="h-9 w-64" />            {/* Command search */}
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" /> {/* Filter button */}
                    <Skeleton className="h-9 w-20" /> {/* Sort button */}
                    <Skeleton className="h-9 w-36" /> {/* Add button */}
                </div>
            </div>

            {/* Table skeleton */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Skeleton className="h-4 w-4" /> {/* Checkbox */}
                            </TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead className="hidden md:table-cell">
                                <Skeleton className="h-4 w-32" />
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                <Skeleton className="h-4 w-24" />
                            </TableHead>
                            <TableHead className="hidden xl:table-cell">
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                            <TableHead className="hidden xl:table-cell">
                                <Skeleton className="h-4 w-16" />
                            </TableHead>
                            <TableHead><Skeleton className="h-4 w-8" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Generate 10 skeleton rows */}
                        {Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-4 w-4" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="size-8 rounded-full" /> {/* Avatar */}
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-28" /> {/* Name */}
                                            <Skeleton className="h-3 w-20 md:hidden" /> {/* Email mobile */}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <Skeleton className="h-4 w-40" />
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <Skeleton className="h-4 w-28" />
                                </TableCell>
                                <TableCell className="hidden xl:table-cell">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </TableCell>
                                <TableCell className="hidden xl:table-cell">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="size-8 rounded" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}