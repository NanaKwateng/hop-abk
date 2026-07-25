// components/bulk-import/bulk-import-validation.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportRow } from "@/lib/types/bulk-import";

interface BulkImportValidationProps {
    rows: ImportRow[];
    validRows: ImportRow[];
    invalidRows: ImportRow[];
    onImport: () => void;
    onBack: () => void;
}

export function BulkImportValidation({
    rows,
    validRows,
    invalidRows,
    onImport,
    onBack,
}: BulkImportValidationProps) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (rowNumber: number) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(rowNumber)) {
                next.delete(rowNumber);
            } else {
                next.add(rowNumber);
            }
            return next;
        });
    };

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {validRows.length} Valid
                    </Badge>
                    <Badge variant="outline" className="gap-1 border-destructive text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {invalidRows.length} Invalid
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onBack}>
                        Back
                    </Button>
                    <Button
                        size="sm"
                        onClick={onImport}
                        disabled={validRows.length === 0}
                    >
                        Import {validRows.length} Valid Rows
                    </Button>
                </div>
            </div>

            {/* Invalid Rows */}
            {invalidRows.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-destructive">
                        Invalid Rows ({invalidRows.length})
                    </h4>
                    <ScrollArea className="h-[300px] rounded-lg border">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Errors</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invalidRows.map((row) => (
                                    <>
                                        <TableRow
                                            key={row.rowNumber}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleRow(row.rowNumber)}
                                        >
                                            <TableCell className="font-medium">
                                                {row.rowNumber}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {row.errors.map((error, i) => (
                                                        <Badge
                                                            key={i}
                                                            variant="destructive"
                                                            className="text-xs"
                                                        >
                                                            {error.column}: {error.message}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {expandedRows.has(row.rowNumber) ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        {expandedRows.has(row.rowNumber) && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="bg-muted/30 p-4">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        {Object.entries(row.data).map(
                                                            ([key, value]) => (
                                                                <div
                                                                    key={key}
                                                                    className="flex justify-between"
                                                                >
                                                                    <span className="text-muted-foreground">
                                                                        {key}:
                                                                    </span>
                                                                    <span className="font-mono">
                                                                        {value || (
                                                                            <span className="text-muted-foreground">
                                                                                —
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            )}

            {/* Valid Rows Summary */}
            {validRows.length > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30 p-4">
                    <p className="text-sm text-green-700 dark:text-green-300">
                        <CheckCircle2 className="inline h-4 w-4 mr-2" />
                        {validRows.length} rows are valid and ready to import.
                    </p>
                </div>
            )}
        </div>
    );
}