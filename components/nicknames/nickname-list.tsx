"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { searchMembersByNickname } from "@/actions/nicknames";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, X, Sparkles, ChevronRight, Hash, ShieldCheck } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { NicknameMember } from "@/lib/types/nickname";

// Vibrant gradient variations for user capsules
const CAPSULE_GRADIENTS = [
    "from-amber-500 via-orange-600 to-rose-600",
    "from-pink-500 via-purple-600 to-indigo-600",
    "from-emerald-400 via-teal-600 to-cyan-600",
    "from-lime-400 via-emerald-500 to-teal-700",
    "from-blue-500 via-indigo-600 to-violet-700",
];

export function NicknameList() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 250);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["nicknames-list", debouncedSearch],
        queryFn: () => searchMembersByNickname(debouncedSearch || "", 50),
        staleTime: 30000,
    });

    const members = data?.members || [];
    const hasResults = members.length > 0;
    const isSearching = searchQuery.trim().length > 0;

    const handleClear = () => setSearchQuery("");

    const handleMemberClick = (memberId: string) => {
        router.push(`/admin/users/${memberId}`);
    };

    return (
        <div className="relative z-10 flex flex-col gap-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 backdrop-blur-xl"
                    >
                        <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
                        <span>Interactive Nickname Directory</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
                    >
                        Find & Manage <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">Nicknames</span>
                    </motion.h1>

                    <p className="text-base text-slate-400 max-w-xl">
                        Search for registered alias tags across your network. Instant dynamic layout with real-time feedback.
                    </p>
                </div>

                {/* Dynamic Badge Counter */}
                {data?.totalCount !== undefined && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="self-start md:self-end rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl"
                    >
                        <div className="text-xs font-medium text-slate-400">Total Tagged Members</div>
                        <div className="text-2xl font-bold text-white">{data.totalCount}</div>
                    </motion.div>
                )}
            </div>

            {/* Dynamic Glass Search Bar */}
            <motion.div
                layout
                className="relative rounded-2xl border border-white/15 bg-white/5 p-2 shadow-2xl backdrop-blur-2xl transition-all hover:border-white/25 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10"
            >
                <div className="relative flex items-center">
                    <div className="pl-4 text-slate-400">
                        {isFetching ? (
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                        ) : (
                            <Search className="h-5 w-5 text-slate-400" />
                        )}
                    </div>

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type a nickname, alias or identity..."
                        className="w-full bg-transparent px-4 py-3.5 text-base text-white placeholder-slate-400 focus:outline-none"
                    />

                    <AnimatePresence>
                        {isSearching && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={handleClear}
                                className="mr-2 rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Dynamic Typing Micro-Progress Ring */}
                <AnimatePresence>
                    {isSearching && (
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 rounded-b-2xl"
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Results / Capsule Swiper View */}
            <div className="relative min-h-[300px] w-full">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                        <p className="text-sm font-medium">Querying Liquid Directory...</p>
                    </div>
                ) : hasResults ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <span>Results ({members.length})</span>
                            <span className="text-slate-500">Swipe or Scroll Horizontally &rarr;</span>
                        </div>

                        {/* Scrollable Swiper Deck */}
                        <div
                            ref={scrollRef}
                            className="flex items-center gap-5 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none"
                        >
                            <AnimatePresence mode="popLayout">
                                {members.map((member, idx) => {
                                    const gradient = CAPSULE_GRADIENTS[idx % CAPSULE_GRADIENTS.length];
                                    return (
                                        <motion.div
                                            key={member.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.25, delay: idx * 0.03 }}
                                            onClick={() => handleMemberClick(member.id)}
                                            className={`group relative flex-shrink-0 w-80 cursor-pointer snap-start overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-0.5 shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-indigo-500/20`}
                                        >
                                            {/* Glass Container */}
                                            <div className="flex h-full w-full flex-col justify-between rounded-[22px] bg-slate-950/80 p-5 backdrop-blur-xl transition-colors group-hover:bg-slate-950/70">
                                                {/* Top Row: Avatar & Alias Badge */}
                                                <div className="flex items-center justify-between gap-3">
                                                    <Avatar className="h-14 w-14 border-2 border-white/20 shadow-md">
                                                        <AvatarImage src={member.avatarUrl || undefined} />
                                                        <AvatarFallback className="bg-slate-800 text-base font-bold text-white">
                                                            {(member.firstName?.[0] || "") + (member.lastName?.[0] || "")}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex flex-col items-end">
                                                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-inner">
                                                            @{member.nickname || "alias"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Middle Row: Name & ID */}
                                                <div className="mt-6 space-y-1">
                                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                                                        {member.firstName} {member.lastName}
                                                    </h3>

                                                    <div className="flex items-center gap-2 text-xs text-slate-300">
                                                        {member.membershipId && (
                                                            <span className="flex items-center gap-1">
                                                                <Hash className="h-3 w-3 text-slate-400" />
                                                                {member.membershipId}
                                                            </span>
                                                        )}
                                                        {member.memberPosition && (
                                                            <span className="capitalize text-slate-400">• {member.memberPosition}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Group & Action Arrow */}
                                                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                                                    <span className="capitalize text-slate-400 font-medium line-clamp-1">
                                                        {member.memberGroup ? member.memberGroup.replace(/_/g, " ") : "Member"}
                                                    </span>

                                                    <div className="flex items-center gap-1 font-semibold text-white group-hover:translate-x-1 transition-transform">
                                                        View <ChevronRight className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : isSearching ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 p-12 text-center"
                    >
                        <div className="rounded-full bg-slate-900 p-4 text-slate-400 mb-3 border border-white/5">
                            <Search className="h-6 w-6" />
                        </div>
                        <p className="text-base font-semibold text-white">No nicknames matched</p>
                        <p className="text-sm text-slate-400 mt-1">
                            No active records found for &ldquo;<span className="text-indigo-400">{debouncedSearch}</span>&rdquo;
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 p-12 text-center"
                    >
                        <ShieldCheck className="h-8 w-8 text-slate-500 mb-2" />
                        <p className="text-sm text-slate-400">No member nickname profiles found in registry.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}