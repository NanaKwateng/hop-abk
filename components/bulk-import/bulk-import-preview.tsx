// components/bulk-import/bulk-import-preview.tsx

"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportRow } from "@/lib/types/bulk-import";

interface BulkImportPreviewProps {
    headers: string[];
    rows: ImportRow[];
    validRows: ImportRow[];
    invalidRows: ImportRow[];
    duplicateHandling: "skip" | "update";
    onDuplicateHandlingChange: (value: "skip" | "update") => void;
    skipInvalidRows: boolean;
    onSkipInvalidRowsChange: (value: boolean) => void;
    onImport: () => void;
    onBack: () => void;
}

export function BulkImportPreview({
    headers,
    rows,
    validRows,
    invalidRows,
    duplicateHandling,
    onDuplicateHandlingChange,
    skipInvalidRows,
    onSkipInvalidRowsChange,
    onImport,
    onBack,
}: BulkImportPreviewProps) {
    const [page, setPage] = useState(0);
    const rowsPerPage = 5;

    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const paginatedRows = rows.slice(
        page * rowsPerPage,
        (page + 1) * rowsPerPage
    );

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                    <p className="text-2xl font-bold">{rows.length}</p>
                    <p className="text-xs text-muted-foreground">Total Rows</p>
                </div>
                <div className="rounded-lg border p-4 text-center border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600">
                        {validRows.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Valid</p>
                </div>
                <div className="rounded-lg border p-4 text-center border-destructive/20">
                    <p className="text-2xl font-bold text-destructive">
                        {invalidRows.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Invalid</p>
                </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4 rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center gap-4">
                    <Label className="text-sm">Duplicate Handling</Label>
                    <Select
                        value={duplicateHandling}
                        onValueChange={(value: "skip" | "update") =>
                            onDuplicateHandlingChange(value)
                        }
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="skip">Skip</SelectItem>
                            <SelectItem value="update">Update</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {duplicateHandling === "skip"
                            ? "Skip duplicate members"
                            : "Update existing members"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Switch
                        id="skip-invalid"
                        checked={skipInvalidRows}
                        onCheckedChange={onSkipInvalidRowsChange}
                    />
                    <Label htmlFor="skip-invalid" className="text-sm">
                        Skip invalid rows
                    </Label>
                </div>
            </div>

            {/* Table Preview */}
            <div className="rounded-lg border">
                <ScrollArea className="h-[300px]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead className="w-16">Status</TableHead>
                                {headers.slice(0, 6).map((header) => (
                                    <TableHead key={header}>{header}</TableHead>
                                ))}
                                {headers.length > 6 && (
                                    <TableHead>...</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRows.map((row) => (
                                <TableRow
                                    key={row.rowNumber}
                                    className={cn(
                                        !row.isValid && "bg-destructive/5"
                                    )}
                                >
                                    <TableCell className="text-xs text-muted-foreground">
                                        {row.rowNumber}
                                    </TableCell>
                                    <TableCell>
                                        {row.isValid ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        )}
                                    </TableCell>
                                    {headers.slice(0, 6).map((header) => (
                                        <TableCell key={header} className="max-w-[150px] truncate">
                                            {row.data[header] || (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                    ))}
                                    {headers.length > 6 && (
                                        <TableCell className="text-muted-foreground">
                                            +{headers.length - 6} more
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {page * rowsPerPage + 1}-
                        {Math.min((page + 1) * rowsPerPage, rows.length)} of {rows.length}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button
                    onClick={onImport}
                    disabled={validRows.length === 0}
                    className="gap-2"
                >
                    Import {validRows.length} Members
                </Button>
            </div>
        </div>
    );
}