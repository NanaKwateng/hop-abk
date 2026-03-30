// components/dashboard/branches/branch-detail-page.tsx
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

// ✅ FIXED: Proper Variants type definition
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

    // Determine map query
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
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-8"
            >
                <Sparkles className="absolute top-4 right-4 h-6 w-6 text-primary/30" />
                <h2 className="text-xl font-semibold mb-2">
                    Welcome to {branch.name}
                </h2>
                <p className="text-sm text-muted-foreground max-w-lg">
                    This branch was established{" "}
                    {branch.yearEstablished
                        ? `in ${branch.yearEstablished}`
                        : "recently"}{" "}
                    and currently manages <strong>{branch.membershipSize}</strong>{" "}
                    members under the leadership of {positionLabel}{" "}
                    {branch.leaderFullName}.
                </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1: Branch Info (Spans 2 cols) */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ delay: 0 * 0.08 }}
                    className="md:col-span-2 rounded-2xl border bg-card p-6 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" /> Branch
                            Information
                        </h3>
                        <Badge variant="secondary" className="text-[10px]">
                            Overview
                        </Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">
                                Name
                            </p>
                            <p className="font-medium">{branch.name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">
                                Location
                            </p>
                            <p className="font-medium flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {branch.location}
                            </p>
                        </div>
                        {branch.address && (
                            <div className="space-y-1 sm:col-span-2">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                                    Address
                                </p>
                                <p className="font-medium">{branch.address}</p>
                            </div>
                        )}
                        {branch.helpline && (
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                                    Helpline
                                </p>
                                <p className="font-medium flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    {branch.helpline}
                                </p>
                            </div>
                        )}
                        {branch.yearEstablished && (
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider">
                                    Established
                                </p>
                                <p className="font-medium flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {branch.yearEstablished}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Card 2: Membership */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ delay: 1 * 0.08 }}
                    className="rounded-2xl border bg-card p-6 space-y-4"
                >
                    <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" /> Members
                    </h3>
                    <Separator />
                    <div className="text-center py-4">
                        <p className="text-5xl font-bold text-primary">
                            {branch.membershipSize}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Total Members
                        </p>
                    </div>
                    <div className="flex -space-x-2 justify-center">
                        {Array.from({
                            length: Math.min(5, branch.membershipSize),
                        }).map((_, i) => (
                            <div
                                key={i}
                                className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground"
                            >
                                {i + 1}
                            </div>
                        ))}
                        {branch.membershipSize > 5 && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-medium text-primary">
                                +{branch.membershipSize - 5}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Card 3: Leader Profile */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ delay: 2 * 0.08 }}
                    className="md:col-span-2 lg:col-span-1 rounded-2xl border bg-card p-6 space-y-4"
                >
                    <h3 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-green-500" /> Branch Leader
                    </h3>
                    <Separator />
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 shadow-md">
                            <AvatarImage src={branch.leaderAvatarUrl || ""} />
                            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-lg">
                                {branch.leaderFullName}
                            </p>
                            <Badge variant="secondary" className="text-xs gap-1">
                                <Shield className="h-3 w-3" />
                                {positionLabel}
                            </Badge>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        {branch.leaderContact && (
                            <p className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                {branch.leaderContact}
                            </p>
                        )}
                        {branch.leaderEmail && (
                            <p className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                {branch.leaderEmail}
                            </p>
                        )}
                        {branch.leaderPlaceOfStay && (
                            <p className="flex items-center gap-2 text-muted-foreground">
                                <Home className="h-3.5 w-3.5" />
                                {branch.leaderPlaceOfStay}
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Card 4: Map View with Drawer */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ delay: 3 * 0.08 }}
                    className="md:col-span-2 rounded-2xl border bg-card overflow-hidden"
                >
                    <div className="p-6 pb-3 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-500" /> Location Map
                        </h3>
                        {hasAnyLocation && (
                            <BranchMapDrawer
                                branch={branch}
                                trigger={
                                    <Button variant="ghost" size="sm" className="gap-1.5">
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
                                className="w-full h-[280px] border-t"
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
                                    className="gap-1.5 shadow-lg"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" /> Open in Maps
                                </Button>
                            </a>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center border-t">
                            <Navigation className="h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No GPS coordinates provided
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Edit the branch to add a location
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Card 5: Spouse (conditional) */}
                {hasSpouse && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        transition={{ delay: 4 * 0.08 }}
                        className="rounded-2xl border bg-card p-6 space-y-4"
                    >
                        <h3 className="font-semibold flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-500" /> Spouse Details
                        </h3>
                        <Separator />
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                    Name
                                </p>
                                <p className="font-medium">{branch.spouseName}</p>
                            </div>
                            {branch.spouseContact && (
                                <p className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-3.5 w-3.5" />
                                    {branch.spouseContact}
                                </p>
                            )}
                            {branch.spouseEmail && (
                                <p className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5" />
                                    {branch.spouseEmail}
                                </p>
                            )}
                            {branch.spousePlaceOfStay && (
                                <p className="flex items-center gap-2 text-muted-foreground">
                                    <Home className="h-3.5 w-3.5" />
                                    {branch.spousePlaceOfStay}
                                </p>
                            )}
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