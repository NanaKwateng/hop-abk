// src/lib/export-utils.ts
// ============================================================
// Handles exporting user data to CSV and Excel formats.
// 
// CSV = Comma Separated Values (opens in Excel, Google Sheets)
// XLSX = Native Excel format (needs a library, we use simple CSV approach)
//
// The user can choose:
//   - Which columns to export (e.g., only phone numbers)
//   - Which rows to export (all, filtered, or selected)
//   - File format (CSV or Excel-compatible)
// ============================================================

import { User } from "@/lib/types/user-table-types";
import { EXPORTABLE_COLUMNS } from "@/lib/constants/index";

/**
 * Convert an array of users to CSV string.
 * 
 * @param users - Array of user objects to export
 * @param columns - Which fields/columns to include
 * @returns CSV-formatted string
 * 
 * Example output:
 * "User ID","First Name","Email"
 * "USR-0001","James","james@gmail.com"
 * "USR-0002","Mary","mary@yahoo.com"
 */
export function usersToCSV(
    users: User[],
    columns: (keyof User)[]
): string {
    // Step 1: Create header row
    // Find the human-readable label for each column key
    const headers = columns.map((col) => {
        const found = EXPORTABLE_COLUMNS.find((c) => c.value === col);
        return found ? found.label : col; // fallback to key if label not found
    });

    // Step 2: Create data rows
    const rows = users.map((user) =>
        columns.map((col) => {
            let value = String(user[col] ?? ""); // convert to string, handle null/undefined

            // Escape quotes and wrap in quotes (CSV standard for values with commas)
            value = value.replace(/"/g, '""'); // double-up any quotes
            return `"${value}"`;
        })
    );

    // Step 3: Combine headers and rows with newlines
    const headerRow = headers.map((h) => `"${h}"`).join(",");
    const dataRows = rows.map((row) => row.join(",")).join("\n");

    return `${headerRow}\n${dataRows}`;
}

/**
 * Trigger a file download in the browser.
 * 
 * How it works:
 * 1. Create an invisible <a> element
 * 2. Set its href to a "blob URL" (the file data in memory)
 * 3. Set the download attribute (tells browser to download, not navigate)
 * 4. Click it programmatically
 * 5. Clean up
 */
export function downloadFile(
    content: string,
    fileName: string,
    mimeType: string
): void {
    // Create a Blob (Binary Large Object) from the string content
    const blob = new Blob([content], { type: mimeType });

    // Create a temporary URL pointing to this blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName; // This is the filename the user sees

    // Add to page, click, remove (happens instantly, user doesn't see it)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Free the blob URL from memory
    URL.revokeObjectURL(url);
}

/**
 * Export users to CSV file.
 * This is the main function called by the Export button.
 */
export function exportToCSV(
    users: User[],
    columns: (keyof User)[],
    fileName: string = "members-export"
): void {
    const csv = usersToCSV(users, columns);
    // Add BOM (Byte Order Mark) for proper UTF-8 encoding in Excel
    const csvWithBOM = "\uFEFF" + csv;
    downloadFile(csvWithBOM, `${fileName}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Export users to Excel-compatible format.
 * We use TSV (Tab Separated Values) with .xls extension.
 * Excel opens this natively without any additional library.
 * 
 * For true .xlsx format, you'd use a library like 'xlsx' or 'exceljs',
 * but this approach works great without extra dependencies.
 */
export function exportToExcel(
    users: User[],
    columns: (keyof User)[],
    fileName: string = "members-export"
): void {
    // Get human-readable headers
    const headers = columns.map((col) => {
        const found = EXPORTABLE_COLUMNS.find((c) => c.value === col);
        return found ? found.label : col;
    });

    // Build HTML table (Excel can open HTML tables natively)
    let html = "<html><head><meta charset='utf-8'></head><body>";
    html += "<table border='1'>";

    // Header row
    html += "<tr>";
    headers.forEach((h) => {
        html += `<th style="background-color:#4472C4;color:white;font-weight:bold;padding:8px">${h}</th>`;
    });
    html += "</tr>";

    // Data rows
    users.forEach((user, index) => {
        const bgColor = index % 2 === 0 ? "#ffffff" : "#f2f2f2"; // alternating row colors
        html += `<tr style="background-color:${bgColor}">`;
        columns.forEach((col) => {
            html += `<td style="padding:6px">${user[col] ?? ""}</td>`;
        });
        html += "</tr>";
    });

    html += "</table></body></html>";

    downloadFile(
        html,
        `${fileName}.xls`,
        "application/vnd.ms-excel;charset=utf-8;"
    );
}