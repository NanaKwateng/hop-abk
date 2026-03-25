// components/users/member-detail-page.tsx
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
    CreditCard,
    BarChart3,
    FileText,
    Phone,
    Mail,
    MapPin,
    Home,
    Users,
    Hash,
    Calendar,
    Clock,
} from "lucide-react";
import { deleteMember, duplicateMember } from "@/actions/member";
import { toast } from "sonner";
import { MemberSheet } from "@/components/dashboard/users/member-sheet";
import { PaymentGrid } from "@/components/users/payment-grid";
import { PaymentAnalyticsView } from "@/components/users/payment-analytics";
import { TestimonialsView } from "@/components/users/testimonials-view";
import type { Member } from "@/lib/types";
import type { MonthPayment, PaymentAnalytics } from "@/lib/types/payments";
import type { Testimonial } from "@/lib/types/testimonials";

interface MemberDetailPageProps {
    member: Member;
    initialPayments: MonthPayment[];
    initialAnalytics: PaymentAnalytics;
    initialTestimonials: Testimonial[];
}

export function MemberDetailPage({
    member,
    initialPayments,
    initialAnalytics,
    initialTestimonials,
}: MemberDetailPageProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    // ✅ ADDED: State to control the edit sheet
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);

    const initials =
        (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

    const hasValidAvatar =
        member.avatarUrl?.startsWith("http") && member.avatarUrl.length > 0;

    // ── Actions ──

    async function handleDelete() {
        try {
            setIsDeleting(true);
            await deleteMember(member.id);
            toast.success("Member deleted");
            router.push("/admin/users");
        } catch (error: any) {
            toast.error("Failed to delete", { description: error.message });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    }

    async function handleDuplicate() {
        try {
            setIsDuplicating(true);
            await duplicateMember(member.id);
            toast.success("Member duplicated");
            router.push("/admin/users");
        } catch (error: any) {
            toast.error("Failed to duplicate", { description: error.message });
        } finally {
            setIsDuplicating(false);
        }
    }

    function formatGroup(group: string | null): string {
        if (!group) return "";
        return group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    function formatDate(dateStr: string | null): string {
        if (!dateStr) return "—";
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

    return (
        <div className="space-y-6">
            {/* ── Back ── */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to all members
                </Link>
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* ═══════════════════════════════════════ */}
                {/* LEFT: Profile Card                      */}
                {/* ═══════════════════════════════════════ */}
                <Card className="md:col-span-1">
                    <CardContent className="flex flex-col items-center gap-4 pt-6">
                        <Avatar className="h-32 w-32 ring-4 ring-background shadow-lg">
                            {hasValidAvatar ? (
                                <AvatarImage
                                    src={member.avatarUrl!}
                                    alt={`${member.firstName} ${member.lastName}`}
                                />
                            ) : null}
                            <AvatarFallback className="text-3xl font-bold">
                                {initials.toUpperCase() || "?"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1 text-center">
                            <h2 className="text-xl font-bold tracking-tight">
                                {member.firstName} {member.lastName}
                            </h2>
                            {member.membershipId && (
                                <p className="font-mono text-sm text-muted-foreground tracking-wider">
                                    {member.membershipId}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                            {member.memberPosition && (
                                <Badge variant="default" className="capitalize">
                                    {member.memberPosition}
                                </Badge>
                            )}
                            {member.gender && (
                                <Badge variant="outline" className="capitalize">
                                    {member.gender}
                                </Badge>
                            )}
                        </div>

                        <Separator />

                        {/* Quick info */}
                        <div className="w-full space-y-2 text-sm">
                            {member.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>{member.phone}</span>
                                </div>
                            )}
                            {member.email && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span className="truncate">{member.email}</span>
                                </div>
                            )}
                            {member.placeOfStay && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{member.placeOfStay}</span>
                                </div>
                            )}
                            {member.houseNumber && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Home className="h-3.5 w-3.5" />
                                    <span>{member.houseNumber}</span>
                                </div>
                            )}
                            {member.memberGroup && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{formatGroup(member.memberGroup)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Joined {formatDate(member.createdAt)}</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex w-full flex-col gap-2">
                            {/* ✅ FIXED: Separate button controlling the edit sheet state */}
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setIsEditSheetOpen(true)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Member
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleDuplicate}
                                disabled={isDuplicating}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                {isDuplicating ? "Duplicating…" : "Duplicate"}
                            </Button>
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

                {/* ═══════════════════════════════════════ */}
                {/* RIGHT: Tabs                             */}
                {/* ═══════════════════════════════════════ */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="payments" className="w-full">
                        <TabsList className="w-full grid grid-cols-3 bg-transparent">
                            <TabsTrigger value="payments" className="gap-2">
                                <CreditCard className="h-4 w-4 hidden sm:inline" />
                                Payments
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="gap-2">
                                <BarChart3 className="h-4 w-4 hidden sm:inline" />
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="info" className="gap-2">
                                <FileText className="h-4 w-4 hidden sm:inline" />
                                Info
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Payments Tab ── */}
                        <TabsContent value="payments" className="mt-6">
                            <PaymentGrid
                                memberId={member.id}
                                memberName={`${member.firstName} ${member.lastName}`}
                                initialPayments={initialPayments}
                            />
                        </TabsContent>

                        {/* ── Analytics Tab ── */}
                        <TabsContent value="analytics" className="mt-6">
                            <PaymentAnalyticsView
                                memberName={`${member.firstName} ${member.lastName}`}
                                analytics={initialAnalytics}
                                isAdminView={true}
                            />
                        </TabsContent>

                        {/* ── Info Tab ── */}
                        <TabsContent value="info" className="mt-6">
                            <TestimonialsView
                                memberId={member.id}
                                memberName={`${member.firstName} ${member.lastName}`}
                                initialTestimonials={initialTestimonials}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* ✅ FIXED: MemberSheet controlled by state, placed at root level */}
            <MemberSheet
                mode="edit"
                member={member}
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
            />

            {/* ── Delete dialog ── */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove{" "}
                            <strong>{member.firstName} {member.lastName}</strong>{" "}
                            and all their payment records and testimonials.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}