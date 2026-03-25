// components/admin-settings/impersonation-panel.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Eye,
    Search,
    Loader2,
    ExternalLink,
    Users,
    Clock,
} from "lucide-react";
import { useMembersQuery } from "@/queries/member-queries";
import { useDebounce } from "@/hooks/use-debounce";
import { logImpersonation } from "@/actions/admin-settings";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ImpersonationLogEntry } from "@/lib/types/admin-settings";

interface ImpersonationPanelProps {
    logs: ImpersonationLogEntry[];
    currentUserId: string;
}

export function ImpersonationPanel({
    logs,
    currentUserId,
}: ImpersonationPanelProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();
    const debouncedSearch = useDebounce(search, 300);

    const { data, isLoading } = useMembersQuery({
        page: 1,
        pageSize: 20,
        search: debouncedSearch,
    });

    async function handleImpersonate(memberId: string) {
        startTransition(async () => {
            try {
                await logImpersonation(memberId);
                toast.success("Impersonation logged.");
                router.push(`/admin/users/${memberId}`);
            } catch (error: any) {
                toast.error(error.message);
            }
        });
    }

    return (
        <div className="space-y-6 w-full min-w-0">
            {/* ── Member Lookup ── */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Impersonate Member
                    </CardTitle>
                    <CardDescription>
                        View a member&apos;s profile as if you were them.
                        All impersonation actions are logged for
                        accountability.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search members by name, email, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Results */}
                    {search.trim() && (
                        <div className="border rounded-lg overflow-hidden">
                            <ScrollArea className="max-h-[350px]">
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2 py-8">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Searching...
                                        </span>
                                    </div>
                                ) : (data?.data ?? []).length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-8">
                                        <Users className="h-6 w-6 text-muted-foreground/40" />
                                        <p className="text-sm text-muted-foreground">
                                            No members found.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {(data?.data ?? []).map((member) => {
                                            const initials =
                                                (member.firstName?.[0] ??
                                                    "") +
                                                (member.lastName?.[0] ??
                                                    "");

                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                                                >
                                                    <Avatar className="h-8 w-8 shrink-0 border">
                                                        <AvatarImage
                                                            src={
                                                                member.avatarUrl ||
                                                                ""
                                                            }
                                                        />
                                                        <AvatarFallback className="text-[10px]">
                                                            {initials.toUpperCase() ||
                                                                "?"}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {
                                                                member.firstName
                                                            }{" "}
                                                            {
                                                                member.lastName
                                                            }
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground truncate">
                                                            {member.membershipId ??
                                                                "—"}
                                                            {member.email &&
                                                                ` · ${member.email}`}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="shrink-0"
                                                        onClick={() =>
                                                            handleImpersonate(
                                                                member.id
                                                            )
                                                        }
                                                        disabled={isPending}
                                                    >
                                                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                                        View
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Impersonation History ── */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Impersonation History
                    </CardTitle>
                    <CardDescription>
                        Recent impersonation events for audit purposes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <Eye className="h-8 w-8 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">
                                No impersonation events recorded.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[180px]">
                                            Admin
                                        </TableHead>
                                        <TableHead className="min-w-[180px]">
                                            Viewed Member
                                        </TableHead>
                                        <TableHead className="text-right min-w-[120px]">
                                            When
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.slice(0, 50).map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {log.adminName ||
                                                            "Unknown"}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground truncate">
                                                        {log.adminEmail ??
                                                            "—"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {log.targetName ||
                                                            "Unknown"}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground truncate">
                                                        {log.targetEmail ??
                                                            "—"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {format(
                                                        new Date(
                                                            log.createdAt
                                                        ),
                                                        "MMM d, HH:mm"
                                                    )}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}