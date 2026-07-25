// components/bulk-import/bulk-import-progress.tsx

"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface BulkImportProgressProps {
    totalRows: number;
    importedRows: number;
    failedRows: number;
    isComplete: boolean;
}

export function BulkImportProgress({
    totalRows,
    importedRows,
    failedRows,
    isComplete,
}: BulkImportProgressProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (totalRows === 0) return;
        const percentage = ((importedRows + failedRows) / totalRows) * 100;
        setProgress(Math.min(percentage, 100));
    }, [importedRows, failedRows, totalRows]);

    const isDone = progress === 100;

    return (
        <div className="space-y-6 py-8">
            {/* Status */}
            <div className="flex flex-col items-center gap-4 text-center">
                {isComplete ? (
                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                ) : (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                )}

                <div>
                    <h3 className="text-lg font-semibold">
                        {isComplete ? "Import Complete!" : "Importing Members..."}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {isComplete
                            ? `Successfully imported ${importedRows} of ${totalRows} members`
                            : `Processing ${importedRows + failedRows} of ${totalRows} members`}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <Progress value={progress} className="h-2" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                    <p className="text-2xl font-bold">{totalRows}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="rounded-lg border p-4 text-center border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-600">
                        {importedRows}
                    </p>
                    <p className="text-xs text-muted-foreground">Imported</p>
                </div>
                <div className="rounded-lg border p-4 text-center border-destructive/20">
                    <p className="text-2xl font-bold text-destructive">
                        {failedRows}
                    </p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                </div>
            </div>

            {/* Status Messages */}
            {!isComplete && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Please wait...
                </div>
            )}

            {isComplete && failedRows > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                            {failedRows} rows failed to import
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400/80">
                            Review the validation report for details on failed rows.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}