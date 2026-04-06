// components/dashboard/tasks/task-export-menu.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/task-utils";
import type { TaskDetail, TaskActivity } from "@/lib/types/task";

interface TaskExportMenuProps {
    task: TaskDetail;
    activities: TaskActivity[];
}

export function TaskExportMenu({ task, activities }: TaskExportMenuProps) {
    const [isExporting, setIsExporting] = useState(false);

    function exportToCSV() {
        setIsExporting(true);

        try {
            const columns = [
                { header: "Member Name", key: "memberName" },
                { header: "Membership ID", key: "membershipId" },
                { header: "Activity Type", key: "activityType" },
                { header: "Title", key: "title" },
                { header: "Description", key: "description" },
                ...(task.purpose === "payments"
                    ? [{ header: "Amount (GH₵)", key: "amount" }]
                    : []),
                ...(task.purpose === "payments"
                    ? [{ header: "Payment Date", key: "paymentDate" }]
                    : []),
                ...(task.purpose === "payments"
                    ? [{ header: "Period", key: "period" }]
                    : []),
                { header: "Status", key: "status" },
                { header: "Date Recorded", key: "date" },
            ];

            const data = activities.map((activity) => {
                const member = task.members.find((m) => m.memberId === activity.memberId);

                return {
                    memberName: `${activity.memberFirstName} ${activity.memberLastName}`,
                    membershipId: member?.membershipId ?? "—",
                    activityType: activity.activityType.toUpperCase(),
                    title: activity.roleTitle ?? activity.title ?? "",
                    description: activity.roleDescription ?? activity.description ?? activity.monitorNote ?? "",
                    amount: activity.amount != null ? activity.amount.toFixed(2) : "",
                    paymentDate: activity.paymentDate
                        ? format(new Date(activity.paymentDate), "MMM d, yyyy")
                        : "",
                    period: activity.paymentPeriod ?? "",
                    status: activity.paymentStatus?.toUpperCase() ?? activity.monitorStatus?.toUpperCase() ?? "COMPLETED",
                    date: format(new Date(activity.createdAt), "MMM d, yyyy"),
                };
            });

            const fileName = `${task.slug}-activities-${format(new Date(), "yyyy-MM-dd")}`;

            const headerRow = columns.map((c) => `"${c.header}"`).join(",");
            const rows = data.map((d) =>
                columns
                    .map((c) => {
                        const val = String(d[c.key as keyof typeof d] ?? "");
                        return `"${val.replace(/"/g, '""')}"`;
                    })
                    .join(",")
            );

            const csvContent = "\uFEFF" + [headerRow, ...rows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success("CSV exported successfully");
        } catch (error) {
            toast.error("Failed to export CSV");
        } finally {
            setIsExporting(false);
        }
    }

    function exportToExcel() {
        setIsExporting(true);

        try {
            const columns = [
                { header: "Member Name", key: "memberName" },
                { header: "Membership ID", key: "membershipId" },
                { header: "Activity Type", key: "activityType" },
                { header: "Title", key: "title" },
                { header: "Description", key: "description" },
                ...(task.purpose === "payments"
                    ? [{ header: "Amount (GH₵)", key: "amount" }]
                    : []),
                ...(task.purpose === "payments"
                    ? [{ header: "Payment Date", key: "paymentDate" }]
                    : []),
                { header: "Status", key: "status" },
                { header: "Date Recorded", key: "date" },
            ];

            const data = activities.map((activity) => {
                const member = task.members.find((m) => m.memberId === activity.memberId);

                return {
                    memberName: `${activity.memberFirstName} ${activity.memberLastName}`,
                    membershipId: member?.membershipId ?? "—",
                    activityType: activity.activityType.toUpperCase(),
                    title: activity.roleTitle ?? activity.title ?? "",
                    description: activity.roleDescription ?? activity.description ?? activity.monitorNote ?? "",
                    amount: activity.amount != null ? formatCurrency(activity.amount) : "",
                    paymentDate: activity.paymentDate
                        ? format(new Date(activity.paymentDate), "MMM d, yyyy")
                        : "",
                    status: activity.paymentStatus?.toUpperCase() ?? activity.monitorStatus?.toUpperCase() ?? "COMPLETED",
                    date: format(new Date(activity.createdAt), "MMM d, yyyy"),
                };
            });

            const fileName = `${task.slug}-activities-${format(new Date(), "yyyy-MM-dd")}`;

            let html = "<html><head><meta charset='utf-8'></head><body>";
            html += "<table border='1'>";
            html += "<tr>";
            columns.forEach((c) => {
                html += `<th style="background-color:#4472C4;color:white;font-weight:bold;padding:8px">${c.header}</th>`;
            });
            html += "</tr>";

            data.forEach((d, i) => {
                const bgColor = i % 2 === 0 ? "#ffffff" : "#f2f2f2";
                html += `<tr style="background-color:${bgColor}">`;
                columns.forEach((c) => {
                    html += `<td style="padding:6px">${d[c.key as keyof typeof d]}</td>`;
                });
                html += "</tr>";
            });

            html += "</table></body></html>";

            const blob = new Blob([html], {
                type: "application/vnd.ms-excel;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.xls`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success("Excel file exported successfully");
        } catch (error) {
            toast.error("Failed to export Excel");
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                    {isExporting ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-3.5 w-3.5" />
                    )}
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
                    <FileText className="mr-2 h-4 w-4" />
                    CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel} disabled={isExporting}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}