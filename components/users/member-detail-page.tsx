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
import { NicknameManage } from "../nicknames/nickname-manage";
import { MemberLocationButton } from "../member-location";

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
                <Card className="relative md:col-span-1 overflow-hidden transition-all duration-300 shadow-md border bg-card text-card-foreground">
                    {/* SVG Background Layer - Replicating the multi-colored geometric low-poly shards */}
                    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                        {/* Low-poly background texture mask */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-transparent via-background/20 to-background dark:via-background/40 dark:to-background z-10" />

                        <svg
                            xmlns="http://w3.org"
                            viewBox="0 0 800 600"
                            className="absolute -top-12 -right-16 w-[120%] h-auto opacity-20 dark:opacity-[0.14] rotate-12 transform-gpu"
                        >
                            {/* Shard Group 1: Cyan/Blue Polygons */}
                            <polygon points="400,0 550,50 480,150" fill="#00b4d8" />
                            <polygon points="550,50 680,20 620,160" fill="#0077b6" />
                            <polygon points="480,150 620,160 520,280" fill="#03045e" />

                            {/* Shard Group 2: Pink/Magenta/Purple Polygons */}
                            <polygon points="680,20 800,0 780,120" fill="#d90429" />
                            <polygon points="680,20 780,120 620,160" fill="#7209b7" />
                            <polygon points="620,160 780,120 740,240" fill="#f72585" />
                            <polygon points="620,160 740,240 520,280" fill="#b5179e" />

                            {/* Shard Group 3: Yellow/Green/Orange Polygons */}
                            <polygon points="400,0 480,150 350,110" fill="#ffb703" />
                            <polygon points="350,110 480,150 420,260" fill="#fb8500" />
                            <polygon points="480,150 520,280 420,260" fill="#ff4d6d" />
                            <polygon points="350,110 420,260 290,210" fill="#06d6a0" />

                            {/* Shard Group 4: Dark/Grey low-poly foundations for depth */}
                            <polygon points="520,280 740,240 680,400" fill="#212529" className="opacity-40" />
                            <polygon points="520,280 680,400 480,420" fill="#343a40" className="opacity-40" />
                            <polygon points="420,260 520,280 480,420" fill="#495057" className="opacity-30" />
                        </svg>
                    </div>

                    {/* Content Container - Raised above background vector shards */}
                    <CardContent className="relative flex flex-col items-center gap-4 pt-6 z-10">
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

                        <div className="flex items-center justify-center gap-2">
                            <NicknameManage
                                memberId={member.id}
                                nickname={member.nickname}
                                memberName={`${member.firstName} ${member.lastName}`}
                            />
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
                            {/* Location Button - Only shows if GPS coordinates exist */}
                            <MemberLocationButton
                                memberId={member.id}
                                memberName={`${member.firstName} ${member.lastName}`}
                                houseNumber={member.houseNumber}
                                placeOfStay={member.placeOfStay}
                                hasGpsCoordinates={!!(member.gpsLat && member.gpsLng)}
                                hasAddress={!!(member.placeOfStay || member.houseNumber)}
                            />

                            <Button
                                variant="outline"
                                className="w-full justify-start bg-background/60 backdrop-blur-sm dark:bg-background/40"
                                onClick={() => setIsEditSheetOpen(true)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Member
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start bg-background/60 backdrop-blur-sm dark:bg-background/40"
                                onClick={handleDuplicate}
                                disabled={isDuplicating}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                {isDuplicating ? "Duplicating…" : "Duplicate"}
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start text-destructive hover:text-destructive bg-background/60 backdrop-blur-sm dark:bg-background/40"
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
                <div className="relative md:col-span-2 overflow-hidden rounded-xl border bg-card text-card-foreground p-6 shadow-md transition-all duration-300">
                    {/* SVG Background Layer - Low poly design elements pulled from business card patterns */}
                    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                        {/* Balanced radial overlay gradient mask to manage dark & light mode contrast */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-transparent via-background/40 to-background dark:via-background/60 dark:to-background z-10" />

                        <svg
                            xmlns="http://w3.org"
                            viewBox="0 0 1000 700"
                            className="absolute -bottom-20 -left-20 w-[110%] h-auto opacity-[0.16] dark:opacity-[0.12] -rotate-6 transform-gpu"
                        >
                            {/* Lower-left cluster: Warm Yellows, Oranges and Pinks */}
                            <polygon points="0,700 150,550 220,680" fill="#fb8500" />
                            <polygon points="150,550 280,500 220,680" fill="#ffb703" />
                            <polygon points="150,550 180,420 280,500" fill="#f72585" />
                            <polygon points="180,420 340,460 280,500" fill="#b5179e" />
                            <polygon points="180,420 290,320 340,460" fill="#7209b7" />

                            {/* Secondary mid-cluster: Deep Blues, Cyans and Greens */}
                            <polygon points="340,460 480,390 420,550" fill="#00b4d8" />
                            <polygon points="480,390 600,420 520,580" fill="#0077b6" />
                            <polygon points="340,460 420,550 280,500" fill="#06d6a0" />
                            <polygon points="420,550 520,580 400,680" fill="#03045e" />
                            <polygon points="520,580 650,680 400,680" fill="#d90429" />

                            {/* Depth foundation elements */}
                            <polygon points="290,320 450,280 340,460" fill="#212529" className="opacity-30" />
                            <polygon points="450,280 480,390 340,460" fill="#343a40" className="opacity-30" />
                        </svg>
                    </div>

                    {/* Interactive Layout Content - Raised securely above background shards using z-10 */}
                    <Tabs defaultValue="payments" className="relative w-full z-10">
                        <TabsList className="w-full grid grid-cols-3 bg-muted/60 backdrop-blur-md p-1 border rounded-lg">
                            <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <CreditCard className="h-4 w-4 hidden sm:inline" />
                                Payments
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <BarChart3 className="h-4 w-4 hidden sm:inline" />
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="info" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <FileText className="h-4 w-4 hidden sm:inline" />
                                Info
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Payments Tab ── */}
                        <TabsContent value="payments" className="mt-6 focus-visible:outline-none">
                            <PaymentGrid
                                memberId={member.id}
                                memberName={`${member.firstName} ${member.lastName}`}
                                initialPayments={initialPayments}
                            />
                        </TabsContent>

                        {/* ── Analytics Tab ── */}
                        <TabsContent value="analytics" className="mt-6 focus-visible:outline-none">
                            <PaymentAnalyticsView
                                memberName={`${member.firstName} ${member.lastName}`}
                                analytics={initialAnalytics}
                                isAdminView={true}
                            />
                        </TabsContent>

                        {/* ── Info Tab ── */}
                        <TabsContent value="info" className="mt-6 focus-visible:outline-none">
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
                <AlertDialogContent className="relative overflow-hidden border bg-card text-card-foreground shadow-xl transition-all duration-200">
                    {/* SVG Background Layer - Focuses on red/warm shards to match destructive intent */}
                    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                        {/* Smooth mask to ensure sharp contrast over dialog text */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-transparent via-background/60 to-background dark:via-background/80 dark:to-background z-10" />

                        <svg
                            xmlns="http://w3.org"
                            viewBox="0 0 600 400"
                            className="absolute -top-10 -right-10 w-[80%] h-auto opacity-[0.14] dark:opacity-[0.1] rotate-[45deg] transform-gpu"
                        >
                            {/* Sharp red, orange, and hot pink shard clusters from original card art */}
                            <polygon points="300,0 450,40 380,120" fill="#d90429" />
                            <polygon points="450,40 600,0 550,140" fill="#ff4d6d" />
                            <polygon points="380,120 550,140 460,240" fill="#fb8500" />
                            <polygon points="450,40 550,140 380,120" fill="#f72585" />

                            {/* Deep background foundational low-poly vectors */}
                            <polygon points="200,50 300,0 380,120" fill="#7209b7" className="opacity-40" />
                            <polygon points="380,120 460,240 320,280" fill="#212529" className="opacity-50" />
                        </svg>
                    </div>

                    {/* Content Container - Layered cleanly on z-10 above the vector accents */}
                    <div className="relative z-10">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this member?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently remove{" "}
                                <strong>{member.firstName} {member.lastName}</strong>{" "}
                                and all their payment records and testimonials.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                            <AlertDialogCancel disabled={isDeleting} className="bg-background/60 backdrop-blur-sm dark:bg-background/40">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
                            >
                                {isDeleting ? "Deleting…" : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}