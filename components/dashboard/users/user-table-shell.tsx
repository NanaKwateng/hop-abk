// src/components/dashboard/users/user-table-shell.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useQueryParams } from "@/hooks/use-query-params";
import { useDebounce } from "@/hooks/use-debounce";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    useMembersQuery,
    useDeleteMemberMutation,
    useDuplicateMemberMutation,
    useBulkDeleteMembersMutation,
} from "@/queries/member-queries";
import getMemberColumns from "./member-column";
import { UserToolbar } from "./user-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import { UserTableSkeleton } from "./user-table-skeleton";
import { UserMobileCard } from "./user-mobile-card";
import { UserEmptyState } from "./user-empty-state";
import { UserDeleteDialog } from "./user-delete-dialog";
import { MemberSheet } from "./member-sheet";
import { UserBulkActions } from "./user-bulk-actions";
import type { Member, FilterConfig } from "@/lib/types";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { exportToCSV } from "@/lib/exports/export-utils";
import { toast } from "sonner";

export function UserTableShell() {
    const router = useRouter();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    // ---- URL Query Params ----
    const { getParam, setParams, clearAllParams } = useQueryParams();

    const urlSearch = getParam("search") || "";
    const urlPage = parseInt(getParam("page") || "1", 10);
    const urlPageSize = parseInt(
        getParam("pageSize") || String(DEFAULT_PAGE_SIZE),
        10
    );
    const urlSortField = getParam("sort") || undefined;
    const urlSortDir = getParam("order") || undefined;

    const urlFilters: FilterConfig[] = [];
    const filterFields: (keyof Member)[] = [
        "gender",
        "memberPosition",
        "memberGroup",
        "occupationType",
        "placeOfStay",
    ];
    filterFields.forEach((field) => {
        const value = getParam(field);
        if (value) urlFilters.push({ field, value });
    });

    // ---- Local State ----
    const [searchInput, setSearchInput] = React.useState(urlSearch);
    const debouncedSearch = useDebounce(searchInput, 300);
    const [currentFilters, setCurrentFilters] =
        React.useState<FilterConfig[]>(urlFilters);

    const [sorting, setSorting] = React.useState<SortingState>(
        urlSortField
            ? [{ id: urlSortField, desc: urlSortDir === "desc" }]
            : []
    );
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] =
        React.useState<RowSelectionState>({});

    // Dialog/Sheet state
    const [deleteTarget, setDeleteTarget] = React.useState<Member | null>(
        null
    );
    const [editTarget, setEditTarget] = React.useState<Member | null>(null);
    const [showBulkDelete, setShowBulkDelete] = React.useState(false);
    const [showAddSheet, setShowAddSheet] = React.useState(false);

    React.useEffect(() => {
        const width = window.innerWidth;
        setColumnVisibility({
            gender: false,
            occupationType: false,
            houseNumber: false,
            addressComments: false,
            roleComments: false,
            phoneCountry: false,
            membershipId: width >= 1280,
            memberGroup: width >= 1280,
            phone: width >= 1024,
            placeOfStay: width >= 1024,
            memberPosition: width >= 1024,
            email: width >= 768,
        });
    }, []);

    // ---- Sync URL with state ----
    React.useEffect(() => {
        const params: Record<string, string | null> = {
            search: debouncedSearch || null,
            page: "1",
        };

        filterFields.forEach((field) => {
            const filter = currentFilters.find((f) => f.field === field);
            params[field] =
                filter?.value && filter.value !== "all" ? filter.value : null;
        });

        if (sorting.length > 0) {
            params.sort = sorting[0].id;
            params.order = sorting[0].desc ? "desc" : "asc";
        } else {
            params.sort = null;
            params.order = null;
        }

        setParams(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, currentFilters, sorting]);

    // ---- TanStack Query ----
    const {
        data: queryResult,
        isLoading,
        isError,
        refetch,
    } = useMembersQuery({
        search: debouncedSearch,
        page: urlPage,
        pageSize: urlPageSize,
        sortField: sorting[0]?.id as keyof Member | undefined,
        sortDirection: sorting[0]?.desc ? "desc" : "asc",
        filters: currentFilters.filter((f) => f.value && f.value !== "all"),
    });

    // Mutations
    const deleteMutation = useDeleteMemberMutation();
    const duplicateMutation = useDuplicateMemberMutation();
    const bulkDeleteMutation = useBulkDeleteMembersMutation();

    // ---- Column definitions ----
    const handleDuplicate = React.useCallback(
        (id: string) => duplicateMutation.mutate(id),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const columns = React.useMemo(
        () =>
            getMemberColumns({
                onViewMember: (member) =>
                    router.push(`/admin/users/${member.id}`),
                onEditMember: (member) => setEditTarget(member),
                onDuplicateMember: (member) => handleDuplicate(member.id),
                onDeleteMember: (member) => setDeleteTarget(member),
            }),
        [router, handleDuplicate]
    );

    // ---- Table Instance ----
    const table = useReactTable({
        data: queryResult?.data ?? [],
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: queryResult?.totalPages ?? 0,
        enableRowSelection: true,
        getRowId: (row) => row.id,
    });

    // ---- Derived Data ----
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedMembers = selectedRows.map((row) => row.original);
    const filteredMembers = queryResult?.data ?? [];

    // ---- Filter Handlers ----
    const handleFilterChange = (field: keyof Member, value: string) => {
        setCurrentFilters((prev) => {
            const existing = prev.findIndex((f) => f.field === field);
            if (value === "all" || value === "") {
                return prev.filter((f) => f.field !== field);
            }
            if (existing >= 0) {
                const next = [...prev];
                next[existing] = { field, value };
                return next;
            }
            return [...prev, { field, value }];
        });
    };

    const handleFilterRemove = (field: keyof Member) => {
        setCurrentFilters((prev) => prev.filter((f) => f.field !== field));
    };

    const handleClearAllFilters = () => {
        setSearchInput("");
        setCurrentFilters([]);
        setSorting([]);
        clearAllParams();
    };

    // ---- Page Handlers ----
    const handlePageChange = (page: number) => {
        setParams({ page: String(page) });
    };

    const handlePageSizeChange = (size: number) => {
        setParams({ pageSize: String(size), page: "1" });
    };

    // ---- Delete Handlers (FIXED) ----
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
            // Force an immediate refetch to ensure UI updates
            await refetch();
        } catch {
            // Error toast is shown by the mutation's onError handler.
            // Keep dialog open so user sees the error.
        }
    };

    const handleBulkDelete = async () => {
        const ids = selectedMembers.map((m) => m.id);
        if (ids.length === 0) return;

        try {
            await bulkDeleteMutation.mutateAsync(ids);
            setRowSelection({});
            setShowBulkDelete(false);
            await refetch();
        } catch {
            // Error toast is shown by the mutation's onError handler.
        }
    };

    const handleBulkExport = () => {
        if (selectedMembers.length === 0) return;
        exportToCSV(
            selectedMembers,
            [
                "firstName",
                "lastName",
                "email",
                "phone",
                "memberPosition",
                "memberGroup",
                "placeOfStay",
                "membershipId",
            ],
            `selected-members-${new Date().toISOString().slice(0, 10)}`
        );
        toast.success(`Exported ${selectedMembers.length} selected members`);
    };

    // ---- Loading State ----
    if (isLoading && !queryResult) {
        return <UserTableSkeleton />;
    }

    // ---- Error State ----
    if (isError) {
        return (
            <UserEmptyState
                type="no-results"
                searchQuery="Error loading data"
                onClearFilters={handleClearAllFilters}
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <UserToolbar
                table={table}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                filters={currentFilters}
                onFilterChange={handleFilterChange}
                onFilterRemove={handleFilterRemove}
                onClearAllFilters={handleClearAllFilters}
                filteredMembers={filteredMembers}
                selectedMembers={selectedMembers}
                onAddMember={() => setShowAddSheet(true)}
                debouncedSearch={debouncedSearch}
                currentFilters={currentFilters}
            />

            {/* Desktop Table / Mobile Cards */}
            {isDesktop ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: header.getSize() }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : typeof header.column.columnDef.header ===
                                                    "function"
                                                    ? header.column.columnDef.header(
                                                        header.getContext()
                                                    )
                                                    : header.column.columnDef.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        <UserEmptyState
                                            type={
                                                searchInput || currentFilters.length > 0
                                                    ? "no-filtered-results"
                                                    : "no-users"
                                            }
                                            searchQuery={searchInput}
                                            onClearFilters={handleClearAllFilters}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() ? "selected" : undefined
                                        }
                                        className="group"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {typeof cell.column.columnDef.cell ===
                                                    "function"
                                                    ? cell.column.columnDef.cell(
                                                        cell.getContext()
                                                    )
                                                    : cell.getValue()}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="space-y-3">
                    {(queryResult?.data ?? []).length === 0 ? (
                        <UserEmptyState
                            type={
                                searchInput || currentFilters.length > 0
                                    ? "no-filtered-results"
                                    : "no-users"
                            }
                            searchQuery={searchInput}
                            onClearFilters={handleClearAllFilters}
                        />
                    ) : (
                        (queryResult?.data ?? []).map((member) => (
                            <UserMobileCard
                                key={member.id}
                                member={member}
                                isSelected={!!rowSelection[member.id]}
                                onToggleSelect={() => {
                                    setRowSelection((prev) => ({
                                        ...prev,
                                        [member.id]: !prev[member.id],
                                    }));
                                }}
                                onEdit={(m) => setEditTarget(m)}
                                onDuplicate={(m) => duplicateMutation.mutate(m.id)}
                                onDelete={(m) => setDeleteTarget(m)}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            <DataTablePagination
                currentPage={queryResult?.currentPage ?? 1}
                totalPages={queryResult?.totalPages ?? 1}
                totalCount={queryResult?.totalCount ?? 0}
                pageSize={urlPageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                selectedCount={selectedMembers.length}
            />

            {/* Bulk Actions */}
            <UserBulkActions
                selectedCount={selectedMembers.length}
                onDelete={() => setShowBulkDelete(true)}
                onClearSelection={() => setRowSelection({})}
                onExport={handleBulkExport}
                isDeleting={bulkDeleteMutation.isPending}
            />

            {/* Delete Dialog (Single) */}
            <UserDeleteDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                onConfirm={handleConfirmDelete}
                member={deleteTarget}
                isLoading={deleteMutation.isPending}
            />

            {/* Delete Dialog (Bulk) */}
            <UserDeleteDialog
                open={showBulkDelete}
                onOpenChange={setShowBulkDelete}
                onConfirm={handleBulkDelete}
                count={selectedMembers.length}
                isLoading={bulkDeleteMutation.isPending}
            />

            {/* Add Member Sheet */}
            <MemberSheet
                mode="add"
                open={showAddSheet}
                onOpenChange={setShowAddSheet}
            />

            {/* Edit Member Sheet */}
            {editTarget && (
                <MemberSheet
                    mode="edit"
                    member={editTarget}
                    open={!!editTarget}
                    onOpenChange={(open) => {
                        if (!open) setEditTarget(null);
                    }}
                />
            )}
        </div>
    );
}