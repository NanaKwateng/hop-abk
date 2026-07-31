// components/nicknames/nickname-spin-wheel.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NicknameMember } from "@/lib/types/nickname";
import { cn } from "@/lib/utils";

interface NicknameSpinWheelProps {
    members: NicknameMember[];
    onSelect: (memberId: string) => void;
}

export function NicknameSpinWheel({ members, onSelect }: NicknameSpinWheelProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const wheelTrackRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Track state on mutable refs to bypass React state-rerender latency during high-speed inertia loops
    const scrollMetrics = useRef({
        currentY: 0,
        targetY: 0,
        containerHeight: 400,
        itemHeight: 86,
        radius: 180,
    });

    // Stable gradient mapping to avoid inline mutation lookups
    const pillGradients = useMemo(() => [
        "from-[#118ab2] to-[#06d6a0]",
        "from-[#ffbe0b] to-[#fb8500]",
        "from-[#ff007f] to-[#7209b7]",
        "from-[#00f5d4] to-[#00b4d8]",
        "from-[#4361ee] to-[#4cc9f0]"
    ], []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const updateMetrics = () => {
            scrollMetrics.current.containerHeight = container.clientHeight || 400;
        };

        updateMetrics();
        window.addEventListener("resize", updateMetrics);

        // Native scroll tracking with hardware target mapping
        const handleNativeScroll = () => {
            scrollMetrics.current.targetY = container.scrollTop;
        };
        container.addEventListener("scroll", handleNativeScroll, { passive: true });

        // High-Performance Frame Loop with Inertia interpolation (LERP)
        const renderLoop = () => {
            const metrics = scrollMetrics.current;

            // Linear Interpolation factor (0.12 creates a smooth, weighted magnetic glide feel)
            metrics.currentY += (metrics.targetY - metrics.currentY) * 0.12;

            // Only trigger DOM mutation trees if the deviation is physically noticeable
            if (Math.abs(metrics.targetY - metrics.currentY) > 0.05 && wheelTrackRef.current) {
                const childNodes = wheelTrackRef.current.children;
                const totalNodes = childNodes.length;

                for (let i = 0; i < totalNodes; i++) {
                    const el = childNodes[i] as HTMLDivElement;
                    if (!el) continue;

                    const itemCenter = i * metrics.itemHeight;
                    const distanceFromCenter = itemCenter - metrics.currentY;
                    const angle = (distanceFromCenter / (metrics.containerHeight / 1.8)) * 90;

                    if (Math.abs(angle) < 90) {
                        const opacity = Math.max(0.1, 1 - Math.abs(distanceFromCenter) / 240);
                        const scale = Math.max(0.85, 1 - Math.abs(distanceFromCenter) / 800);

                        // Execute direct style mutations to bypass React reconciliation overhead entirely
                        el.style.opacity = `${opacity}`;
                        el.style.transform = `rotateX(${angle}deg) translateZ(${metrics.radius}px) scale(${scale})`;
                        el.style.visibility = "visible";
                    } else {
                        el.style.opacity = "0";
                        el.style.visibility = "hidden";
                    }
                }
            }

            animationFrameRef.current = requestAnimationFrame(renderLoop);
        };

        animationFrameRef.current = requestAnimationFrame(renderLoop);

        return () => {
            window.removeEventListener("resize", updateMetrics);
            if (container) container.removeEventListener("scroll", handleNativeScroll);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <div className="relative w-full h-[520px] flex items-center justify-center overflow-hidden bg-transparent rounded-3xl select-none">
            {/* Visual Center Indicator Guides */}
            <div className="absolute inset-x-0 h-[96px] border-y border-white/5 bg-white/[0.02] pointer-events-none z-10 backdrop-blur-2xs" />

            {/* Native Scroll Capture layer */}
            <div
                ref={scrollContainerRef}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none relative z-20 py-[210px]"
                style={{ perspective: "1000px" }}
            >
                {/* Hardware-Accelerated 3D Transform Track Wrapper */}
                <div
                    ref={wheelTrackRef}
                    className="w-full h-full relative"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {members.map((member, index) => {
                        const initials = (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");
                        const gradient = pillGradients[index % pillGradients.length];

                        return (
                            <div
                                key={member.id}
                                onClick={() => onSelect(member.id)}
                                className="w-full h-[80px] mb-[6px] snap-center flex items-center justify-center cursor-pointer will-change-transform"
                                style={{
                                    transformStyle: "preserve-3d",
                                    backfaceVisibility: "hidden",
                                    transform: `translateZ(${scrollMetrics.current.radius}px)` // Initial safe fallback layout state
                                }}
                            >
                                <div className={cn(
                                    "w-full max-w-[340px] h-full rounded-full bg-gradient-to-r p-[3px] shadow-lg transition-transform active:scale-95 duration-150",
                                    gradient
                                )}>
                                    <div className="w-full h-full bg-[#121214] rounded-full flex items-center justify-between px-4 text-white">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 ring-2 ring-white/10">
                                                <AvatarImage src={member.avatarUrl || undefined} alt={member.firstName} />
                                                <AvatarFallback className="bg-neutral-800 text-xs font-bold text-white">
                                                    {initials.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col text-left">
                                                <span className="font-bold text-base tracking-tight truncate max-w-[120px]">
                                                    {member.firstName} {member.lastName}
                                                </span>
                                                <span className="text-xs text-neutral-400 capitalize">
                                                    {member.memberPosition || "Member"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end leading-none pr-2">
                                            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                                                @{member.nickname}
                                            </span>
                                            <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mt-0.5">
                                                Alias
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Ambient Fades */}
            <div className="absolute top-0 inset-x-0 h-[120px] bg-gradient-to-b from-[#0a0a0c] to-transparent pointer-events-none z-30" />
            <div className="absolute bottom-0 inset-x-0 h-[120px] bg-gradient-to-t from-[#0a0a0c] to-transparent pointer-events-none z-30" />
        </div>
    );
}
