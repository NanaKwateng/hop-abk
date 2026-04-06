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
    IoCallOutline,
    IoMailOutline,
    IoLocationOutline,
    IoHomeOutline,
    IoPeopleOutline,
    IoTimeOutline,
    IoLogOutOutline,
    IoBookmarkOutline,
    IoBookmark,
    IoChatbubbleOutline,
    IoShieldCheckmarkOutline,
    IoCloseOutline,
    IoSparklesOutline,
    IoChevronForward,
} from "react-icons/io5";
import { RiOpenArmLine } from "react-icons/ri";
import { PaymentAnalyticsView } from "@/components/users/payment-analytics";
import { memberSignOut } from "@/actions/member-verify";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";
import type { PaymentAnalytics } from "@/lib/types/payments";
import { FaExpandAlt, FaFire } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { BsArrowsAngleContract } from "react-icons/bs";
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
const SPRING_BOUNCY = { type: "spring" as const, stiffness: 300, damping: 20, mass: 0.8 };
const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };

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

    // Confetti on first load if good payment record
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

    // Build info items with actionable links
    const infoItems = [
        member.phone && {
            icon: IoCallOutline,
            label: "Phone",
            value: member.phone,
            href: `tel:${member.phone}`,
            actionable: true,
        },
        member.email && {
            icon: IoMailOutline,
            label: "Email",
            value: member.email,
            href: `mailto:${member.email}`,
            actionable: true,
        },
        member.placeOfStay && {
            icon: IoLocationOutline,
            label: "Location",
            value: member.placeOfStay,
            href: null,
            actionable: false,
        },
        member.houseNumber && {
            icon: IoHomeOutline,
            label: "House No.",
            value: member.houseNumber,
            href: null,
            actionable: false,
        },
        member.memberGroup && {
            icon: IoPeopleOutline,
            label: "Group",
            value: formatGroup(member.memberGroup),
            href: null,
            actionable: false,
        },
        {
            icon: IoTimeOutline,
            label: "Registered",
            value: formatDate(member.createdAt),
            href: null,
            actionable: false,
        },
    ].filter(Boolean) as {
        icon: any;
        label: string;
        value: string;
        href: string | null;
        actionable: boolean;
    }[];

    // Stats for the card
    const stats = [
        { label: "Paid", value: `${analytics.currentYear.totalPaid}/12` },
        { label: "Streak", value: `${analytics.streakMonths}mo` },
        { label: "Rate", value: `${analytics.overallPaidPercentage}%` },
    ];

    return (
        <div className="min-h-[100dvh] bg-background">
            {/* ═══════════════════════════════════════ */}
            {/* HEADER — No border, no backdrop          */}
            {/* ═══════════════════════════════════════ */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...SPRING_SNAPPY, delay: 0.1 }}
                className="sticky top-0 z-50 bg-background"
            >
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"
                        >
                            <IoShieldCheckmarkOutline className="h-4 w-4 text-primary" />
                        </motion.div>
                        <div>
                            <p className="text-sm font-semibold tracking-tight">
                                {fullName}
                            </p>
                            <p className="text-[10px] text-black dark:text-white leading-none mt-0.5">
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
                            className="h-8 px-3 text-xs rounded-full gap-1.5"
                        >
                            {isPending ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <IoLogOutOutline className="h-3.5 w-3.5" />
                                </motion.div>
                            ) : (
                                <IoLogOutOutline className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline">Sign Out</span>
                        </Button>
                    </motion.div>
                </div>
            </motion.header>

            {/* ═══════════════════════════════════════ */}
            {/* MAIN CONTENT                            */}
            {/* ═══════════════════════════════════════ */}
            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* Welcome */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_GENTLE, delay: 0.2 }}
                >
                    <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
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
                    <p className="text-sm max-w-sm text-black dark:text-white mt-0.5">
                        {member.firstName}, here&apos;s your overview, continue to keep track of your progress
                    </p>
                </motion.div>

                {/* ═══════════════════════════════════════ */}
                {/* PROFILE ROW: Card + Details side-by-side on lg */}
                {/* ═══════════════════════════════════════ */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* ── Profile Card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ ...SPRING_BOUNCY, delay: 0.3 }}
                        className="lg:w-[380px] lg:shrink-0"
                    >
                        <motion.div
                            layout
                            transition={SPRING_SNAPPY}
                            className="relative overflow-hidden rounded-3xl border bg-card shadow-sm will-change-transform"
                        >
                            {/* Image / Avatar Section */}
                            <motion.div
                                layout="position"
                                transition={SPRING_SNAPPY}
                                className={cn(
                                    "relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5",
                                    isExpanded ? "aspect-[4/3]" : "h-20"
                                )}
                            >
                                {/* Dot pattern */}
                                <div
                                    className="absolute inset-0 opacity-[0.03]"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                                        backgroundSize: "24px 24px",
                                    }}
                                />

                                {/* Expand Arrow toggle */}
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
                                                <BsArrowsAngleContract className="h-4 w-4 text-primary" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="bookmark"
                                                initial={{ scale: 0, rotate: 90 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: -90 }}
                                                transition={SPRING_BOUNCY}
                                            >
                                                <FaExpandAlt className="h-3.5 w-3.5 text-muted-foreground" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>

                                {/* Avatar states */}
                                <AnimatePresence mode="wait">
                                    {isExpanded ? (
                                        <motion.div
                                            key="expanded-avatar"
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{
                                                duration: 0.4,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                            }}
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
                                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="compact-avatar"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="absolute inset-0 flex items-center px-5"
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

                                            <div className="ml-3 flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate text-black dark:text-white">
                                                    {fullName}
                                                </p>
                                                {member.membershipId && (
                                                    <p className="text-[10px] font-mono text-black dark:text-white tracking-wider mt-0.5">
                                                        {member.membershipId}
                                                    </p>
                                                )}
                                            </div>

                                            {member.memberPosition && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] h-5 px-1.5 capitalize"
                                                >
                                                    {member.memberPosition}
                                                </Badge>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Card Body */}
                            <motion.div
                                layout="position"
                                transition={SPRING_SNAPPY}
                                className="p-5 space-y-4"
                            >
                                {/* Expanded info */}
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
                                                <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
                                                    {fullName}
                                                </h2>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        ...SPRING_BOUNCY,
                                                        delay: 0.3,
                                                    }}
                                                >
                                                    <RiOpenArmLine className="h-5 w-5 text-blue-500" />
                                                </motion.div>
                                            </div>

                                            {member.membershipId && (
                                                <p className="text-xs font-mono text-dark dark:text-white tracking-wider">
                                                    {member.membershipId}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-1.5">
                                                {member.memberPosition && (
                                                    <Badge
                                                        variant="default"
                                                        className="capitalize text-xs"
                                                    >
                                                        {member.memberPosition}
                                                    </Badge>
                                                )}
                                                {member.gender && (
                                                    <Badge
                                                        variant="outline"
                                                        className="capitalize text-xs"
                                                    >
                                                        {member.gender}
                                                    </Badge>
                                                )}
                                                {member.memberGroup && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="capitalize text-xs"
                                                    >
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
                                            transition={{
                                                ...SPRING_GENTLE,
                                                delay: 0.4 + i * 0.08,
                                            }}
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

                                {/* Action buttons */}
                                <motion.div
                                    layout="position"
                                    transition={SPRING_SNAPPY}
                                    className="flex items-center gap-2"
                                >
                                    <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                                        <Button
                                            onClick={() => setDrawerOpen(true)}
                                            className="w-full h-11 rounded-2xl font-semibold text-sm gap-2 shadow-sm bg-foreground text-background hover:bg-foreground/90"
                                            size="lg"
                                        >
                                            <FaArrowTrendUp className="h-4 w-4" />
                                            View Payments
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
                                                <RiOpenArmLine className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* ═══════════════════════════════════════ */}
                    {/* DETAILS CARD                             */}
                    {/* ═══════════════════════════════════════ */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRING_GENTLE, delay: 0.5 }}
                        className="flex-1 min-w-0 space-y-3"
                    >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                            Details
                        </p>

                        <div className="rounded-2xl border bg-card overflow-hidden divide-y divide-border/60">
                            {infoItems.map((item, i) => {
                                const content = (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            ...SPRING_GENTLE,
                                            delay: 0.55 + i * 0.05,
                                        }}
                                        className={cn(
                                            "flex items-center gap-3.5 px-4 py-3.5 group transition-colors duration-200",
                                            item.actionable && "hover:bg-muted/40 active:bg-muted/60 cursor-pointer"
                                        )}
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 shrink-0 group-hover:bg-primary/10 transition-colors duration-300">
                                            <item.icon className="h-4 w-4 text-foreground/60 group-hover:text-primary transition-colors duration-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                                {item.label}
                                            </p>
                                            <p className="text-sm font-medium text-foreground truncate mt-0.5">
                                                {item.value}
                                            </p>
                                        </div>
                                        <IoChevronForward className="h-4 w-4 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
                                    </motion.div>
                                );

                                // Wrap actionable items in anchor tags for real tel:/mailto: links
                                if (item.actionable && item.href) {
                                    return (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            className="block no-underline"
                                        >
                                            {content}
                                        </a>
                                    );
                                }

                                return content;
                            })}
                        </div>

                        {/* Streak insight pill */}
                        {analytics.streakMonths > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ ...SPRING_BOUNCY, delay: 0.8 }}
                                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30"
                            >
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, -5, 0] }}
                                    transition={{ duration: 0.6, delay: 1.2 }}
                                >
                                    <IoSparklesOutline className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                </motion.div>
                                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                                    <FaFire color="orange" size={24} /> {analytics.streakMonths} month streak! Keep it going.
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* ═══════════════════════════════════════ */}
            {/* FULL-SCREEN DRAWER                      */}
            {/* ═══════════════════════════════════════ */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="h-[99dvh] rounded-t-[2rem] flex flex-col">
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
                    </div>

                    {/* Header */}
                    <DrawerHeader className="px-5 pb-3 pt-1.5 flex items-center justify-between border-b shrink-0">
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
                                    <IoCloseOutline className="h-5 w-5" />
                                </Button>
                            </motion.div>
                        </DrawerClose>
                    </DrawerHeader>

                    {/* Body */}
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