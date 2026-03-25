"use client";

import { useEffect, useState, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBeamProps {
    containerRef: React.RefObject<HTMLElement>;
    fromRef: React.RefObject<HTMLElement>;
    toRef: React.RefObject<HTMLElement>;
    duration?: number;
    delay?: number;
    pathColor?: string;
    gradientStartColor?: string;
    gradientStopColor?: string;
    strokeWidth?: number;
    className?: string;
}

export const AnimatedBeam = ({
    containerRef,
    fromRef,
    toRef,
    duration = 3,
    delay = 0,
    pathColor = "gray",
    gradientStartColor = "#ffaabb",
    gradientStopColor = "#ff0055",
    strokeWidth = 2,
    className,
}: AnimatedBeamProps) => {
    const id = useId();
    const [path, setPath] = useState("");

    useEffect(() => {
        const updatePath = () => {
            if (!containerRef.current || !fromRef.current || !toRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const fromRect = fromRef.current.getBoundingClientRect();
            const toRect = toRef.current.getBoundingClientRect();

            // Calculate relative centers
            const x1 = fromRect.left - containerRect.left + fromRect.width / 2;
            const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
            const x2 = toRect.left - containerRect.left + toRect.width / 2;
            const y2 = toRect.top - containerRect.top + toRect.height / 2;

            // CPU Style: Cubic Bezier curve for that "Circuit/Next.js" look
            // Control points are pushed horizontally to create a straight-to-curve transition
            const offset = Math.abs(x2 - x1) * 0.5;
            const cp1x = x1 < x2 ? x1 + offset : x1 - offset;
            const cp2x = x1 < x2 ? x2 - offset : x2 + offset;

            const newPath = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
            setPath(newPath);
        };

        updatePath();
        const resizeObserver = new ResizeObserver(updatePath);
        resizeObserver.observe(containerRef.current);

        window.addEventListener("resize", updatePath);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updatePath);
        };
    }, [containerRef, fromRef, toRef]);

    return (
        <svg
            fill="none"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("pointer-events-none absolute left-0 top-0", className)}
        >
            {/* Background Static Path */}
            <path
                d={path}
                stroke={pathColor}
                strokeWidth={strokeWidth}
                strokeOpacity="0.1"
                strokeLinecap="round"
            />

            {/* Animated Gradient Path */}
            <motion.path
                d={path}
                stroke={`url(#gradient-${id})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                    duration: duration,
                    delay: delay,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            <defs>
                <linearGradient
                    id={`gradient-${id}`}
                    gradientUnits="userSpaceOnUse"
                    x1="0%"
                    x2="100%"
                    y1="0%"
                    y2="0%"
                >
                    <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
                    <stop offset="50%" stopColor={gradientStartColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};