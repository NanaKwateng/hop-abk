"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

interface HoverBorderGradientProps
    extends React.ComponentPropsWithoutRef<"button"> {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
    children: React.ReactNode;
}

export function HoverBorderGradient({
    children,
    containerClassName,
    className,
    as,
    duration = 1,
    clockwise = true,
    ...props
}: HoverBorderGradientProps) {
    // ✅ FIXED: Properly type the component with default
    const Component = (as ?? "button") as React.ElementType<any>;

    const [hovered, setHovered] = useState(false);
    const [direction, setDirection] = useState<Direction>("TOP");

    const rotateDirection = (current: Direction): Direction => {
        const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
        const index = directions.indexOf(current);

        return clockwise
            ? directions[(index - 1 + directions.length) % directions.length]
            : directions[(index + 1) % directions.length];
    };

    useEffect(() => {
        if (hovered) return;

        const interval = window.setInterval(() => {
            setDirection((prev) => rotateDirection(prev));
        }, duration * 1000);

        return () => clearInterval(interval);
    }, [hovered, duration, clockwise]);

    const movingMap: Record<Direction, string> = {
        TOP: "radial-gradient(20.7% 50% at 50% 0%, white 0%, transparent 100%)",
        LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, white 0%, transparent 100%)",
        BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, white 0%, transparent 100%)",
        RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, white 0%, transparent 100%)",
    };

    const highlight = "radial-gradient(75% 181.16% at 50% 50%, #3275F8 0%, transparent 100%)";

    return (
        // ✅ FIXED: Use a div wrapper instead of the generic Component to avoid type issues
        <div
            className={cn(
                "relative flex w-fit overflow-visible rounded-full border bg-black/20 p-px transition duration-500 hover:bg-black/10 dark:bg-white/20",
                containerClassName
            )}
        >
            {/* ✅ FIXED: The actual button/content */}
            <button
                {...(props as any)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={cn(
                    "relative z-10 rounded-[inherit] bg-black px-4 py-2 text-white",
                    className
                )}
            >
                {children}
            </button>

            {/* Animated border */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        filter: "blur(2px)",
                        background: movingMap[direction],
                    }}
                    animate={{
                        background: hovered
                            ? [movingMap[direction], highlight]
                            : movingMap[direction],
                    }}
                    transition={{
                        duration,
                        ease: "linear",
                    }}
                />
                <div className="absolute inset-[2px] rounded-full bg-black" />
            </div>
        </div>
    );
}