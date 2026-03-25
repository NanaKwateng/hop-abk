// components/member/member-dashboard-page.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Phone,
    Mail,
    MapPin,
    Home,
    Users,
    Clock,
    LogOut,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { PaymentAnalyticsView } from "@/components/users/payment-analytics";
import { memberSignOut } from "@/actions/member-verify";
import { toast } from "sonner";
import type { Member } from "@/lib/types";
import type { PaymentAnalytics } from "@/lib/types/payments";

interface MemberDashboardPageProps {
    member: Member;
    analytics: PaymentAnalytics;
}

export function MemberDashboardPage({
    member,
    analytics,
}: MemberDashboardPageProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const initials =
        (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");
    const fullName = `${member.firstName} ${member.lastName}`;

    const hasValidAvatar =
        member.avatarUrl?.startsWith("http") && member.avatarUrl.length > 0;

    function handleSignOut() {
        startTransition(async () => {
            try {
                await memberSignOut();
                router.push("/users");
                router.refresh();
            } catch {
                toast.error("Failed to sign out.");
            }
        });
    }

    function formatGroup(group: string | null): string {
        if (!group) return "";
        return group
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
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
        <div className="min-h-screen bg-background w-full">
            {/* ═══════════════════════════════════════ */}
            {/* TOP BAR                                 */}
            {/* ═══════════════════════════════════════ */}
            <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-xs text-black dark:text-white">
                                {fullName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Member Dashboard
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSignOut}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <LogOut className="mr-2 h-3.5 w-3.5" />
                        )}
                        Sign Out
                    </Button>
                </div>
            </header>

            {/* ═══════════════════════════════════════ */}
            {/* MAIN CONTENT                            */}
            {/* ═══════════════════════════════════════ */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Welcome banner */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
                        Welcome, {member.firstName}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View your payment history, analytics, and profile
                        information.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* ═══════════════════════════════════ */}
                    {/* LEFT: Read-only Profile Card        */}
                    {/* ═══════════════════════════════════ */}
                    <Card className="lg:col-span-1 h-fit">
                        <CardContent className="flex flex-col items-center gap-4 pt-6">
                            {/* Avatar */}
                            <Avatar className="h-28 w-28 ring-4 ring-background shadow-lg">
                                {hasValidAvatar ? (
                                    <AvatarImage
                                        src={member.avatarUrl!}
                                        alt={fullName}
                                    />
                                ) : null}
                                <AvatarFallback className="text-2xl font-bold">
                                    {initials.toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>

                            {/* Name + ID */}
                            <div className="space-y-1 text-center">
                                <h2 className="text-xl font-bold tracking-tight">
                                    {fullName}
                                </h2>
                                {member.membershipId && (
                                    <p className="font-mono text-sm text-muted-foreground tracking-wider">
                                        {member.membershipId}
                                    </p>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {member.memberPosition && (
                                    <Badge
                                        variant="default"
                                        className="capitalize"
                                    >
                                        {member.memberPosition}
                                    </Badge>
                                )}
                                {member.gender && (
                                    <Badge
                                        variant="outline"
                                        className="capitalize"
                                    >
                                        {member.gender}
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            {/* Info rows — READ-ONLY (no actions) */}
                            <div className="w-full space-y-2.5 text-sm">
                                {member.phone && (
                                    <InfoRow
                                        icon={<Phone className="h-3.5 w-3.5" />}
                                        text={member.phone}
                                    />
                                )}
                                {member.email && (
                                    <InfoRow
                                        icon={<Mail className="h-3.5 w-3.5" />}
                                        text={member.email}
                                    />
                                )}
                                {member.placeOfStay && (
                                    <InfoRow
                                        icon={<MapPin className="h-3.5 w-3.5" />}
                                        text={member.placeOfStay}
                                    />
                                )}
                                {member.houseNumber && (
                                    <InfoRow
                                        icon={<Home className="h-3.5 w-3.5" />}
                                        text={member.houseNumber}
                                    />
                                )}
                                {member.memberGroup && (
                                    <InfoRow
                                        icon={<Users className="h-3.5 w-3.5" />}
                                        text={formatGroup(member.memberGroup)}
                                    />
                                )}
                                <InfoRow
                                    icon={<Clock className="h-3.5 w-3.5" />}
                                    text={`Joined ${formatDate(member.createdAt)}`}
                                />
                            </div>

                            {/* ── NO action buttons ── */}
                            {/* Member cannot edit, duplicate, or delete */}
                        </CardContent>
                    </Card>

                    {/* ═══════════════════════════════════ */}
                    {/* RIGHT: Payment Analytics (view-only)*/}
                    {/* ═══════════════════════════════════ */}
                    <div className="lg:col-span-2">
                        <PaymentAnalyticsView
                            memberName={fullName}
                            analytics={analytics}
                            isAdminView={false}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

// ── Small helper for info rows ──

function InfoRow({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) {
    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span className="truncate">{text}</span>
        </div>
    );
}






