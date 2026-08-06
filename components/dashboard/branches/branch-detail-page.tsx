"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
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
    Building2,
    MapPin,
    Users,
    Phone,
    Mail,
    Calendar,
    Navigation,
    User,
    Heart,
    Pencil,
    Trash2,
    ExternalLink,
    Shield,
    Home,
    Sparkles,
    Maximize2,
} from "lucide-react";
import { deleteBranch } from "@/actions/branch";
import { toast } from "sonner";
import { LEADER_POSITIONS } from "@/lib/types/branch";
import { EditBranchDrawer } from "./edit-branch-drawer";
import { BranchMapDrawer } from "./branch-map-drawer";
import type { Branch } from "@/lib/types/branch";

// Extracted color themes and SVG vectors matching reference image
const CARD_THEMES = {
    peach: {
        bg: "bg-[#FFF2EA] dark:bg-[#2A1E19] text-[#4A2818] dark:text-[#FCEBE1]",
        border: "border-[#FCD7C4]/60 dark:border-[#4A2818]",
        badgeBg: "bg-[#FFE4D3] text-[#D96B27] dark:bg-[#3D2316] dark:text-[#FF9D66]",
        accent: "text-[#D96B27] dark:text-[#FF9D66]",
        renderShapes: () => (
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-40 dark:opacity-30">
                <defs>
                    <linearGradient id="peachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F99F68" />
                        <stop offset="100%" stopColor="#E06928" />
                    </linearGradient>
                </defs>
                <path d="M 120,20 L 165,65 A 12,12 0 0,1 165,82 L 120,127 A 8,8 0 0,1 106,120 L 138,77 A 8,8 0 0,0 138,70 L 106,27 A 8,8 0 0,1 120,20 Z" fill="url(#peachGrad)" />
                <path d="M 120,85 L 165,130 A 12,12 0 0,1 165,147 L 120,192 A 8,8 0 0,1 106,185 L 138,142 A 8,8 0 0,0 138,135 L 106,92 A 8,8 0 0,1 120,85 Z" fill="url(#peachGrad)" opacity="0.8" />
            </svg>
        ),
    },
    neutral: {
        bg: "bg-[#F3F4F1] dark:bg-[#1E201E] text-[#2C302E] dark:text-[#E2E4E1]",
        border: "border-[#E1E3DE]/80 dark:border-[#323633]",
        badgeBg: "bg-[#E5E7E2] text-[#3D423F] dark:bg-[#2C302E] dark:text-[#C5C8C3]",
        accent: "text-[#4A504C] dark:text-[#A3A8A4]",
        renderShapes: () => (
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-35 dark:opacity-25">
                <defs>
                    <linearGradient id="neutralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C4C7C0" />
                        <stop offset="100%" stopColor="#787C77" />
                    </linearGradient>
                </defs>
                <path d="M 200,0 A 50,50 0 0,0 150,50 L 200,50 Z" fill="url(#neutralGrad)" />
                <circle cx="160" cy="110" r="35" fill="url(#neutralGrad)" />
                <path d="M 125,175 A 35,35 0 0,1 195,175 Z" fill="url(#neutralGrad)" />
            </svg>
        ),
    },
    purple: {
        bg: "bg-[#F1EDFB] dark:bg-[#1F1B2C] text-[#33254B] dark:text-[#ECE5F8]",
        border: "border-[#DFD7F5]/70 dark:border-[#382F4E]",
        badgeBg: "bg-[#E2D9F8] text-[#7651C5] dark:bg-[#312547] dark:text-[#B59BF2]",
        accent: "text-[#7651C5] dark:text-[#B59BF2]",
        renderShapes: () => (
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-45 dark:opacity-30">
                <defs>
                    <radialGradient id="purpleRing" cx="70%" cy="50%" r="65%">
                        <stop offset="0%" stopColor="#A88BEB" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#8E66DF" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#C4B2F4" stopOpacity="0.1" />
                    </radialGradient>
                </defs>
                <circle cx="170" cy="110" r="75" fill="url(#purpleRing)" />
                <circle cx="170" cy="110" r="48" fill="url(#purpleRing)" opacity="0.7" />
                <circle cx="170" cy="110" r="22" fill="#8E66DF" opacity="0.3" />
            </svg>
        ),
    },
    emerald: {
        bg: "bg-[#EDF6EF] dark:bg-[#18261C] text-[#1B3A23] dark:text-[#E0F2E4]",
        border: "border-[#D3E9D8]/70 dark:border-[#27422D]",
        badgeBg: "bg-[#D9EFE0] text-[#227B40] dark:bg-[#223F2A] dark:text-[#6EE792]",
        accent: "text-[#227B40] dark:text-[#6EE792]",
        renderShapes: () => (
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-40 dark:opacity-30">
                <defs>
                    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#52C478" />
                        <stop offset="100%" stopColor="#1E7A40" />
                    </linearGradient>
                </defs>
                <rect x="130" y="25" width="45" height="45" rx="14" fill="url(#emeraldGrad)" />
                <rect x="80" y="75" width="45" height="45" rx="14" fill="url(#emeraldGrad)" opacity="0.8" />
                <rect x="130" y="75" width="45" height="45" rx="14" fill="url(#emeraldGrad)" opacity="0.6" />
                <rect x="80" y="125" width="45" height="45" rx="14" fill="url(#emeraldGrad)" opacity="0.9" />
                <rect x="130" y="125" width="45" height="45" rx="14" fill="url(#emeraldGrad)" opacity="0.7" />
            </svg>
        ),
    },
};

const cardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

interface BranchDetailPageProps {
    branch: Branch;
}

export function BranchDetailPage({ branch }: BranchDetailPageProps) {
    const router = useRouter();
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const positionLabel =
        LEADER_POSITIONS.find((p) => p.value === branch.leaderPosition)?.label ??
        "Leader";
    const initials = branch.leaderFullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const hasGps = branch.gpsLat && branch.gpsLng;
    const hasAnyLocation = hasGps || branch.gpsAddress || branch.location;
    const hasSpouse = branch.leaderStatus === "married" && branch.spouseName;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteBranch(branch.id);
            toast.success("Branch deleted");
            router.push("/admin/branches");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
            setShowDelete(false);
        }
    };

    const mapQuery = hasGps
        ? `${branch.gpsLat},${branch.gpsLng}`
        : encodeURIComponent(branch.gpsAddress || branch.location);

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/admin/branches")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" /> {branch.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">{branch.location}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setShowDelete(true)}
                    >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                    </Button>
                </div>
            </div>

            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:shadow-xl ${CARD_THEMES.peach.bg} ${CARD_THEMES.peach.border}`}
            >
                <motion.div
                    className="absolute -right-4 -bottom-4 w-64 h-64 pointer-events-none select-none z-0"
                    initial={{ scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.08, rotate: -2 }}
                    transition={{ duration: 0.4 }}
                >
                    {CARD_THEMES.peach.renderShapes()}
                </motion.div>
                <div className="relative z-10">
                    <Sparkles className={`absolute top-0 right-0 h-6 w-6 ${CARD_THEMES.peach.accent}`} />
                    <h2 className="text-xl font-bold mb-2">
                        Welcome to {branch.name}
                    </h2>
                    <p className="text-sm opacity-90 max-w-lg leading-relaxed">
                        This branch was established{" "}
                        {branch.yearEstablished
                            ? `in ${branch.yearEstablished}`
                            : "recently"}{" "}
                        and currently manages <strong>{branch.membershipSize}</strong>{" "}
                        members under the leadership of {positionLabel}{" "}
                        {branch.leaderFullName}.
                    </p>
                </div>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1: Branch Info (Peach Theme) */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ delay: 0 * 0.08 }}
                    whileHover={{ y: -4 }}
                    className={`group relative overflow-hidden md:col-span-2 rounded-3xl border p-6 space-y-4 transition-all duration-300 hover:shadow-2xl ${CARD_THEMES.peach.bg} ${CARD_THEMES.peach.border}`}
                >
                    <motion.div
                        className="absolute -right-6 -bottom-6 w-60 h-60 pointer-events-none select-none z-0"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1, rotate: -3 }}
                        transition={{ duration: 0.4 }}
                    >
                        {CARD_THEMES.peach.renderShapes()}
                    </motion.div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Building2 className={`h-5 w-5 ${CARD_THEMES.peach.accent}`} /> Branch Information
                            </h3>
                            <Badge variant="outline" className={`text-[10px] font-semibold border-transparent ${CARD_THEMES.peach.badgeBg}`}>
                                Overview
                            </Badge>
                        </div>
                        <Separator className="bg-black/5 dark:bg-white/10" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                            <div className="space-y-1">
                                <p className="opacity-60 text-xs uppercase tracking-wider">Name</p>
                                <p className="font-semibold text-base">{branch.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="opacity-60 text-xs uppercase tracking-wider">Location</p>
                                <p className="font-semibold flex items-center gap-1">
                                    <MapPin className={`h-4 w-4 ${CARD_THEMES.peach.accent}`} />
                                    {branch.location}
                                </p>
                            </div>
                            {branch.address && (
                                <div className="space-y-1 sm:col-span-2">
                                    <p className="opacity-60 text-xs uppercase tracking-wider">Address</p>
                                    <p className="font-semibold">{branch.address}</p>
                                </div>
                            )}
                            {branch.helpline && (
                                <div className="space-y-1">
                                    <p className="opacity-60 text-xs uppercase tracking-wider">Helpline</p>
                                    <p className="font-semibold flex items-center gap-1">
                                        <Phone className={`h-4 w-4 ${CARD_THEMES.peach.accent}`} />
                                        {branch.helpline}
                                    </p>
                                </div>
                            )}
                            {branch.yearEstablished && (
                                <div className="space-y-1">
                                    <p className="opacity-60 text-xs uppercase tracking-wider">Established</p>
                                    <p className="font-semibold flex items-center gap-1">
                                        <Calendar className={`h-4 w-4 ${CARD_THEMES.peach.accent}`} />
                                        {branch.yearEstablished}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Card 2: Membership (Emerald Mesh Theme) */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ delay: 1 * 0.08 }}
                    whileHover={{ y: -4 }}
                    className={`group relative overflow-hidden rounded-3xl border p-6 space-y-4 transition-all duration-300 hover:shadow-2xl ${CARD_THEMES.emerald.bg} ${CARD_THEMES.emerald.border}`}
                >
                    <motion.div
                        className="absolute -right-6 -bottom-6 w-56 h-56 pointer-events-none select-none z-0"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.12, rotate: 4 }}
                        transition={{ duration: 0.4 }}
                    >
                        {CARD_THEMES.emerald.renderShapes()}
                    </motion.div>

                    <div className="relative z-10 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Users className={`h-5 w-5 ${CARD_THEMES.emerald.accent}`} /> Members
                        </h3>
                        <Separator className="bg-black/5 dark:bg-white/10" />
                        <div className="text-center py-2">
                            <p className={`text-5xl font-black ${CARD_THEMES.emerald.accent}`}>
                                {branch.membershipSize}
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mt-2">
                                Total Active Members
                            </p>
                        </div>
                        <div className="flex -space-x-2 justify-center">
                            {Array.from({
                                length: Math.min(5, branch.membershipSize),
                            }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-8 h-8 rounded-full ${CARD_THEMES.emerald.badgeBg} border-2 border-white/60 dark:border-white/10 flex items-center justify-center text-[10px] font-bold`}
                                >
                                    {i + 1}
                                </div>
                            ))}
                            {branch.membershipSize > 5 && (
                                <div className={`w-8 h-8 rounded-full ${CARD_THEMES.emerald.badgeBg} border-2 border-white/60 dark:border-white/10 flex items-center justify-center text-[10px] font-bold`}>
                                    +{branch.membershipSize - 5}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Card 3: Leader Profile (Neutral Theme) */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ delay: 2 * 0.08 }}
                    whileHover={{ y: -4 }}
                    className={`group relative overflow-hidden md:col-span-2 lg:col-span-1 rounded-3xl border p-6 space-y-4 transition-all duration-300 hover:shadow-2xl ${CARD_THEMES.neutral.bg} ${CARD_THEMES.neutral.border}`}
                >
                    <motion.div
                        className="absolute -right-6 -bottom-6 w-56 h-56 pointer-events-none select-none z-0"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1, rotate: -2 }}
                        transition={{ duration: 0.4 }}
                    >
                        {CARD_THEMES.neutral.renderShapes()}
                    </motion.div>

                    <div className="relative z-10 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <User className={`h-5 w-5 ${CARD_THEMES.neutral.accent}`} /> Branch Leader
                        </h3>
                        <Separator className="bg-black/5 dark:bg-white/10" />
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-white/60 dark:border-white/10 shadow-md">
                                <AvatarImage src={branch.leaderAvatarUrl || ""} />
                                <AvatarFallback className={`text-lg font-bold ${CARD_THEMES.neutral.badgeBg}`}>
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-lg leading-snug">
                                    {branch.leaderFullName}
                                </p>
                                <Badge variant="outline" className={`text-xs gap-1 font-semibold border-transparent ${CARD_THEMES.neutral.badgeBg} mt-1`}>
                                    <Shield className="h-3 w-3" />
                                    {positionLabel}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm font-medium pt-2">
                            {branch.leaderContact && (
                                <p className="flex items-center gap-2 opacity-80">
                                    <Phone className={`h-4 w-4 ${CARD_THEMES.neutral.accent}`} />
                                    {branch.leaderContact}
                                </p>
                            )}
                            {branch.leaderEmail && (
                                <p className="flex items-center gap-2 opacity-80 truncate">
                                    <Mail className={`h-4 w-4 ${CARD_THEMES.neutral.accent}`} />
                                    {branch.leaderEmail}
                                </p>
                            )}
                            {branch.leaderPlaceOfStay && (
                                <p className="flex items-center gap-2 opacity-80">
                                    <Home className={`h-4 w-4 ${CARD_THEMES.neutral.accent}`} />
                                    {branch.leaderPlaceOfStay}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Card 4: Map View (Purple Ring Theme) */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ delay: 3 * 0.08 }}
                    whileHover={{ y: -4 }}
                    className={`group relative overflow-hidden md:col-span-2 rounded-3xl border ${CARD_THEMES.purple.bg} ${CARD_THEMES.purple.border} transition-all duration-300 hover:shadow-2xl`}
                >
                    <motion.div
                        className="absolute -right-6 -bottom-6 w-60 h-60 pointer-events-none select-none z-0"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ duration: 0.4 }}
                    >
                        {CARD_THEMES.purple.renderShapes()}
                    </motion.div>

                    <div className="relative z-10">
                        <div className="p-6 pb-3 flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <MapPin className={`h-5 w-5 ${CARD_THEMES.purple.accent}`} /> Location Map
                            </h3>
                            {hasAnyLocation && (
                                <BranchMapDrawer
                                    branch={branch}
                                    trigger={
                                        <Button variant="ghost" size="sm" className={`gap-1.5 ${CARD_THEMES.purple.badgeBg}`}>
                                            <Maximize2 className="h-3.5 w-3.5" />
                                            Expand
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                        {hasAnyLocation ? (
                            <div className="relative">
                                <iframe
                                    className="w-full h-[280px] border-t border-black/5 dark:border-white/10"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${mapQuery}&zoom=15`}
                                    allowFullScreen
                                />
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-3 right-3"
                                >
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-1.5 shadow-lg font-semibold"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" /> Open in Maps
                                    </Button>
                                </a>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-center border-t border-black/5 dark:border-white/10 p-6">
                                <Navigation className="h-8 w-8 opacity-40 mb-2" />
                                <p className="text-sm font-semibold">
                                    No GPS coordinates provided
                                </p>
                                <p className="text-xs opacity-75 mt-1">
                                    Edit the branch to add a location
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Card 5: Spouse (Peach Theme - Conditional) */}
                {hasSpouse && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        transition={{ delay: 4 * 0.08 }}
                        whileHover={{ y: -4 }}
                        className={`group relative overflow-hidden rounded-3xl border p-6 space-y-4 transition-all duration-300 hover:shadow-2xl ${CARD_THEMES.peach.bg} ${CARD_THEMES.peach.border}`}
                    >
                        <motion.div
                            className="absolute -right-6 -bottom-6 w-52 h-52 pointer-events-none select-none z-0"
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.1, rotate: -2 }}
                            transition={{ duration: 0.4 }}
                        >
                            {CARD_THEMES.peach.renderShapes()}
                        </motion.div>

                        <div className="relative z-10 space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Heart className={`h-5 w-5 ${CARD_THEMES.peach.accent}`} /> Spouse Details
                            </h3>
                            <Separator className="bg-black/5 dark:bg-white/10" />
                            <div className="space-y-2 text-sm font-medium">
                                <div>
                                    <p className="opacity-60 text-xs uppercase tracking-wider">Name</p>
                                    <p className="font-semibold text-base">{branch.spouseName}</p>
                                </div>
                                {branch.spouseContact && (
                                    <p className="flex items-center gap-2 opacity-80">
                                        <Phone className={`h-4 w-4 ${CARD_THEMES.peach.accent}`} />
                                        {branch.spouseContact}
                                    </p>
                                )}
                                {branch.spouseEmail && (
                                    <p className="flex items-center gap-2 opacity-80 truncate">
                                        <Mail className={`h-4 w-4 ${CARD_THEMES.peach.accent}`} />
                                        {branch.spouseEmail}
                                    </p>
                                )}
                                {branch.spousePlaceOfStay && (
                                    <p className="flex items-center gap-2 opacity-80">
                                        <Home className={`h-4 w-4 ${CARD_THEMES.peach.accent}`} />
                                        {branch.spousePlaceOfStay}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Edit Drawer */}
            <EditBranchDrawer
                open={editOpen}
                onOpenChange={setEditOpen}
                branch={branch}
            />

            {/* Delete Dialog */}
            <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {branch.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this branch and all associated
                            data. This action cannot be undone.
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
                            {isDeleting ? "Deleting…" : "Delete Branch"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}