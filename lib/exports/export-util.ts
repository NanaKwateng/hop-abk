// src/lib/exports/export-utils.ts

import type { Member } from "@/lib/types";
import {
    EXPORTABLE_COLUMNS,
    POSITION_LABELS,
    GROUP_LABELS,
    OCCUPATION_LABELS,
    GENDER_LABELS,
} from "@/lib/constants";

/**
 * Format a member field value for export.
 * Converts enum values to human-readable labels.
 */
function formatFieldValue(member: Member, field: keyof Member): string {
    const value = member[field];
    if (value === null || value === undefined) return "";

    const str = String(value);

    // Convert enum values to readable labels
    switch (field) {
        case "memberPosition":
            return POSITION_LABELS[str] || str;
        case "memberGroup":
            return GROUP_LABELS[str] || str;
        case "occupationType":
            return OCCUPATION_LABELS[str] || str;
        case "gender":
            return GENDER_LABELS[str] || str;
        case "createdAt":
            return new Date(str).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        default:
            return str;
    }
}

/**
 * Convert members array to CSV string.
 */
export function membersToCSV(
    members: Member[],
    columns: (keyof Member)[]
): string {
    const headers = columns.map((col) => {
        const found = EXPORTABLE_COLUMNS.find((c) => c.value === col);
        return found ? found.label : col;
    });

    const rows = members.map((member) =>
        columns.map((col) => {
            let value = formatFieldValue(member, col);
            value = value.replace(/"/g, '""');
            return `"${value}"`;
        })
    );

    const headerRow = headers.map((h) => `"${h}"`).join(",");
    const dataRows = rows.map((row) => row.join(",")).join("\n");

    return `${headerRow}\n${dataRows}`;
}

/**
 * Trigger file download in the browser.
 */
export function downloadFile(
    content: string,
    fileName: string,
    mimeType: string
): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export members to CSV.
 */
export function exportToCSV(
    members: Member[],
    columns: (keyof Member)[],
    fileName: string = "members-export"
): void {
    const csv = membersToCSV(members, columns);
    const csvWithBOM = "\uFEFF" + csv;
    downloadFile(csvWithBOM, `${fileName}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Export members to Excel-compatible HTML table.
 */
export function exportToExcel(
    members: Member[],
    columns: (keyof Member)[],
    fileName: string = "members-export"
): void {
    const headers = columns.map((col) => {
        const found = EXPORTABLE_COLUMNS.find((c) => c.value === col);
        return found ? found.label : col;
    });

    let html = "<html><head><meta charset='utf-8'></head><body>";
    html += "<table border='1'>";

    html += "<tr>";
    headers.forEach((h) => {
        html += `<th style="background-color:#4472C4;color:white;font-weight:bold;padding:8px">${h}</th>`;
    });
    html += "</tr>";

    members.forEach((member, index) => {
        const bgColor = index % 2 === 0 ? "#ffffff" : "#f2f2f2";
        html += `<tr style="background-color:${bgColor}">`;
        columns.forEach((col) => {
            html += `<td style="padding:6px">${formatFieldValue(member, col)}</td>`;
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