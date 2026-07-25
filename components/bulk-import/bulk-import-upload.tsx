// components/bulk-import/bulk-import-upload.tsx

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, X, File, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BulkImportUploadProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
}

export function BulkImportUpload({
    onFileSelect,
    isProcessing,
}: BulkImportUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setError(null);
            const file = acceptedFiles[0];

            if (!file) return;

            // Validate file type
            const validTypes = [
                "text/csv",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ];
            const fileExtension = file.name.split(".").pop()?.toLowerCase();

            if (!validTypes.includes(file.type) && !["csv", "xlsx"].includes(fileExtension || "")) {
                setError("Please upload a CSV or Excel file (.csv, .xlsx)");
                return;
            }

            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError("File must be less than 10MB");
                return;
            }

            setSelectedFile(file);
            onFileSelect(file);
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/vnd.ms-excel": [".xls"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
                ".xlsx",
            ],
        },
        maxFiles: 1,
        multiple: false,
        disabled: isProcessing,
    });

    const removeFile = () => {
        setSelectedFile(null);
        setError(null);
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
                    isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50",
                    isProcessing && "pointer-events-none opacity-50",
                    error && "border-destructive"
                )}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-3 text-center">
                    {isProcessing ? (
                        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                    ) : (
                        <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                    )}

                    <div>
                        <p className="text-lg font-medium">
                            {isDragActive ? "Drop your file here" : "Drag & drop your file"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            or click to browse
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                        <Badge variant="outline">CSV</Badge>
                        <Badge variant="outline">XLSX</Badge>
                        <Badge variant="outline">Max 10MB</Badge>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Selected File */}
            {selectedFile && !isProcessing && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                        <File className="h-8 w-8 text-primary" />
                        <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        disabled={isProcessing}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}