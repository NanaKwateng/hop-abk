// components/dashboard/tasks/task-stats-cards.tsx
"use client";

import {
    BarChart3,
    CheckCircle2,
    Clock,
    CreditCard,
    TrendingUp,
    Globe,
    ArrowUpRight,
    Layers,
    Sparkles,
    Cloud,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/task-utils";
import type { TaskDetail } from "@/lib/types/task";

interface TaskStatsCardsProps {
    task: TaskDetail;
    totalActivities: number;
    completedActivities: number;
    pendingActivities: number;
    totalPayments: number;
    processedMembers: number;
}

export function TaskStatsCards({
    task,
    totalActivities,
    completedActivities,
    pendingActivities,
    totalPayments,
    processedMembers,
}: TaskStatsCardsProps) {
    return (
        <div className="space-y-4 text-white">
            {/* Top Large Bento Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Total Activities - Main Showcase Card */}
                <div className="md:col-span-7 relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12] p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
                    {/* Header & Main Value */}
                    <div className="z-10 max-w-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/10">
                                <BarChart3 className="h-3.5 w-3.5 text-white" />
                            </span>
                            <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                                Overview
                            </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            Total Activities
                        </h3>
                        <div className="text-4xl sm:text-5xl font-black tracking-tight text-white pt-2 tabular-nums">
                            {totalActivities}
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-400">
                            Track and monitor all operations processed across active members.
                        </p>
                    </div>

                    {/* Action pill button */}
                    <div className="z-10 mt-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer">
                            <span>View Details</span>
                            <ArrowUpRight className="h-3 w-3" />
                        </div>
                    </div>

                    {/* Graphical Background Decoration - Globe/Grid element */}
                    <div className="absolute right-[-20px] bottom-[-20px] sm:right-0 sm:bottom-0 pointer-events-none opacity-80">
                        <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                            {/* Wireframe Grid */}
                            <div
                                className="absolute inset-0 rounded-full border border-white/10"
                                style={{
                                    backgroundImage:
                                        "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                                    backgroundSize: "12px 12px",
                                }}
                            />
                            {/* Colorful Gradient Sphere */}
                            <div className="absolute bottom-4 right-4 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-amber-500 via-emerald-400 to-cyan-500 opacity-90 blur-0 shadow-2xl flex items-center justify-center">
                                <Globe className="w-20 h-20 text-black/20" />
                            </div>
                            <div className="absolute top-8 left-4 border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-white">
                                Active
                            </div>
                            <div className="absolute bottom-12 left-2 border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-white">
                                {processedMembers} Members
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completion & Financial Card */}
                <div className="md:col-span-5 relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12] p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
                    <div className="z-10 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/10">
                                {task.purpose === "payments" ? (
                                    <CreditCard className="h-3.5 w-3.5 text-white" />
                                ) : (
                                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                                )}
                            </span>
                            <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                                {task.purpose === "payments" ? "Finances" : "Performance"}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold tracking-tight text-white">
                            {task.purpose === "payments" ? "Total Payments" : "Overall Progress"}
                        </h3>

                        <div className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums pt-1">
                            {task.purpose === "payments"
                                ? formatCurrency(totalPayments)
                                : `${Math.round(task.completionRate || 0)}%`}
                        </div>

                        <p className="text-xs sm:text-sm text-neutral-400">
                            {task.purpose === "payments"
                                ? "Cumulative transaction amount recorded"
                                : "Completion status across all task objectives"}
                        </p>
                    </div>

                    <div className="z-10 mt-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer">
                            <span>View Analytics</span>
                        </div>
                    </div>

                    {/* Graphic Element - Vibrant Colorful 3D Accent */}
                    <div className="absolute right-2 bottom-2 pointer-events-none">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 relative">
                            {/* Layered Colorful Block Graphic */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 transform rotate-12 translate-x-4 translate-y-4 opacity-90 shadow-xl" />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 transform -rotate-6 opacity-80 backdrop-blur-sm border border-white/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row Small Bento Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Completed Card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] p-5 flex flex-col justify-between group hover:border-white/20 transition-all">
                    <div className="space-y-3 z-10">
                        <div className="h-20 w-full rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/20 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px]" />
                            <CheckCircle2 className="h-8 w-8 text-emerald-400 z-10" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white">Completed</h4>
                            <p className="text-2xl font-bold text-white tabular-nums mt-0.5">
                                {completedActivities}
                            </p>
                        </div>
                        <p className="text-xs text-neutral-400">Successfully finalized tasks.</p>
                    </div>
                </div>

                {/* Pending Card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] p-5 flex flex-col justify-between group hover:border-white/20 transition-all">
                    <div className="space-y-3 z-10">
                        <div className="h-20 w-full rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px]" />
                            <Clock className="h-8 w-8 text-amber-400 z-10" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white">Pending</h4>
                            <p className="text-2xl font-bold text-white tabular-nums mt-0.5">
                                {pendingActivities}
                            </p>
                        </div>
                        <p className="text-xs text-neutral-400">Awaiting processing or review.</p>
                    </div>
                </div>

                {/* Members Processed Card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] p-5 flex flex-col justify-between group hover:border-white/20 transition-all">
                    <div className="space-y-3 z-10">
                        <div className="h-20 w-full rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-indigo-500/20 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:8px_8px]" />
                            <Sparkles className="h-8 w-8 text-indigo-400 z-10" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white">Processed Members</h4>
                            <p className="text-2xl font-bold text-white tabular-nums mt-0.5">
                                {processedMembers}
                            </p>
                        </div>
                        <p className="text-xs text-neutral-400">Members with logged activity.</p>
                    </div>
                </div>

                {/* System Status Card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] p-5 flex flex-col justify-between group hover:border-white/20 transition-all">
                    <div className="space-y-3 z-10">
                        <div className="h-20 w-full rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:8px_8px]" />
                            <Cloud className="h-8 w-8 text-cyan-400 z-10" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white">Execution Type</h4>
                            <p className="text-lg font-bold text-white capitalize mt-0.5 truncate">
                                {task.purpose}
                            </p>
                        </div>
                        <p className="text-xs text-neutral-400">Active environment status.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}