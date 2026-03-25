// src/components/users/user-detail-card.tsx
// ============================================================
// User detail view showing all information in a card layout.
// Includes edit, duplicate, and delete actions.
// ============================================================

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

// ✅ FIXED: Imported from member-queries with correct hook names
import {
    useMemberDetailQuery,
    useDeleteMemberMutation,
    useDuplicateMemberMutation
} from "@/queries/member-queries";

import { UserDialogForm } from "./user-dialog-form";
import { UserDeleteDialog } from "./user-delete-dialog";
import { UserDetailSkeleton } from "./user-detail-skeleton";
import { POSITION_COLORS, GROUP_COLORS } from "@/lib/constants";
import {
    ArrowLeftIcon,
    MailIcon,
    PhoneIcon,
    MapPinIcon,
    HomeIcon,
    UserIcon,
    UsersIcon,
    BriefcaseIcon,
    CalendarIcon,
    PencilIcon,
    TrashIcon,
    CopyIcon,
    HashIcon,
} from "lucide-react";

interface UserDetailCardProps {
    userId: string;
}

export function UserDetailCard({ userId }: UserDetailCardProps) {
    const router = useRouter();

    // ✅ FIXED: Using the correct hooks from member-queries
    const { data: user, isLoading } = useMemberDetailQuery(userId);
    const deleteMutation = useDeleteMemberMutation();
    const duplicateMutation = useDuplicateMemberMutation();

    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);

    // Show skeleton while loading
    if (isLoading) return <UserDetailSkeleton />;

    // Show error if user not found
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="rounded-full bg-muted p-6">
                    <UserIcon className="size-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">Member Not Found</h2>
                <p className="text-muted-foreground">
                    The member with ID &ldquo;{userId}&rdquo; could not be found.
                </p>
                <Button onClick={() => router.push("/admin/users")}>
                    <ArrowLeftIcon className="mr-2 size-4" />
                    Back to Members
                </Button>
            </div>
        );
    }

    const handleDelete = async () => {
        await deleteMutation.mutateAsync(user.id);
        setDeleteOpen(false);
        router.push("/admin/users");
    };

    const handleDuplicate = () => {
        duplicateMutation.mutate(user.id);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // ✅ FIXED: Object properties mapped perfectly to the Member interface
    const infoItems = [
        { icon: MailIcon, label: "Email Address", value: user.email || "—" },
        { icon: PhoneIcon, label: "Phone Number", value: user.phone || "—" },
        { icon: UserIcon, label: "Gender", value: user.gender || "—" },
        { icon: MapPinIcon, label: "Place of Stay", value: user.placeOfStay || "—" },
        { icon: HomeIcon, label: "House Number", value: user.houseNumber || "—" },
        { icon: BriefcaseIcon, label: "Occupation", value: user.occupationType || "—" },
        { icon: CalendarIcon, label: "Member Since", value: formatDate(user.createdAt) },
    ];

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Button
                variant="ghost"
                onClick={() => router.push("/admin/users")}
                className="gap-2"
            >
                <ArrowLeftIcon className="size-4" />
                Back to Members
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardContent className="flex flex-col items-center gap-4 pt-6">
                        <Avatar className="size-32">
                            {/* ✅ FIXED: profileImage -> avatarUrl */}
                            <AvatarImage
                                src={user.avatarUrl || undefined}
                                alt={`${user.firstName} ${user.lastName}`}
                            />
                            <AvatarFallback className="text-3xl">
                                {user.firstName?.[0] || ""}
                                {user.lastName?.[0] || ""}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center">
                            <h2 className="text-2xl font-bold">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="flex items-center justify-center gap-1 font-mono text-sm text-muted-foreground">
                                <HashIcon className="size-3" />
                                {user.membershipId || user.id.slice(0, 8)}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {user.memberPosition && (
                                <Badge className={`text-sm ${POSITION_COLORS[user.memberPosition] || ""}`}>
                                    {user.memberPosition}
                                </Badge>
                            )}
                            {user.memberGroup && (
                                <Badge variant="outline" className={`text-sm ${GROUP_COLORS[user.memberGroup] || ""}`}>
                                    {user.memberGroup}
                                </Badge>
                            )}
                        </div>

                        <Separator />

                        <div className="flex w-full flex-col gap-2">
                            <Button variant="outline" className="w-full" onClick={() => setEditOpen(true)}>
                                <PencilIcon className="mr-2 size-4" />
                                Edit
                            </Button>
                            <Button variant="outline" className="w-full" onClick={handleDuplicate} disabled={duplicateMutation.isPending}>
                                <CopyIcon className="mr-2 size-4" />
                                {duplicateMutation.isPending ? "Duplicating..." : "Duplicate"}
                            </Button>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <TrashIcon className="mr-2 size-4" />
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Member Information</CardTitle>
                        <CardDescription>
                            Complete details for {user.firstName} {user.lastName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {infoItems.map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                        <item.icon className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {item.label}
                                        </span>
                                        <span className="text-sm font-medium capitalize">{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {[
                                { label: "Position", value: user.memberPosition || "None" },
                                { label: "Group", value: user.memberGroup || "None" },
                                // ✅ FIXED: occupationalType -> occupationType
                                { label: "Occupation", value: user.occupationType || "None" },
                                { label: "Location", value: user.placeOfStay || "None" },
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-lg border p-4 text-center">
                                    <p className="text-lg font-bold text-primary sm:text-xl capitalize">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <UserDialogForm
                mode="edit"
                user={user}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            {/* Delete Dialog */}
            <UserDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                member={user}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}