// src/components/dashboard/users/user-export-menu.tsx

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Member, FilterConfig } from "@/lib/types";
import { EXPORTABLE_COLUMNS } from "@/lib/constants";
import { exportToCSV, exportToExcel } from "@/lib/exports/export-utils";
import { fetchMembersForExport } from "@/actions/member";
import { toast } from "sonner";
import {
    DownloadIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    ColumnsIcon,
    Loader2Icon,
} from "lucide-react";

interface UserExportMenuProps {
    filteredMembers: Member[];
    selectedMembers: Member[];
    hasSelection: boolean;
    hasFilters: boolean;
    debouncedSearch: string;
    currentFilters: FilterConfig[];
}

// Default columns for quick exports
const DEFAULT_EXPORT_COLUMNS: (keyof Member)[] = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "gender",
    "placeOfStay",
    "memberPosition",
    "memberGroup",
    "occupationType",
    "membershipId",
];

export function UserExportMenu({
    filteredMembers,
    selectedMembers,
    hasSelection,
    hasFilters,
    debouncedSearch,
    currentFilters,
}: UserExportMenuProps) {
    const [columnPickerOpen, setColumnPickerOpen] = React.useState(false);
    const [selectedColumns, setSelectedColumns] = React.useState<
        (keyof Member)[]
    >([
        "firstName",
        "lastName",
        "email",
        "phone",
        "memberPosition",
        "memberGroup",
        "membershipId",
    ]);
    const [exportScope, setExportScope] = React.useState<
        "all" | "filtered" | "selected"
    >("all");
    const [exportFormat, setExportFormat] = React.useState<"csv" | "xlsx">(
        "csv"
    );
    const [isExporting, setIsExporting] = React.useState(false);

    /**
     * Fetch export data based on scope.
     * FIXED: "filtered" now fetches ALL filtered results from DB,
     * not just the current page.
     */
    const getExportData = async (
        scope: "all" | "filtered" | "selected"
    ): Promise<Member[]> => {
        if (scope === "selected") return selectedMembers;

        if (scope === "filtered") {
            // Fetch ALL matching members from DB (not just current page)
            try {
                return await fetchMembersForExport(
                    debouncedSearch,
                    currentFilters.filter((f) => f.value && f.value !== "all")
                );
            } catch (error) {
                console.error("Failed to fetch filtered export data:", error);
                toast.error("Failed to fetch filtered data for export");
                return [];
            }
        }

        // "all" — fetch everything from DB (no filters, no pagination)
        try {
            return await fetchMembersForExport("", []);
        } catch (error) {
            console.error("Failed to fetch export data:", error);
            toast.error("Failed to fetch data for export");
            return [];
        }
    };

    const quickExport = async (
        scope: "all" | "filtered" | "selected",
        format: "csv" | "xlsx"
    ) => {
        setIsExporting(true);
        try {
            const data = await getExportData(scope);

            if (data.length === 0) {
                toast.error("No data to export");
                return;
            }

            const fileName = `members-${scope}-${new Date().toISOString().slice(0, 10)}`;

            if (format === "csv") {
                exportToCSV(data, DEFAULT_EXPORT_COLUMNS, fileName);
            } else {
                exportToExcel(data, DEFAULT_EXPORT_COLUMNS, fileName);
            }

            toast.success(`Exported ${data.length} members`, {
                description: `Saved as ${fileName}.${format === "csv" ? "csv" : "xls"}`,
            });
        } finally {
            setIsExporting(false);
        }
    };

    /**
     * FIXED: Custom export now uses `selectedColumns` (user's choice)
     * instead of hardcoded default columns.
     */
    const handleCustomExport = async () => {
        if (selectedColumns.length === 0) {
            toast.error("Please select at least one column");
            return;
        }

        setIsExporting(true);
        try {
            const data = await getExportData(exportScope);

            if (data.length === 0) {
                toast.error("No data to export");
                return;
            }

            const fileName = `members-custom-${new Date().toISOString().slice(0, 10)}`;

            // FIXED: Uses selectedColumns, not defaultColumns
            if (exportFormat === "csv") {
                exportToCSV(data, selectedColumns, fileName);
            } else {
                exportToExcel(data, selectedColumns, fileName);
            }

            toast.success(
                `Exported ${data.length} members (${selectedColumns.length} columns)`
            );
            setColumnPickerOpen(false);
        } finally {
            setIsExporting(false);
        }
    };

    const toggleColumn = (col: keyof Member) => {
        setSelectedColumns((prev) =>
            prev.includes(col)
                ? prev.filter((c) => c !== col)
                : [...prev, col]
        );
    };

    /**
     * Quick export with specific columns.
     * FIXED: Fetches from DB when no selection/filter in memory.
     */
    const quickSpecificExport = async (
        columns: (keyof Member)[],
        fileName: string,
        label: string
    ) => {
        setIsExporting(true);
        try {
            const data = hasSelection
                ? selectedMembers
                : hasFilters
                    ? await fetchMembersForExport(
                        debouncedSearch,
                        currentFilters.filter(
                            (f) => f.value && f.value !== "all"
                        )
                    )
                    : await fetchMembersForExport("", []);

            if (data.length === 0) {
                toast.error("No data to export");
                return;
            }

            exportToCSV(data, columns, fileName);
            toast.success(`Exported ${data.length} ${label}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <Loader2Icon className="mr-2 size-4 animate-spin" />
                        ) : (
                            <DownloadIcon className="mr-2 size-4" />
                        )}
                        Export
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Export Members</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>All Members</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem
                                onClick={() => quickExport("all", "csv")}
                            >
                                <FileTextIcon className="mr-2 size-4" />
                                Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => quickExport("all", "xlsx")}
                            >
                                <FileSpreadsheetIcon className="mr-2 size-4" />
                                Export as Excel
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {hasFilters && (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                Filtered Results
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem
                                    onClick={() => quickExport("filtered", "csv")}
                                >
                                    <FileTextIcon className="mr-2 size-4" />
                                    Export as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => quickExport("filtered", "xlsx")}
                                >
                                    <FileSpreadsheetIcon className="mr-2 size-4" />
                                    Export as Excel
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    )}

                    {hasSelection && (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                Selected ({selectedMembers.length})
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem
                                    onClick={() => quickExport("selected", "csv")}
                                >
                                    <FileTextIcon className="mr-2 size-4" />
                                    Export as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => quickExport("selected", "xlsx")}
                                >
                                    <FileSpreadsheetIcon className="mr-2 size-4" />
                                    Export as Excel
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => {
                            setExportScope(
                                hasSelection
                                    ? "selected"
                                    : hasFilters
                                        ? "filtered"
                                        : "all"
                            );
                            setColumnPickerOpen(true);
                        }}
                    >
                        <ColumnsIcon className="mr-2 size-4" />
                        Custom Export
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Quick Exports
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() =>
                                quickSpecificExport(
                                    ["firstName", "lastName", "phone"],
                                    "phone-numbers",
                                    "phone numbers"
                                )
                            }
                        >
                            Phone Numbers Only
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                quickSpecificExport(
                                    ["firstName", "lastName", "email"],
                                    "email-list",
                                    "emails"
                                )
                            }
                        >
                            Email List Only
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                quickSpecificExport(
                                    [
                                        "firstName",
                                        "lastName",
                                        "placeOfStay",
                                        "houseNumber",
                                    ],
                                    "addresses",
                                    "addresses"
                                )
                            }
                        >
                            Addresses Only
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Custom Column Picker Dialog */}
            <Dialog open={columnPickerOpen} onOpenChange={setColumnPickerOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Custom Export</DialogTitle>
                        <DialogDescription>
                            Select the columns you want to include in your export
                            file.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Scope</Label>
                            <select
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={exportScope}
                                onChange={(e) =>
                                    setExportScope(
                                        e.target.value as typeof exportScope
                                    )
                                }
                            >
                                <option value="all">All Members</option>
                                {hasFilters && (
                                    <option value="filtered">
                                        Filtered Results
                                    </option>
                                )}
                                {hasSelection && (
                                    <option value="selected">
                                        Selected ({selectedMembers.length})
                                    </option>
                                )}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Format</Label>
                            <select
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={exportFormat}
                                onChange={(e) =>
                                    setExportFormat(
                                        e.target.value as typeof exportFormat
                                    )
                                }
                            >
                                <option value="csv">CSV (.csv)</option>
                                <option value="xlsx">Excel (.xls)</option>
                            </select>
                        </div>
                    </div>

                    <ScrollArea className="h-64">
                        <div className="space-y-3 pr-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <Checkbox
                                    id="select-all-cols"
                                    checked={
                                        selectedColumns.length ===
                                        EXPORTABLE_COLUMNS.length
                                    }
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedColumns(
                                                EXPORTABLE_COLUMNS.map((c) => c.value)
                                            );
                                        } else {
                                            setSelectedColumns([]);
                                        }
                                    }}
                                />
                                <Label
                                    htmlFor="select-all-cols"
                                    className="text-sm font-medium"
                                >
                                    Select All
                                </Label>
                            </div>

                            {EXPORTABLE_COLUMNS.map((col) => (
                                <div
                                    key={col.value}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox
                                        id={`col-${col.value}`}
                                        checked={selectedColumns.includes(col.value)}
                                        onCheckedChange={() => toggleColumn(col.value)}
                                    />
                                    <Label
                                        htmlFor={`col-${col.value}`}
                                        className="text-sm"
                                    >
                                        {col.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleCustomExport}
                            disabled={
                                isExporting || selectedColumns.length === 0
                            }
                        >
                            {isExporting ? (
                                <Loader2Icon className="mr-2 size-4 animate-spin" />
                            ) : (
                                <DownloadIcon className="mr-2 size-4" />
                            )}
                            Export ({selectedColumns.length} columns)
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}