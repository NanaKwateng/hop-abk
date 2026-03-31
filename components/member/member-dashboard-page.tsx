// components/member/member-dashboard-page.tsx
"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
} from "@/components/ui/drawer";
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
    Bookmark,
    BookmarkCheck,
    MessageCircle,
    X,
    Sparkles,
    ChevronRight,
} from "lucide-react";
import { PaymentAnalyticsView } from "@/components/users/payment-analytics";
import { memberSignOut } from "@/actions/member-verify";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";
import type { PaymentAnalytics } from "@/lib/types/payments";

// ── Spring configs for Apple-style feel ──
const SPRING_SNAPPY = { type: "spring", stiffness: 400, damping: 30 } as const;
const SPRING_BOUNCY = { type: "spring", stiffness: 300, damping: 20, mass: 0.8 } as const;
const SPRING_GENTLE = { type: "spring", stiffness: 200, damping: 25 } as const;

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
    const [isExpanded, setIsExpanded] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    const initials =
        (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");
    const fullName = `${member.firstName} ${member.lastName}`;
    const hasValidAvatar =
        member.avatarUrl?.startsWith("http") && member.avatarUrl.length > 0;

    // ── Confetti on first load if good payment record ──
    useEffect(() => {
        if (hasAnimated) return;
        setHasAnimated(true);

        if (analytics.currentYear.totalPaid >= 6) {
            const timer = setTimeout(() => {
                confetti({
                    particleCount: 60,
                    spread: 80,
                    origin: { y: 0.3, x: 0.5 },
                    colors: ["#ff7f50", "#ffbf00", "#10b981", "#6366f1", "#f43f5e"],
                    gravity: 1.2,
                    scalar: 0.8,
                    ticks: 150,
                });
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [analytics.currentYear.totalPaid, hasAnimated]);

    // ── Handlers ──
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

    const toggleExpanded = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

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

    // ── Build info items ──
    const infoItems = [
        member.phone && { icon: Phone, label: "Phone", value: member.phone },
        member.email && { icon: Mail, label: "Email", value: member.email },
        member.placeOfStay && { icon: MapPin, label: "Location", value: member.placeOfStay },
        member.houseNumber && { icon: Home, label: "House No.", value: member.houseNumber },
        member.memberGroup && { icon: Users, label: "Group", value: formatGroup(member.memberGroup) },
        { icon: Clock, label: "Joined", value: formatDate(member.createdAt) },
    ].filter(Boolean) as { icon: any; label: string; value: string }[];

    // ── Stats for the card ──
    const stats = [
        {
            label: "Paid",
            value: `${analytics.currentYear.totalPaid}/12`,
        },
        {
            label: "Streak",
            value: `${analytics.streakMonths}mo`,
        },
        {
            label: "Rate",
            value: `${analytics.overallPaidPercentage}%`,
        },
    ];

    return (
        <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-muted/20">
            {/* ═══════════════════════════════════════ */}
            {/* HEADER BAR                              */}
            {/* ═══════════════════════════════════════ */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.1 }}
                className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
            >
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"
                        >
                            <ShieldCheck className="h-4 w-4 text-primary" />
                        </motion.div>
                        <div>
                            <p className="text-sm font-semibold tracking-tight">{fullName}</p>
                            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                                Member Dashboard
                            </p>
                        </div>
                    </div>

                    <motion.div whileTap={{ scale: 0.92 }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            disabled={isPending}
                            className="h-8 px-3 text-xs rounded-full"
                        >
                            {isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <LogOut className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    </motion.div>
                </div>
            </motion.header>

            {/* ═══════════════════════════════════════ */}
            {/* MAIN CONTENT                            */}
            {/* ═══════════════════════════════════════ */}
            <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
                {/* ── Welcome ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_GENTLE, delay: 0.2 }}
                >
                    <h1 className="text-2xl font-bold tracking-tight">
                        Welcome back{" "}
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ ...SPRING_BOUNCY, delay: 0.5 }}
                            className="inline-block"
                        >
                            👋
                        </motion.span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {member.firstName}, here&apos;s your overview.
                    </p>
                </motion.div>

                {/* ═══════════════════════════════════════ */}
                {/* MEMBER CARD — Expandable                */}
                {/* ═══════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ ...SPRING_BOUNCY, delay: 0.3 }}
                >
                    <motion.div
                        layout
                        transition={SPRING_SNAPPY}
                        className={cn(
                            "relative overflow-hidden rounded-3xl border bg-card shadow-lg",
                            "will-change-transform"
                        )}
                    >
                        {/* ── Card Image / Avatar Section ── */}
                        <motion.div
                            layout="position"
                            transition={SPRING_SNAPPY}
                            className={cn(
                                "relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5",
                                isExpanded ? "aspect-[4/3]" : "h-20"
                            )}
                        >
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                                    backgroundSize: "24px 24px"
                                }}
                            />

                            {/* Bookmark toggle */}
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={toggleExpanded}
                                className={cn(
                                    "absolute z-10 flex items-center justify-center rounded-2xl transition-colors",
                                    isExpanded
                                        ? "top-4 right-4 h-10 w-10 bg-background/90 backdrop-blur-sm shadow-md"
                                        : "top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm"
                                )}
                            >
                                <AnimatePresence mode="wait">
                                    {isExpanded ? (
                                        <motion.div
                                            key="bookmarked"
                                            initial={{ scale: 0, rotate: -90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 90 }}
                                            transition={SPRING_BOUNCY}
                                        >
                                            <BookmarkCheck className="h-4 w-4 text-primary" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="bookmark"
                                            initial={{ scale: 0, rotate: 90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: -90 }}
                                            transition={SPRING_BOUNCY}
                                        >
                                            <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* Avatar — transitions between small and large */}
                            <AnimatePresence mode="wait">
                                {isExpanded ? (
                                    // ── EXPANDED: Full image / large avatar ──
                                    <motion.div
                                        key="expanded-avatar"
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        {hasValidAvatar ? (
                                            <img
                                                src={member.avatarUrl!}
                                                alt={fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5">
                                                <span className="text-6xl font-bold text-primary/40">
                                                    {initials.toUpperCase() || "?"}
                                                </span>
                                            </div>
                                        )}
                                        {/* Gradient overlay at bottom for text readability */}
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
                                    </motion.div>
                                ) : (
                                    // ── COMPACT: Small avatar inline ──
                                    <motion.div
                                        key="compact-avatar"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 flex items-center px-5"
                                    >
                                        <motion.div
                                            layout
                                            transition={SPRING_SNAPPY}
                                        >
                                            <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                                                {hasValidAvatar ? (
                                                    <AvatarImage
                                                        src={member.avatarUrl!}
                                                        alt={fullName}
                                                    />
                                                ) : null}
                                                <AvatarFallback className="text-sm font-bold bg-primary/10">
                                                    {initials.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </motion.div>

                                        <div className="ml-3 flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{fullName}</p>
                                            {member.membershipId && (
                                                <p className="text-[10px] font-mono text-muted-foreground tracking-wider mt-0.5">
                                                    {member.membershipId}
                                                </p>
                                            )}
                                        </div>

                                        {/* Compact badges */}
                                        <div className="flex items-center gap-1.5">
                                            {member.memberPosition && (
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 capitalize">
                                                    {member.memberPosition}
                                                </Badge>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* ── Card Body ── */}
                        <motion.div
                            layout="position"
                            transition={SPRING_SNAPPY}
                            className="p-5 space-y-4"
                        >
                            {/* Name + badges (shown only in expanded) */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ ...SPRING_GENTLE, delay: 0.1 }}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold tracking-tight">
                                                {fullName}
                                            </h2>
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ ...SPRING_BOUNCY, delay: 0.3 }}
                                            >
                                                <ShieldCheck className="h-5 w-5 text-blue-500" />
                                            </motion.div>
                                        </div>

                                        {member.membershipId && (
                                            <p className="text-xs font-mono text-muted-foreground tracking-wider">
                                                {member.membershipId}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-1.5">
                                            {member.memberPosition && (
                                                <Badge variant="default" className="capitalize text-xs">
                                                    {member.memberPosition}
                                                </Badge>
                                            )}
                                            {member.gender && (
                                                <Badge variant="outline" className="capitalize text-xs">
                                                    {member.gender}
                                                </Badge>
                                            )}
                                            {member.memberGroup && (
                                                <Badge variant="secondary" className="capitalize text-xs">
                                                    {formatGroup(member.memberGroup)}
                                                </Badge>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Stats row */}
                            <motion.div
                                layout="position"
                                transition={SPRING_SNAPPY}
                                className="flex items-center justify-between"
                            >
                                {stats.map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ ...SPRING_GENTLE, delay: 0.4 + i * 0.08 }}
                                        className="text-center flex-1"
                                    >
                                        <p className="text-lg font-bold tracking-tight">
                                            {stat.value}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                            {stat.label}
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Get In Touch button */}
                            <motion.div
                                layout="position"
                                transition={SPRING_SNAPPY}
                                className="flex items-center gap-2"
                            >
                                <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                                    <Button
                                        onClick={() => setDrawerOpen(true)}
                                        className="w-full h-11 rounded-2xl font-semibold text-sm gap-2 shadow-sm"
                                        size="lg"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Get In Touch
                                    </Button>
                                </motion.div>

                                {!isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={SPRING_BOUNCY}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={toggleExpanded}
                                            className="h-11 w-11 rounded-2xl shrink-0"
                                        >
                                            <Bookmark className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* ═══════════════════════════════════════ */}
                {/* INFO ITEMS — Below the card             */}
                {/* ═══════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_GENTLE, delay: 0.5 }}
                    className="space-y-1"
                >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-2">
                        Details
                    </p>

                    <div className="rounded-2xl border bg-card overflow-hidden divide-y">
                        {infoItems.map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ ...SPRING_GENTLE, delay: 0.55 + i * 0.05 }}
                                className="flex items-center gap-3 px-4 py-3 group"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/60 shrink-0 group-hover:bg-primary/10 transition-colors duration-300">
                                    <item.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                        {item.label}
                                    </p>
                                    <p className="text-sm font-medium truncate mt-0.5">
                                        {item.value}
                                    </p>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Quick insights pill ── */}
                {analytics.streakMonths > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ ...SPRING_BOUNCY, delay: 0.8 }}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/30 dark:border-amber-800/30"
                    >
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -5, 0] }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                        >
                            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                        </motion.div>
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                            🔥 {analytics.streakMonths} month streak! Keep it going.
                        </p>
                    </motion.div>
                )}
            </main>

            {/* ═══════════════════════════════════════ */}
            {/* FULL-SCREEN DRAWER                      */}
            {/* Payment Analytics + Tabs                */}
            {/* ═══════════════════════════════════════ */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="h-[96dvh] rounded-t-[2rem] flex flex-col">
                    {/* ── Drawer handle ── */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                    </div>

                    {/* ── Drawer header ── */}
                    <DrawerHeader className="px-5 pb-3 pt-2 flex items-center justify-between border-b shrink-0">
                        <div>
                            <DrawerTitle className="text-lg font-bold tracking-tight">
                                Payment Overview
                            </DrawerTitle>
                            <DrawerDescription className="text-xs mt-0.5">
                                {fullName} · {analytics.currentYear.year}
                            </DrawerDescription>
                        </div>
                        <DrawerClose asChild>
                            <motion.div whileTap={{ scale: 0.85 }}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        </DrawerClose>
                    </DrawerHeader>

                    {/* ── Drawer body — scrollable ── */}
                    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
                        <PaymentAnalyticsView
                            memberName={fullName}
                            analytics={analytics}
                            isAdminView={false}
                        />
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}