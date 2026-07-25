// lib/types/bulk-import.ts

export interface BulkImportColumn {
    key: string;
    label: string;
    required?: boolean;
    description?: string;
}

export interface ImportRow {
    rowNumber: number;
    data: Record<string, string | null>;
    errors: ImportError[];
    warnings: ImportWarning[];
    isValid: boolean;
}

export interface ImportError {
    column: string;
    message: string;
    rowNumber: number;
}

export interface ImportWarning {
    column: string;
    message: string;
    rowNumber: number;
}

export interface ImportSummary {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    importedRows: number;
    failedRows: number;
    errors: ImportError[];
    warnings: ImportWarning[];
    duplicates: ImportDuplicate[];
}

export interface ImportDuplicate {
    rowNumber: number;
    membershipId?: string;
    email?: string;
    existingMember: {
        id: string;
        firstName: string;
        lastName: string;
        membershipId?: string;
    };
}

export interface ImportHistoryEntry {
    id: string;
    fileName: string;
    totalRows: number;
    importedRows: number;
    failedRows: number;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: string;
    userId: string;
    metadata: {
        fileSize: number;
        columns: string[];
        duplicateHandling: "skip" | "update";
    };
}

export interface BulkImportOptions {
    duplicateHandling: "skip" | "update";
    skipInvalidRows: boolean;
    sendNotifications: boolean;
}