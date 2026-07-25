// actions/bulk-import/parse-file.ts

"use server";

import * as XLSX from "xlsx";
import { z } from "zod";
import { importRowSchema } from "@/lib/validations/bulk-import";
import type { ImportRow, ImportError } from "@/lib/types/bulk-import";

interface ParseResult {
    headers: string[];
    rows: ImportRow[];
    totalRows: number;
    errors: ImportError[];
}

export async function parseImportFile(
    fileContent: string | ArrayBuffer,
    fileType: "csv" | "xlsx"
): Promise<ParseResult> {
    try {
        // Parse the file
        let data: any[][];
        let headers: string[];

        if (fileType === "csv") {
            const workbook = XLSX.read(fileContent as string, { type: "string" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            data = jsonData as any[][];
        } else {
            const workbook = XLSX.read(fileContent as ArrayBuffer, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            data = jsonData as any[][];
        }

        if (data.length === 0) {
            throw new Error("File is empty");
        }

        // Extract headers from first row
        headers = data[0].map((cell) => String(cell).trim());
        const headerSet = new Set(headers.map((h) => h.toLowerCase()));

        // Define expected columns
        const expectedColumns = [
            "firstName",
            "lastName",
            "email",
            "phone",
            "gender",
            "membershipId",
            "placeOfStay",
            "houseNumber",
            "memberPosition",
            "memberGroup",
            "occupationType",
            "nickname",
        ];

        // Check for required columns
        const requiredColumns = ["firstName", "lastName"];
        const missingRequired = requiredColumns.filter(
            (col) => !headerSet.has(col.toLowerCase())
        );

        if (missingRequired.length > 0) {
            throw new Error(
                `Missing required columns: ${missingRequired.join(", ")}. ` +
                `Please ensure your file has these columns.`
            );
        }

        // Validate rows
        const rows: ImportRow[] = [];
        const allErrors: ImportError[] = [];

        for (let i = 1; i < data.length; i++) {
            const rowData = data[i];
            const row: Record<string, string | null> = {};

            // Map row data to columns
            headers.forEach((header, index) => {
                const value = rowData[index];
                row[header] = value !== undefined && value !== null ? String(value).trim() : null;
            });

            // Create a normalized data object
            const normalizedData: Record<string, string | null> = {};
            expectedColumns.forEach((col) => {
                const headerKey = headers.find(
                    (h) => h.toLowerCase() === col.toLowerCase()
                );
                normalizedData[col] = headerKey ? row[headerKey] || null : null;
            });

            // Validate the row
            const rowErrors: ImportError[] = [];
            const rowWarnings: ImportError[] = [];

            try {
                const validated = importRowSchema.parse(normalizedData);

                // Additional business logic validation
                if (validated.email && !validated.email.includes("@")) {
                    rowErrors.push({
                        column: "email",
                        message: "Invalid email format",
                        rowNumber: i + 1,
                    });
                }

                // Check if membership ID format is valid
                if (validated.membershipId && !/^[A-Z]{2,5}-[A-Z]{2,5}-\d{3,5}$/.test(validated.membershipId)) {
                    rowWarnings.push({
                        column: "membershipId",
                        message: "Membership ID format may be invalid. Expected format: HOP-ABK-001",
                        rowNumber: i + 1,
                    });
                }

            } catch (error) {
                if (error instanceof z.ZodError) {
                    // ✅ FIXED: Use 'issues' instead of 'errors'
                    error.issues.forEach((err) => {
                        const path = err.path.join(".");
                        rowErrors.push({
                            column: path || "unknown",
                            message: err.message,
                            rowNumber: i + 1,
                        });
                    });
                }
            }

            rows.push({
                rowNumber: i + 1,
                data: normalizedData as Record<string, string | null>,
                errors: rowErrors,
                warnings: rowWarnings,
                isValid: rowErrors.length === 0,
            });

            allErrors.push(...rowErrors);
        }

        return {
            headers,
            rows,
            totalRows: rows.length,
            errors: allErrors,
        };
    } catch (error) {
        console.error("[Parse File] Error:", error);
        throw new Error(
            error instanceof Error ? error.message : "Failed to parse file"
        );
    }
}