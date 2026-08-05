// components/dashboard/branches/branch-card.tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Phone, Calendar, ChevronRight } from "lucide-react";
import type { Branch } from "@/lib/types/branch";
import { LEADER_POSITIONS } from "@/lib/types/branch";

interface BranchCardProps {
    branch: Branch;
    index: number;
}

export function BranchCard({ branch, index }: BranchCardProps) {
    const router = useRouter();
    const initials = branch.leaderFullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const positionLabel = LEADER_POSITIONS.find((p) => p.value === branch.leaderPosition)?.label ?? "Leader";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
            onClick={() => router.push(`/admin/branches/${branch.slug}`)}
            className="group relative rounded-2xl border bg-card p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1"
        >
            {/* Top Section */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                        <AvatarImage src={branch.leaderAvatarUrl || ""} />
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                            {branch.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{positionLabel}: {branch.leaderFullName}</p>
                    </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            {/* Info Grid */}
            <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{branch.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>{branch.membershipSize} members</span>
                </div>
                {branch.helpline && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{branch.helpline}</span>
                    </div>
                )}
            </div>

            {/* Footer Badges */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                {branch.yearEstablished && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                        <Calendar className="h-3 w-3" />
                        Est. {branch.yearEstablished}
                    </Badge>
                )}
                {branch.gpsLat && branch.gpsLng && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                        <MapPin className="h-3 w-3" />
                        GPS
                    </Badge>
                )}
            </div>
        </motion.div>
    );
}