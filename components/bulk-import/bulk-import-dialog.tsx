// components/bulk-import/bulk-import-dialog.tsx

"use client";

import { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Users, FileSpreadsheet, X } from "lucide-react";
import { BulkImportUpload } from "./bulk-import-upload";
import { BulkImportPreview } from "./bulk-import-preview";
import { BulkImportProgress } from "./bulk-import-progress";
import { BulkImportValidation } from "./bulk-import-validation";
import { useBulkImport } from "@/hooks/use-bulk-import";

interface BulkImportDialogProps {
    trigger?: React.ReactNode;
    onComplete?: () => void;
}

type Step = "upload" | "preview" | "validation" | "progress" | "complete";

export function BulkImportDialog({
    trigger,
    onComplete,
}: BulkImportDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [duplicateHandling, setDuplicateHandling] = useState<"skip" | "update">("skip");
    const [skipInvalidRows, setSkipInvalidRows] = useState(true);

    const {
        parseFile,
        isParsing,
        parsedRows,
        headers,
        validRows,
        invalidRows,
        importMembers,
        isImporting,
        importResult,
        reset,
    } = useBulkImport();

    const handleFileSelect = useCallback(
        async (selectedFile: File) => {
            setFile(selectedFile);
            const fileType = selectedFile.name.endsWith(".csv") ? "csv" : "xlsx";
            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target?.result;
                if (!content) return;

                try {
                    await parseFile({
                        fileContent: content,
                        fileType,
                    });
                    setStep("preview");
                } catch (error) {
                    console.error("Failed to parse file:", error);
                }
            };

            if (fileType === "csv") {
                reader.readAsText(selectedFile);
            } else {
                reader.readAsArrayBuffer(selectedFile);
            }
        },
        [parseFile]
    );

    const handleImport = useCallback(async () => {
        setStep("progress");

        try {
            await importMembers({
                rows: validRows,
                options: {
                    duplicateHandling,
                    skipInvalidRows,
                    sendNotifications: false,
                },
            });
            setStep("complete");
            if (onComplete) onComplete();
        } catch (error) {
            console.error("Import failed:", error);
            setStep("validation");
        }
    }, [validRows, duplicateHandling, skipInvalidRows, importMembers, onComplete]);

    const handleReset = useCallback(() => {
        reset();
        setFile(null);
        setStep("upload");
    }, [reset]);

    const handleClose = useCallback(() => {
        handleReset();
        setOpen(false);
    }, [handleReset]);

    const defaultTrigger = (
        <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Import Members
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        Bulk Import Members
                    </DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file to import multiple members at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {step === "upload" && (
                        <BulkImportUpload
                            onFileSelect={handleFileSelect}
                            isProcessing={isParsing}
                        />
                    )}

                    {step === "preview" && (
                        <BulkImportPreview
                            headers={headers}
                            rows={parsedRows}
                            validRows={validRows}
                            invalidRows={invalidRows}
                            duplicateHandling={duplicateHandling}
                            onDuplicateHandlingChange={setDuplicateHandling}
                            skipInvalidRows={skipInvalidRows}
                            onSkipInvalidRowsChange={setSkipInvalidRows}
                            onImport={handleImport}
                            onBack={() => setStep("upload")}
                        />
                    )}

                    {step === "validation" && (
                        <BulkImportValidation
                            rows={parsedRows}
                            validRows={validRows}
                            invalidRows={invalidRows}
                            onImport={handleImport}
                            onBack={() => setStep("preview")}
                        />
                    )}

                    {step === "progress" && (
                        <BulkImportProgress
                            totalRows={validRows.length}
                            importedRows={importResult?.summary?.importedRows || 0}
                            failedRows={importResult?.summary?.failedRows || 0}
                            isComplete={false}
                        />
                    )}

                    {step === "complete" && importResult && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center">
                                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                                    <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">Import Complete!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Successfully imported {importResult.summary.importedRows} members
                                    {importResult.summary.failedRows > 0 &&
                                        ` with ${importResult.summary.failedRows} failures`}
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="rounded-lg border p-4 text-center">
                                    <p className="text-2xl font-bold">{importResult.summary.totalRows}</p>
                                    <p className="text-xs text-muted-foreground">Total Rows</p>
                                </div>
                                <div className="rounded-lg border p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {importResult.summary.importedRows}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Imported</p>
                                </div>
                                <div className="rounded-lg border p-4 text-center">
                                    <p className="text-2xl font-bold text-destructive">
                                        {importResult.summary.failedRows}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Failed</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={handleReset}>
                                    Import More
                                </Button>
                                <Button onClick={handleClose}>
                                    Done
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}