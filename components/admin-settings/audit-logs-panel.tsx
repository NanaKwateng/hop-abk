// components/admin-settings/audit-logs-panel.tsx
"use client";

import React, { useState, useMemo } from "react"; // FIX: added React import for Fragment
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollText, Search, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { AuditLogEntry } from "@/lib/types/admin-settings";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    admin_added: { label: "Admin Added", color: "bg-green-500/10 text-green-600" },
    admin_removed: { label: "Admin Removed", color: "bg-red-500/10 text-red-600" },
    admin_invited: { label: "Admin Invited", color: "bg-blue-500/10 text-blue-600" },
    admin_invite_accepted: { label: "Invite Accepted", color: "bg-green-500/10 text-green-600" },
    admin_invite_revoked: { label: "Invite Revoked", color: "bg-orange-500/10 text-orange-600" },
    impersonation: { label: "Impersonation", color: "bg-purple-500/10 text-purple-600" },
    profile_updated: { label: "Profile Updated", color: "bg-blue-500/10 text-blue-600" },
    email_changed: { label: "Email Changed", color: "bg-yellow-500/10 text-yellow-700" },
    member_linked: { label: "Member Linked", color: "bg-green-500/10 text-green-600" },
};

interface AuditLogsPanelProps {
    logs: AuditLogEntry[];
}

export function AuditLogsPanel({ logs }: AuditLogsPanelProps) {
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return logs;
        const q = search.toLowerCase();
        return logs.filter(
            (l) =>
                l.action.toLowerCase().includes(q) ||
                l.userEmail?.toLowerCase().includes(q) ||
                l.userName?.toLowerCase().includes(q) ||
                l.entity?.toLowerCase().includes(q)
        );
    }, [logs, search]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5" />
                    Audit Logs
                </CardTitle>
                <CardDescription>
                    Complete history of admin actions. {logs.length} entries.
                </CardDescription>
                <div className="relative pt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-[25%] h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by action, email, or entity..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Action</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="hidden md:table-cell">Entity</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        {search ? "No matching logs." : "No audit logs yet."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.slice(0, 100).map((log) => {
                                    const config = ACTION_LABELS[log.action] ?? {
                                        label: log.action.replace(/_/g, " "),
                                        color: "bg-muted text-muted-foreground",
                                    };
                                    const isExpanded = expandedId === log.id;
                                    const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

                                    {/* FIX: <div> → <React.Fragment>
                                      *
                                      * HTML spec: <tbody> can only contain <tr> elements.
                                      * A <div> inside <tbody> is invalid and causes the
                                      * React hydration error you're seeing.
                                      *
                                      * React.Fragment groups multiple elements without
                                      * adding any DOM node — so <tbody> sees only <tr>s.
                                      *
                                      * We use <React.Fragment key={...}> instead of the
                                      * shorthand <> because we need the key prop.
                                      */}
                                    return (
                                        <React.Fragment key={log.id}>
                                            <TableRow
                                                className={cn(
                                                    hasMetadata && "cursor-pointer hover:bg-muted/50"
                                                )}
                                                onClick={() =>
                                                    hasMetadata &&
                                                    setExpandedId(isExpanded ? null : log.id)
                                                }
                                            >
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn("text-[10px] font-medium", config.color)}
                                                    >
                                                        {config.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <p className="font-medium">{log.userName || "System"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {log.userEmail ?? "—"}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                                                    {log.entity ?? "—"}
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                                    {format(new Date(log.createdAt), "MMM d, HH:mm")}
                                                </TableCell>
                                                <TableCell>
                                                    {hasMetadata && (
                                                        isExpanded ? (
                                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        )
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && hasMetadata && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="bg-muted/30 p-4">
                                                        <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                                                            {JSON.stringify(log.metadata, null, 2)}
                                                        </pre>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}