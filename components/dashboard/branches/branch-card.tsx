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

// Visual themes extracted from the reference layout image
const CARD_THEMES = [
    {
        // 0: Peach Chevron Shards Theme
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
                {/* Chevron Shard 1 */}
                <path d="M 120,20 L 165,65 A 12,12 0 0,1 165,82 L 120,127 A 8,8 0 0,1 106,120 L 138,77 A 8,8 0 0,0 138,70 L 106,27 A 8,8 0 0,1 120,20 Z" fill="url(#peachGrad)" />
                {/* Chevron Shard 2 */}
                <path d="M 120,85 L 165,130 A 12,12 0 0,1 165,147 L 120,192 A 8,8 0 0,1 106,185 L 138,142 A 8,8 0 0,0 138,135 L 106,92 A 8,8 0 0,1 120,85 Z" fill="url(#peachGrad)" opacity="0.8" />
            </svg>
        ),
    },
    {
        // 1: Neutral Spheres & Arcs Theme
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
                {/* Top Half-Circle Cut */}
                <path d="M 200,0 A 50,50 0 0,0 150,50 L 200,50 Z" fill="url(#neutralGrad)" />
                {/* Center Solid Circle */}
                <circle cx="160" cy="110" r="35" fill="url(#neutralGrad)" />
                {/* Bottom Semicircle */}
                <path d="M 125,175 A 35,35 0 0,1 195,175 Z" fill="url(#neutralGrad)" />
            </svg>
        ),
    },
    {
        // 2: Purple Concentric Ring Gradient Theme
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
    {
        // 3: Emerald Rounded Block Mesh Theme
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
                {/* Rounded Block Cluster */}
                <rect x="130" y="25" width="45" height="45" rx="14" fill="url(#emeraldGrad)" />
                <rect x="80" y="75" width="45" height="45" rx="14" fill="url(#emeraldGrad)" opacity="0.8" />
                <rect x="130" y="75" width="45" height="45" rx="14" fill="url(#emeraldGrad)" opacity="0.6" />
                <rect x="80" y="125" width="45" height="45" rx="14" fill="url(#emeraldGrad)" opacity="0.9" />
                <rect x="130" y="125" width="45" height="45" rx="14" fill="url(#emeraldGrad)" opacity="0.7" />
            </svg>
        ),
    },
];

export function BranchCard({ branch, index }: BranchCardProps) {
    const router = useRouter();
    const initials = branch.leaderFullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const positionLabel = LEADER_POSITIONS.find((p) => p.value === branch.leaderPosition)?.label ?? "Leader";

    // Cycle through visual themes based on index
    const theme = CARD_THEMES[index % CARD_THEMES.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
            onClick={() => router.push(`/admin/branches/${branch.slug}`)}
            className={`group relative overflow-hidden rounded-3xl border ${theme.bg} ${theme.border} p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1.5`}
        >
            {/* ── BACKGROUND GEOMETRIC ARTWORK & HOVER MICRO-INTERACTION ── */}
            <motion.div
                className="absolute -right-4 -bottom-4 w-56 h-56 pointer-events-none select-none z-0"
                initial={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.12, rotate: -3 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {theme.renderShapes()}
            </motion.div>

            {/* Subtle Gradient Glow Layer on Hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

            {/* ── FOREGROUND CONTENT LAYER ── */}
            <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Top Section */}
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-white/60 dark:border-white/10 shadow-md">
                                <AvatarImage src={branch.leaderAvatarUrl || ""} />
                                <AvatarFallback className={`text-xs font-semibold ${theme.badgeBg}`}>
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-lg leading-snug tracking-tight group-hover:translate-x-0.5 transition-transform line-clamp-1">
                                    {branch.name}
                                </h3>
                                <p className="text-xs font-medium opacity-75">{positionLabel}: {branch.leaderFullName}</p>
                            </div>
                        </div>
                        <div className={`p-1.5 rounded-full ${theme.badgeBg} group-hover:scale-110 transition-transform`}>
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 text-sm font-medium mt-4">
                        <div className="flex items-center gap-2 opacity-85">
                            <MapPin className={`h-4 w-4 shrink-0 ${theme.accent}`} />
                            <span className="truncate">{branch.location}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-85">
                            <Users className={`h-4 w-4 shrink-0 ${theme.accent}`} />
                            <span>{branch.membershipSize} members</span>
                        </div>
                        {branch.helpline && (
                            <div className="flex items-center gap-2 opacity-85">
                                <Phone className={`h-4 w-4 shrink-0 ${theme.accent}`} />
                                <span>{branch.helpline}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-black/5 dark:border-white/10">
                    {branch.yearEstablished && (
                        <Badge variant="outline" className={`text-[10px] gap-1 font-semibold border-transparent ${theme.badgeBg}`}>
                            <Calendar className="h-3 w-3" />
                            Est. {branch.yearEstablished}
                        </Badge>
                    )}
                    {branch.gpsLat && branch.gpsLng && (
                        <Badge variant="outline" className={`text-[10px] gap-1 font-semibold border-transparent ${theme.badgeBg}`}>
                            <MapPin className="h-3 w-3" />
                            GPS Configured
                        </Badge>
                    )}
                </div>
            </div>
        </motion.div>
    );
}