// hooks/use-bulk-import.ts

"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseImportFile } from "@/actions/bulk-import/parse-file";
import { importMembers } from "@/actions/bulk-import/import-members";
import type { ImportRow, BulkImportOptions } from "@/lib/types/bulk-import";

export function useBulkImport() {
    const [parsedRows, setParsedRows] = useState<ImportRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);

    const parseMutation = useMutation({
        mutationFn: ({
            fileContent,
            fileType,
        }: {
            fileContent: string | ArrayBuffer;
            fileType: "csv" | "xlsx";
        }) => parseImportFile(fileContent, fileType),
        onSuccess: (result) => {
            setHeaders(result.headers);
            setParsedRows(result.rows);
        },
    });

    const importMutation = useMutation({
        mutationFn: ({
            rows,
            options,
        }: {
            rows: ImportRow[];
            options: BulkImportOptions;
        }) => importMembers(rows, options),
    });

    const reset = useCallback(() => {
        setParsedRows([]);
        setHeaders([]);
        parseMutation.reset();
        importMutation.reset();
    }, [parseMutation, importMutation]);

    return {
        // Parse
        parseFile: parseMutation.mutateAsync,
        isParsing: parseMutation.isPending,
        parseError: parseMutation.error,
        headers,
        parsedRows,

        // Import
        importMembers: importMutation.mutateAsync,
        isImporting: importMutation.isPending,
        importResult: importMutation.data,
        importError: importMutation.error,

        // State
        validRows: parsedRows.filter((row) => row.isValid),
        invalidRows: parsedRows.filter((row) => !row.isValid),
        hasData: parsedRows.length > 0,

        // Actions
        reset,
    };
}