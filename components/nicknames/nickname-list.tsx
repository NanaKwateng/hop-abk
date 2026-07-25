"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { searchMembersByNickname } from "@/actions/nicknames";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, X, Hash } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type { NicknameMember } from "@/lib/types/nickname";

// Refined subtle glass-capsule border gradients
const CAPSULE_BORDERS = [
    "from-amber-400/40 via-orange-500/40 to-rose-500/40",
    "from-pink-400/40 via-purple-500/40 to-indigo-500/40",
    "from-emerald-300/40 via-teal-500/40 to-cyan-500/40",
    "from-lime-300/40 via-emerald-400/40 to-teal-600/40",
    "from-blue-400/40 via-indigo-500/40 to-violet-600/40",
];

export function NicknameList() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 250);
    const scrollRef = useRef<HTMLDivElement>(null);

    // TanStack Query logic remains completely unchanged
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
        <div className="relative z-10 flex flex-col gap-8 w-full max-w-full">

            {/* 1. Dynamic Glass Search Pill (Top-Right Corner Positioned) */}
            <motion.div
                layout
                className="relative self-end rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-slate-900/40 shadow-inner backdrop-blur-xl transition-all hover:border-slate-300 dark:hover:border-white/20 focus-within:border-indigo-400/50 dark:focus-within:border-indigo-500/50"
            >
                <div className="relative flex items-center px-4 w-72">
                    <div className="text-slate-400">
                        {isFetching ? (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </div>

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="search by nickname..."
                        className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 placeholder:italic focus:outline-none"
                    />

                    <AnimatePresence>
                        {isSearching && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={handleClear}
                                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-white transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="h-3 w-3" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* 2. Results / Capsule Swiper View */}
            <div className="relative min-h-[300px] w-full">
                {isLoading ? (
                    <div className="flex h-[300px] items-center justify-center text-slate-400 animate-pulse">
                        Querying registry...
                    </div>
                ) : hasResults ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <span>Results ({members.length})</span>
                        </div>

                        {/* Scrollable Swiper Deck */}
                        <div
                            ref={scrollRef}
                            className="flex items-center gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none"
                        >
                            <AnimatePresence mode="popLayout">
                                {members.map((member, idx) => {
                                    const borderGradient = CAPSULE_BORDERS[idx % CAPSULE_BORDERS.length];
                                    return (
                                        <motion.div
                                            key={member.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9, y: 15 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                                            onClick={() => handleMemberClick(member.id)}
                                            className={`group relative flex-shrink-0 cursor-pointer snap-start overflow-hidden rounded-full w-fit p-px shadow-inner transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg dark:hover:shadow-indigo-950`}
                                        >
                                            {/* Subtle subtle localized gradient background */}
                                            <div className={`absolute inset-0 bg-gradient-to-r opacity-5 ${borderGradient}`} />

                                            {/* Subdued Inner Gradient Border */}
                                            <div className={`absolute inset-0 rounded-full border border-transparent bg-gradient-to-r p-px ${borderGradient} mask-image-edge mask-gradient`} />

                                            {/* Clean Liquid Glass Capsule Inner */}
                                            <div className="flex items-center gap-4 h-full rounded-full bg-white/60 dark:bg-black/30 px-3 py-2 backdrop-blur-2xl transition-colors group-hover:bg-white/80 dark:group-hover:bg-black/50 border border-slate-200 dark:border-white/5">

                                                {/* Avatar */}
                                                <Avatar className="h-10 w-10 border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                                                    <AvatarImage src={member.avatarUrl || undefined} />
                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        {(member.firstName?.[0] || "") + (member.lastName?.[0] || "")}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Member Details */}
                                                <div className="flex-grow pr-4 py-1 space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white transition-colors line-clamp-1">
                                                            {member.firstName} {member.lastName}
                                                        </h3>
                                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                                                            @{member.nickname || "alias"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 capitalize">
                                                        {member.membershipId && (
                                                            <span className="flex items-center gap-1">
                                                                <Hash className="h-3 w-3 text-slate-400" />
                                                                {member.membershipId}
                                                            </span>
                                                        )}
                                                        {member.memberPosition && <span>• {member.memberPosition}</span>}
                                                        {member.memberGroup && <span className="line-clamp-1">• {member.memberGroup.replace(/_/g, " ")}</span>}
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
                        className="flex flex-col items-center justify-center h-[300px] text-center"
                    >
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            No results found for &ldquo;<strong className="text-slate-800 dark:text-slate-200">{debouncedSearch}</strong>&rdquo;
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-[300px] text-center text-sm text-slate-500"
                    >
                        No member profiles currently have aliases assigned.
                    </motion.div>
                )}
            </div>
        </div>
    );
}