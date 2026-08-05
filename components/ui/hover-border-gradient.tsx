"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

interface HoverBorderGradientProps
    extends React.HTMLAttributes<HTMLElement> {
    as?: keyof React.JSX.IntrinsicElements;
    children: React.ReactNode;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
}

export function HoverBorderGradient({
    children,
    containerClassName,
    className,
    as = "button",
    duration = 1,
    clockwise = true,
    ...props
}: HoverBorderGradientProps) {
    const [hovered, setHovered] = useState(false);
    const [direction, setDirection] = useState<Direction>("TOP");

    const rotateDirection = (current: Direction): Direction => {
        const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];

        const currentIndex = directions.indexOf(current);

        const nextIndex = clockwise
            ? (currentIndex - 1 + directions.length) % directions.length
            : (currentIndex + 1) % directions.length;

        return directions[nextIndex];
    };

    const movingMap: Record<Direction, string> = {
        TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
        LEFT:
            "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
        BOTTOM:
            "radial-gradient(20.7% 50% at 50% 100%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
        RIGHT:
            "radial-gradient(16.2% 41.2% at 100% 50%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
    };

    const highlight =
        "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255,255,255,0) 100%)";

    useEffect(() => {
        if (hovered) return;

        const interval = setInterval(() => {
            setDirection((prev) => rotateDirection(prev));
        }, duration * 1000);

        return () => clearInterval(interval);
    }, [hovered, duration, clockwise]);

    const Tag = as as keyof React.JSX.IntrinsicElements;

    return React.createElement(
        Tag,
        {
            ...props,
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
            className: cn(
                "relative flex w-fit overflow-visible rounded-full border bg-black/20 p-px transition duration-500 hover:bg-black/10 dark:bg-white/20 items-center justify-center",
                containerClassName
            ),
        },
        <>
            <div
                className={cn(
                    "relative z-10 rounded-[inherit] bg-black px-4 py-2 text-white",
                    className
                )}
            >
                {children}
            </div>

            <motion.div
                className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
                style={{
                    filter: "blur(2px)",
                }}
                initial={{
                    background: movingMap[direction],
                }}
                animate={{
                    background: hovered
                        ? [movingMap[direction], highlight]
                        : movingMap[direction],
                }}
                transition={{
                    ease: "linear",
                    duration,
                }}
            />

            <div className="absolute inset-[2px] rounded-[100px] bg-black" />
        </>
    );
}