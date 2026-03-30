// components/dashboard/branches/branches-list.tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BranchCard } from "./branch-card";
import { CreateBranchDrawer } from "./create-branch-drawer";
import { useBranchesRealtime } from "@/hooks/use-branches-realtime";
import { useDebounce } from "@/hooks/use-debounce";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Input } from "@/components/ui/input";
import { GitBranchPlus, Search, Plus } from "lucide-react";
import type { Branch } from "@/lib/types/branch";

interface BranchesListProps {
    initialBranches: Branch[];
}

export function BranchesList({ initialBranches }: BranchesListProps) {
    // Real-time updates
    const branches = useBranchesRealtime(initialBranches);

    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Debounced search
    const debouncedSearch = useDebounce(search, 300);

    // Memoized filtered results
    const filtered = useMemo(
        () =>
            branches.filter(
                (b) =>
                    b.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                    b.location.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                    b.leaderFullName
                        .toLowerCase()
                        .includes(debouncedSearch.toLowerCase())
            ),
        [branches, debouncedSearch]
    );

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Branches</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage all {branches.length} branch
                        {branches.length !== 1 ? "es" : ""}
                    </p>
                </div>
                <HoverBorderGradient
                    containerClassName="rounded-md"
                    as="button"
                    className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-3 py-2 text-xs"
                    onClick={() => setDrawerOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    <span>New Branch</span>
                </HoverBorderGradient>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search branches..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10"
                />
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <GitBranchPlus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                            {search ? "No branches found" : "No branches yet"}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            {search
                                ? "Try adjusting your search terms."
                                : "Create your first branch to get started."}
                        </p>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((branch, i) => (
                        <BranchCard key={branch.id} branch={branch} index={i} />
                    ))}
                </div>
            )}

            <CreateBranchDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
        </div>
    );
}