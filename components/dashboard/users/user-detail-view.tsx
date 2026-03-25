// components/users/user-detail-view.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    ArrowLeft,
    Pencil,
    Copy,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Home,
    Users,
    Briefcase,
    User,
    Calendar,
    Clock,
    MessageSquare,
} from "lucide-react";
import { deleteMember } from "@/actions/member";
import { duplicateMember } from "@/actions/member";
import { toast } from "sonner";
import { MemberSheet } from "@/components/dashboard/users/member-sheet";
import type { Member } from "@/lib/types";

interface UserDetailViewProps {
    user: Member;
}

export function UserDetailView({ user }: UserDetailViewProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // ✅ ADDED: State to control the Edit Sheet
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);

    const initials =
        (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "");

    const hasValidAvatar =
        user.avatarUrl &&
        user.avatarUrl.startsWith("http") &&
        user.avatarUrl.length > 0;

    // ── Actions ──

    async function handleDelete() {
        try {
            setIsDeleting(true);
            await deleteMember(user.id);
            toast.success("Member deleted", {
                description: `${user.firstName} ${user.lastName} has been removed.`,
            });
            router.push("/admin/users");
        } catch (error: any) {
            toast.error("Failed to delete member", {
                description: error.message,
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    }

    async function handleDuplicate() {
        try {
            setIsDuplicating(true);
            await duplicateMember(user.id);
            toast.success("Member duplicated", {
                description: `A copy of ${user.firstName} ${user.lastName} has been created.`,
            });
            router.push("/admin/users");
        } catch (error: any) {
            toast.error("Failed to duplicate member", {
                description: error.message,
            });
        } finally {
            setIsDuplicating(false);
        }
    }

    // ── Format helpers ──

    function formatGroup(group: string | null): string {
        if (!group) return "";
        return group
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    function formatDate(dateStr: string | null): string {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    }

    // ── Build detail items ──

    const detailItems: DetailItemProps[] = [
        {
            icon: <Mail className="h-4 w-4" />,
            label: "Email Address",
            value: user.email,
            iconBg: "bg-blue-500/10 text-blue-500",
        },
        {
            icon: <Phone className="h-4 w-4" />,
            label: "Phone Number",
            value: user.phone
                ? `${user.phoneCountry ? `(${user.phoneCountry}) ` : ""}${user.phone}`
                : null,
            iconBg: "bg-green-500/10 text-green-500",
        },
        {
            icon: <MapPin className="h-4 w-4" />,
            label: "Place of Stay",
            value: user.placeOfStay,
            iconBg: "bg-orange-500/10 text-orange-500",
        },
        {
            icon: <Home className="h-4 w-4" />,
            label: "House Number",
            value: user.houseNumber,
            iconBg: "bg-yellow-500/10 text-yellow-600",
        },
        {
            icon: <Users className="h-4 w-4" />,
            label: "Fellowship Group",
            value: formatGroup(user.memberGroup),
            iconBg: "bg-purple-500/10 text-purple-500",
        },
        {
            icon: <Briefcase className="h-4 w-4" />,
            label: "Occupation",
            value: user.occupationType
                ? user.occupationType.charAt(0).toUpperCase() +
                user.occupationType.slice(1)
                : null,
            iconBg: "bg-cyan-500/10 text-cyan-600",
        },
        {
            icon: <User className="h-4 w-4" />,
            label: "Gender",
            value: user.gender
                ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                : null,
            iconBg: "bg-pink-500/10 text-pink-500",
        },
        // ✅ FIXED: registrationDate -> createdAt
        {
            icon: <Calendar className="h-4 w-4" />,
            label: "Registration Date",
            value: formatDate(user.createdAt),
            iconBg: "bg-indigo-500/10 text-indigo-500",
        },
        // ✅ FIXED: Removed registrationType
    ];

    // Filter out empty items
    const visibleDetails = detailItems.filter(
        (item) => item.value && item.value.trim() !== ""
    );

    return (
        <div className="space-y-6">
            {/* ── Back button ── */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to all members
                </Link>
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* ══════════════════════════════════════════ */}
                {/*  LEFT: Profile Card                       */}
                {/* ══════════════════════════════════════════ */}
                <Card className="md:col-span-1">
                    <CardContent className="flex flex-col items-center gap-4 pt-6">
                        {/* Avatar */}
                        <Avatar className="h-32 w-32 ring-4 ring-background shadow-lg">
                            {hasValidAvatar ? (
                                <AvatarImage
                                    src={user.avatarUrl!}
                                    alt={`${user.firstName} ${user.lastName}`}
                                />
                            ) : null}
                            <AvatarFallback className="text-3xl font-bold">
                                {initials.toUpperCase() || "?"}
                            </AvatarFallback>
                        </Avatar>

                        {/* Name + ID */}
                        <div className="space-y-1 text-center">
                            <h2 className="text-xl font-bold tracking-tight">
                                {user.firstName} {user.lastName}
                            </h2>
                            {user.membershipId && (
                                <p className="font-mono text-sm text-muted-foreground tracking-wider">
                                    {user.membershipId}
                                </p>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {user.memberPosition && (
                                <Badge variant="default" className="capitalize">
                                    {user.memberPosition}
                                </Badge>
                            )}
                            {user.gender && (
                                <Badge variant="outline" className="capitalize">
                                    {user.gender}
                                </Badge>
                            )}
                            {/* ✅ FIXED: Removed registrationType badge */}
                        </div>

                        <Separator />

                        {/* Action buttons */}
                        <div className="flex w-full flex-col gap-2">
                            {/* ✅ FIXED: Separate button controlling the state */}
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setIsEditSheetOpen(true)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Member
                            </Button>

                            {/* Duplicate */}
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleDuplicate}
                                disabled={isDuplicating}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                {isDuplicating ? "Duplicating…" : "Duplicate Member"}
                            </Button>

                            {/* Delete */}
                            <Button
                                variant="outline"
                                className="w-full justify-start text-destructive hover:text-destructive"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Member
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ══════════════════════════════════════════ */}
                {/*  RIGHT: Details Card                      */}
                {/* ══════════════════════════════════════════ */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Member Information</CardTitle>
                        <CardDescription>
                            Complete profile details and registration records for{" "}
                            {user.firstName} {user.lastName}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {visibleDetails.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {visibleDetails.map((item) => (
                                    <DetailItem key={item.label} {...item} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
                                <p className="text-sm text-muted-foreground">
                                    No additional details available.
                                </p>
                            </div>
                        )}

                        {/* ── Comments section ── */}
                        {(user.addressComments || user.roleComments) && (
                            <>
                                <Separator className="my-6" />

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Notes & Comments
                                    </h3>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {user.addressComments && (
                                            <CommentBlock
                                                icon={<MapPin className="h-4 w-4" />}
                                                title="Address Notes"
                                                content={user.addressComments}
                                            />
                                        )}

                                        {user.roleComments && (
                                            <CommentBlock
                                                icon={
                                                    <MessageSquare className="h-4 w-4" />
                                                }
                                                title="Role Notes"
                                                content={user.roleComments}
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ✅ FIXED: Member Sheet placed at root level, controlled by state */}
            <MemberSheet
                mode="edit"
                member={user}
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
            />

            {/* ── Delete confirmation dialog ── */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove{" "}
                            <strong>
                                {user.firstName} {user.lastName}
                            </strong>{" "}
                            from the database. Their avatar will also be deleted
                            from storage. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting…" : "Delete Member"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ── Detail item component ──

interface DetailItemProps {
    icon: React.ReactNode;
    label: string;
    value: string | null;
    iconBg?: string;
}

function DetailItem({ icon, label, value, iconBg }: DetailItemProps) {
    if (!value || value.trim() === "") return null;

    return (
        <div className="flex items-start gap-3">
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg ?? "bg-muted text-muted-foreground"
                    }`}
            >
                {icon}
            </div>
            <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="text-sm font-medium truncate">{value}</p>
            </div>
        </div>
    );
}

// ── Comment block component ──

function CommentBlock({
    icon,
    title,
    content,
}: {
    icon: React.ReactNode;
    title: string;
    content: string;
}) {
    return (
        <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-xs font-medium">{title}</span>
            </div>
            <p className="text-sm leading-relaxed">{content}</p>
        </div>
    );
}