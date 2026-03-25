// components/admin-settings/admin-management.tsx
"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Shield,
    ShieldCheck,
    Trash2,
    Loader2,
    Mail,
    Clock,
    UserPlus,
    Users,
    BadgeCheck,
    Search,
    X,
    CheckCircle2,
    MapPin,
    Hash,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import {
    addAdminFromMember,
    removeAdmin,
    revokeAdminInvite,
} from "@/actions/admin-settings";
import { useMembersQuery } from "@/queries/member-queries";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";
import type { AdminProfile, AdminInvite } from "@/lib/types/admin-settings";
import { FaUserTag } from "react-icons/fa6";

const MAX_ADMINS = 4;
const PAGE_SIZE = 20;

interface AdminManagementProps {
    data: {
        admins: AdminProfile[];
        invites: AdminInvite[];
        currentUserId: string;
        isPrimaryAdmin: boolean;
    };
}

export function AdminManagement({ data }: AdminManagementProps) {
    const { currentUserId, isPrimaryAdmin } = data;

    // ✅ FIX: Use router.refresh() instead of window.location.reload()
    // This re-runs server components and passes fresh props without a full page reload
    const router = useRouter();

    // ✅ FIX: Don't copy props into local state.
    // When we call router.refresh(), the server component re-fetches data
    // and passes new props. If we copy into useState, the component won't
    // update because useState only uses the initial value.
    //
    // Previously:
    //   const [admins, setAdmins] = useState(data.admins);
    //   const [invites, setInvites] = useState(data.invites);
    //
    // This meant after adding/removing an admin and calling router.refresh(),
    // the UI still showed stale data from the initial useState.
    const admins = data.admins;
    const invites = data.invites;

    // Sheet + picker state
    const [showPicker, setShowPicker] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [removeTarget, setRemoveTarget] = useState<AdminProfile | null>(null);
    const [revokeTarget, setRevokeTarget] = useState<AdminInvite | null>(null);
    const [isPending, startTransition] = useTransition();

    // ── Member search + pagination ──
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search, 300);

    // ✅ FIX: Replace hacky useState-as-ref pattern with proper useRef + useEffect.
    // Previously:
    //   const prevSearchRef = useState(debouncedSearch);
    //   if (prevSearchRef[0] !== debouncedSearch) {
    //       prevSearchRef[0] = debouncedSearch; // ❌ Mutating state array directly
    //       if (page !== 1) setPage(1);
    //   }
    //
    // This worked accidentally but is a React anti-pattern because:
    // 1. useState returns [value, setter] — mutating index 0 bypasses React
    // 2. It runs during render, which can cause inconsistent state
    const prevSearchRef = useRef(debouncedSearch);
    useEffect(() => {
        if (prevSearchRef.current !== debouncedSearch) {
            prevSearchRef.current = debouncedSearch;
            setPage(1);
        }
    }, [debouncedSearch]);

    const { data: membersData, isLoading: membersLoading } = useMembersQuery({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
    });

    const members = membersData?.data ?? [];
    const totalCount = membersData?.totalCount ?? 0;
    const totalPages = membersData?.totalPages ?? 1;

    const totalSlots = admins.length + invites.length;
    const canAdd = totalSlots < MAX_ADMINS;

    const adminEmails = useMemo(
        () => new Set(admins.map((a) => a.email.toLowerCase())),
        [admins]
    );

    async function handleAddAdmin() {
        if (!selectedMember) return;

        startTransition(async () => {
            try {
                await addAdminFromMember(selectedMember.id);
                toast.success(
                    `${selectedMember.firstName} ${selectedMember.lastName} is now an admin!`
                );
                closePicker();

                // ✅ FIX: Use router.refresh() to re-run server components
                // and get fresh admin list data, instead of window.location.reload()
                // which causes a jarring full-page reload and loses scroll position
                router.refresh();
            } catch (error: any) {
                toast.error(error.message);
            }
        });
    }

    async function handleRemove() {
        if (!removeTarget) return;
        startTransition(async () => {
            try {
                await removeAdmin(removeTarget.id);
                toast.success("Admin access removed.");

                // ✅ FIX: Refresh to get updated admin list from server
                // Previously used setAdmins(prev => prev.filter(...)) which
                // would work with local state, but since we removed local state,
                // we need router.refresh() to get fresh props
                router.refresh();
            } catch (error: any) {
                toast.error(error.message);
            } finally {
                setRemoveTarget(null);
            }
        });
    }

    async function handleRevoke() {
        if (!revokeTarget) return;
        startTransition(async () => {
            try {
                await revokeAdminInvite(revokeTarget.id);
                toast.success("Invite revoked.");

                // ✅ Same pattern — refresh from server
                router.refresh();
            } catch (error: any) {
                toast.error(error.message);
            } finally {
                setRevokeTarget(null);
            }
        });
    }

    function closePicker() {
        setShowPicker(false);
        setSelectedMember(null);
        setSearch("");
        setPage(1);
    }

    return (
        <div className="space-y-6">
            {/* ── Header Card ── */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Admin Management
                            </CardTitle>
                            <CardDescription>
                                {totalSlots}/{MAX_ADMINS} admin slots used.
                                {isPrimaryAdmin &&
                                    " You are the primary admin."}
                            </CardDescription>
                        </div>
                        {canAdd && (
                            <Button onClick={() => setShowPicker(true)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Admin
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* ── Active Admins ── */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Active Admins ({admins.length})
                </h3>

                {admins.map((admin) => {
                    const isMe = admin.id === currentUserId;
                    const initials =
                        (admin.firstName?.[0] ?? "") +
                        (admin.lastName?.[0] ?? "");

                    return (
                        <Card
                            key={admin.id}
                            className={cn(
                                isMe && "border-primary/30 bg-primary/[0.02]"
                            )}
                        >
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="relative shrink-0">
                                        <Avatar className="h-11 w-11">
                                            {admin.avatarUrl ? (
                                                <AvatarImage
                                                    src={admin.avatarUrl}
                                                />
                                            ) : null}
                                            <AvatarFallback className="font-medium">
                                                {initials.toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background">
                                            <BadgeCheck className="h-4 w-4 text-blue-500" />
                                        </div>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold truncate">
                                                {admin.firstName ?? ""}{" "}
                                                {admin.lastName ?? ""}
                                                {isMe && (
                                                    <span className="text-muted-foreground font-normal">
                                                        {" "}
                                                        (you)
                                                    </span>
                                                )}
                                            </p>
                                            {admin.isPrimaryAdmin && (
                                                <Badge
                                                    variant="default"
                                                    className="text-[10px] h-5 shrink-0"
                                                >
                                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                                    Primary
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                            <span className="flex items-center gap-1 truncate">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                {admin.email}
                                            </span>
                                            {admin.membershipId && (
                                                <span className="flex items-center gap-1 font-mono shrink-0">
                                                    <Hash className="h-3 w-3" />
                                                    {admin.membershipId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ✅ Only primary admin sees the remove button, 
                                     and only for non-primary, non-self admins */}
                                {isPrimaryAdmin &&
                                    !isMe &&
                                    !admin.isPrimaryAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={() =>
                                                setRemoveTarget(admin)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* ── Pending Invites ── */}
            {invites.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pending Invites ({invites.length})
                    </h3>

                    {invites.map((invite) => (
                        <Card key={invite.id} className="border-dashed">
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted shrink-0">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {invite.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Invited{" "}
                                            {format(
                                                new Date(invite.createdAt),
                                                "MMM d, yyyy"
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                    >
                                        Pending
                                    </Badge>
                                    {isPrimaryAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                                setRevokeTarget(invite)
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── Member Picker Sheet ── */}
            <Sheet open={showPicker} onOpenChange={(open) => !open && closePicker()}>
                <SheetContent
                    side="left"
                    className="h-[100dvh] flex flex-col p-0 gap-0 overflow-hidden rounded-none sm:rounded-b-xl"
                >
                    <SheetHeader className="shrink-0 px-6 pr-14 py-4 border-b bg-muted/30">
                        <SheetTitle className="flex items-center gap-2">
                            <FaUserTag className="h-5 w-5" />
                            Add Admin from Members
                        </SheetTitle>
                        <SheetDescription>
                            Search and select any member to grant admin
                            access. The member must have an email address.
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1 min-h-0 w-full overflow-hidden bg-background">
                        <div className="flex flex-col lg:flex-row h-full min-h-full">
                            {/* LEFT: Member list */}
                            <ScrollArea className="flex-1 min-h-0 w-full h-full">
                                <div className="flex flex-col h-full min-h-full min-w-0 border-r-0 lg:border-r">
                                    {/* Search bar */}
                                    <div className="shrink-0 p-4 border-b space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name, email, or membership ID..."
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    setPage(1);
                                                }}
                                                className="pl-9 h-10"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>
                                                {totalCount} member
                                                {totalCount !== 1 ? "s" : ""} found
                                                {debouncedSearch &&
                                                    ` for "${debouncedSearch}"`}
                                            </span>
                                            {totalPages > 1 && (
                                                <span>
                                                    Page {page} of {totalPages}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Member list */}
                                    <ScrollArea className="flex-1 min-h-0 w-full">
                                        {membersLoading ? (
                                            <div className="flex flex-col items-center justify-center gap-2 py-16">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Loading members...
                                                </p>
                                            </div>
                                        ) : members.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center gap-2 py-16">
                                                <Users className="h-8 w-8 text-muted-foreground/30" />
                                                <p className="text-sm text-muted-foreground">
                                                    No members found.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {members.map((member) => {
                                                    const isAlreadyAdmin =
                                                        member.email
                                                            ? adminEmails.has(
                                                                member.email.toLowerCase()
                                                            )
                                                            : false;
                                                    // ✅ Now that adminEmails contains ALL admins
                                                    // (not just current user), this check works correctly
                                                    const hasEmail = !!member.email?.trim();
                                                    const isSelected =
                                                        selectedMember?.id === member.id;
                                                    const initials =
                                                        (member.firstName?.[0] ?? "") +
                                                        (member.lastName?.[0] ?? "");
                                                    const isDisabled =
                                                        isAlreadyAdmin || !hasEmail;

                                                    return (
                                                        <div
                                                            key={member.id}
                                                            role="button"
                                                            tabIndex={isDisabled ? -1 : 0}
                                                            onClick={() => {
                                                                if (isDisabled) return;
                                                                setSelectedMember(member);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    !isDisabled &&
                                                                    (e.key === "Enter" ||
                                                                        e.key === " ")
                                                                ) {
                                                                    e.preventDefault();
                                                                    setSelectedMember(member);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "flex items-center gap-3 px-4 py-3 transition-colors outline-none",
                                                                isDisabled
                                                                    ? "opacity-40 cursor-not-allowed"
                                                                    : "cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50",
                                                                isSelected &&
                                                                !isDisabled &&
                                                                "bg-primary/5 border-l-2 border-primary"
                                                            )}
                                                        >
                                                            <Avatar className="h-9 w-9 shrink-0 border">
                                                                <AvatarImage
                                                                    src={member.avatarUrl || ""}
                                                                />
                                                                <AvatarFallback className="text-[10px] font-medium">
                                                                    {initials.toUpperCase() || "?"}
                                                                </AvatarFallback>
                                                            </Avatar>

                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">
                                                                    {member.firstName}{" "}
                                                                    {member.lastName}
                                                                </p>
                                                                <p className="text-[11px] text-muted-foreground truncate">
                                                                    {hasEmail
                                                                        ? member.email
                                                                        : "No email address"}
                                                                    {member.membershipId &&
                                                                        ` · ${member.membershipId}`}
                                                                </p>
                                                            </div>

                                                            {isAlreadyAdmin && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-[10px] shrink-0"
                                                                >
                                                                    Admin
                                                                </Badge>
                                                            )}
                                                            {!hasEmail && !isAlreadyAdmin && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] shrink-0 text-orange-600 border-orange-300"
                                                                >
                                                                    No email
                                                                </Badge>
                                                            )}
                                                            {isSelected && !isDisabled && (
                                                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </ScrollArea>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                                            <p className="text-xs text-muted-foreground">
                                                Showing{" "}
                                                {(page - 1) * PAGE_SIZE + 1}–
                                                {Math.min(page * PAGE_SIZE, totalCount)}{" "}
                                                of {totalCount}
                                            </p>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setPage(1)}
                                                    disabled={page === 1 || membersLoading}
                                                >
                                                    <ChevronsLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        setPage((p) => Math.max(1, p - 1))
                                                    }
                                                    disabled={page === 1 || membersLoading}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>

                                                <span className="px-3 text-sm font-medium tabular-nums">
                                                    {page}
                                                </span>

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        setPage((p) =>
                                                            Math.min(totalPages, p + 1)
                                                        )
                                                    }
                                                    disabled={
                                                        page === totalPages || membersLoading
                                                    }
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setPage(totalPages)}
                                                    disabled={
                                                        page === totalPages || membersLoading
                                                    }
                                                >
                                                    <ChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* RIGHT: Preview panel (desktop) */}
                            <div className="hidden lg:flex w-[320px] shrink-0 flex-col bg-muted/10 h-full min-h-full overflow-y-auto">
                                {selectedMember ? (
                                    <div className="flex flex-col items-center gap-4 p-6 h-full">
                                        <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                                            <AvatarImage
                                                src={selectedMember.avatarUrl || ""}
                                            />
                                            <AvatarFallback className="text-2xl font-bold">
                                                {(
                                                    (selectedMember.firstName?.[0] ?? "") +
                                                    (selectedMember.lastName?.[0] ?? "")
                                                ).toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="text-center space-y-1">
                                            <p className="font-semibold text-lg">
                                                {selectedMember.firstName}{" "}
                                                {selectedMember.lastName}
                                            </p>
                                            {selectedMember.membershipId && (
                                                <p className="text-xs font-mono text-muted-foreground">
                                                    {selectedMember.membershipId}
                                                </p>
                                            )}
                                        </div>

                                        <Separator />

                                        <div className="w-full space-y-2.5 text-sm text-muted-foreground">
                                            {selectedMember.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">
                                                        {selectedMember.email}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedMember.memberGroup && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5 shrink-0" />
                                                    <span>
                                                        {selectedMember.memberGroup
                                                            .replace(/_/g, " ")
                                                            .replace(/\b\w/g, (c) =>
                                                                c.toUpperCase()
                                                            )}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedMember.placeOfStay && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span>
                                                        {selectedMember.placeOfStay}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedMember.memberPosition && (
                                                <div className="flex items-center gap-2">
                                                    <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="capitalize">
                                                        {selectedMember.memberPosition}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto w-full pt-4">
                                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center space-y-1">
                                                <CheckCircle2 className="h-6 w-6 text-primary mx-auto" />
                                                <p className="text-sm font-medium text-primary">
                                                    Ready to grant admin access
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    This person will be able to
                                                    access the admin dashboard.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                            <Users className="h-7 w-7 text-muted-foreground/40" />
                                        </div>
                                        <p className="text-sm text-muted-foreground max-w-[200px]">
                                            Select a member from the list to
                                            preview their details.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* MOBILE: Selected member bar */}
                            {selectedMember && (
                                <div className="lg:hidden shrink-0 border-t bg-primary/5 px-4 py-3 flex items-center gap-3">
                                    <Avatar className="h-9 w-9 shrink-0 border">
                                        <AvatarImage
                                            src={selectedMember.avatarUrl || ""}
                                        />
                                        <AvatarFallback className="text-[10px]">
                                            {(
                                                (selectedMember.firstName?.[0] ?? "") +
                                                (selectedMember.lastName?.[0] ?? "")
                                            ).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {selectedMember.firstName}{" "}
                                            {selectedMember.lastName}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            {selectedMember.email}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <SheetFooter className="shrink-0 flex items-center justify-between px-6 py-4 border-t bg-muted/30 mt-auto">
                        <Button
                            onClick={handleAddAdmin}
                            disabled={isPending || !selectedMember}
                            className="w-full"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Granting Access...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Grant Admin Access
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={closePicker}
                            disabled={isPending}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* ── Remove Dialog ── */}
            <AlertDialog
                open={removeTarget !== null}
                onOpenChange={(o) => !o && setRemoveTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Remove admin access?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>
                                {removeTarget?.firstName}{" "}
                                {removeTarget?.lastName}
                            </strong>{" "}
                            ({removeTarget?.email}) will be demoted to a
                            regular member.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemove}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Removing..." : "Remove Admin"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Revoke Invite Dialog ── */}
            <AlertDialog
                open={revokeTarget !== null}
                onOpenChange={(o) => !o && setRevokeTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke invite?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The pending invite for{" "}
                            <strong>{revokeTarget?.email}</strong> will be
                            cancelled.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRevoke}
                            disabled={isPending}
                        >
                            {isPending ? "Revoking..." : "Revoke"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 