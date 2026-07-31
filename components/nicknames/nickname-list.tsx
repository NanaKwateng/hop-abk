// components/nicknames/nickname-list.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { searchMembersByNickname } from "@/actions/nicknames/index"; // Adjust path if needed
import { NicknameSpinWheel } from "./nickname-spin-wheel";
import { NicknameSearchResult } from "./nickname-search-result";
import { Input } from "@/components/ui/input"; // Fallback to raw inputs if custom components diverge
import { Grid2X2, List, Search, Loader2 } from "lucide-react";
import type { NicknameMember } from "@/lib/types/nickname";

export function NicknameList() {
    const [query, setQuery] = useState("");
    const [members, setMembers] = useState<NicknameMember[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isPending, startTransition] = useTransition();

    // Fetch initial list of valid alias profiles on startup mount
    useEffect(() => {
        startTransition(async () => {
            try {
                const res = await searchMembersByNickname("", 60);
                setMembers(res.members);
            } catch (err) {
                console.error(err);
            }
        });
    }, []);

    // Monitor input changes to refresh local array collections on demand
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        startTransition(async () => {
            try {
                const res = await searchMembersByNickname(val, 60);
                setMembers(res.members);
            } catch (err) {
                console.error(err);
            }
        });
    };

    const handleSelectMember = (id: string) => {
        console.log("Selected user sequence parameter identification ID token:", id);
    };

    return (
        <div className="space-y-8 w-full">
            {/* Control Bar: Input element + Grid/List Format Layout Toggles */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-neutral-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearchChange}
                        placeholder="Filter member aliases..."
                        className="w-full bg-neutral-950/60 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {isPending && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-500" />}
                </div>

                <div className="flex items-center gap-1.5 bg-neutral-950/80 p-1 rounded-xl border border-white/5 self-end sm:self-auto">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white shadow-sm" : "text-neutral-400 hover:text-white"}`}
                        title="Display in Grid Layout"
                    >
                        <Grid2X2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-600 text-white shadow-sm" : "text-neutral-400 hover:text-white"}`}
                        title="Display in List Layout"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 items-start">
                {/* Left Side: Filtered Search Layout Output (Grid vs List Layout Switch) */}
                <div className="w-full order-2 lg:order-1">
                    {members.length === 0 ? (
                        <div className="text-center py-12 text-sm text-neutral-500 border border-dashed border-white/5 rounded-2xl bg-neutral-900/10">
                            No member aliases found matching filter requirements.
                        </div>
                    ) : viewMode === "grid" ? (
                        /* Grid Layout Formulation Mode */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {members.map((member) => (
                                <div key={member.id} className="bg-neutral-900/30 border border-white/5 rounded-2xl p-1 hover:bg-neutral-900/60 transition-colors">
                                    <NicknameSearchResult member={member} onSelect={handleSelectMember} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* List Layout Formulation Mode */
                        <div className="flex flex-col border border-white/5 rounded-2xl bg-neutral-900/20 divide-y divide-white/5 overflow-hidden">
                            {members.map((member) => (
                                <NicknameSearchResult key={member.id} member={member} onSelect={handleSelectMember} className="rounded-none py-3 px-4" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: The Interactive 3D Apple-style Spin Wheel Component */}
                <div className="w-full lg:sticky lg:top-24 order-1 lg:order-2 bg-[#0a0a0c] p-4 rounded-3xl border border-white/5 shadow-2xl">
                    <div className="text-center pb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Interactive Rolodex</span>
                    </div>
                    <NicknameSpinWheel members={members} onSelect={handleSelectMember} />
                </div>
            </div>
        </div>
    );
}
