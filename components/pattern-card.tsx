"use client";

import React, { useRef, useState, useEffect } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionTemplate,
} from "framer-motion";

interface PatternCardContainerProps {
    children?: React.ReactNode;
    className?: string;
    /**
     * Accepts a single color string (Hex, RGB, HSL, or Tailwind class)
     * OR an array of color strings that auto-rotate over time.
     */
    bgColor?: string | string[];
    /** Time in milliseconds between background color transitions when an array is passed */
    intervalDuration?: number;
    patternColor?: string;
}

export default function PatternCardContainer({
    children,
    className = "",
    bgColor = "#F9D658",
    intervalDuration = 5000,
    patternColor = "text-black/10",
}: PatternCardContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [colorIndex, setColorIndex] = useState(0);

    // Handle color array cycling logic safely
    const isColorArray = Array.isArray(bgColor) && bgColor.length > 0;
    const colorsList = isColorArray ? (bgColor as string[]) : [];

    useEffect(() => {
        if (!isColorArray || colorsList.length <= 1) return;

        const timer = setInterval(() => {
            setColorIndex((prev) => (prev + 1) % colorsList.length);
        }, intervalDuration);

        return () => clearInterval(timer);
    }, [isColorArray, colorsList.length, intervalDuration]);

    // Determine active color target
    const currentBgColor = isColorArray
        ? colorsList[colorIndex]
        : typeof bgColor === "string"
            ? bgColor
            : "#F9D658";

    // Check if target is a Tailwind class vs CSS Color Value
    const isTailwindClass = typeof currentBgColor === "string" && currentBgColor.startsWith("bg-");

    // Mouse tilt / interactive motion values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 180, damping: 20 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-3, 3]), springConfig);

    const patternX = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);
    const patternY = useSpring(useTransform(y, [-0.5, 0.5], [-10, 10]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const posX = e.clientX - rect.left;
        const posY = e.clientY - rect.top;

        mouseX.set(posX);
        mouseY.set(posY);

        x.set(posX / rect.width - 0.5);
        y.set(posY / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        mouseX.set(0);
        mouseY.set(0);
    };

    const glow = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.35), transparent 80%)`;

    return (
        <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={!isTailwindClass ? { backgroundColor: currentBgColor } : undefined}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative w-full h-full min-w-0 overflow-hidden rounded-[2rem] p-6 md:p-8 transition-shadow duration-300 hover:shadow-xl ${isTailwindClass ? currentBgColor : ""
                } ${className}`}
        >
            {/* Dynamic Cursor Spotlight Glow */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-10 opacity-100 transition-opacity duration-300"
                style={{ background: glow }}
            />

            {/* SVG Background Pattern */}
            <motion.div
                style={{ x: patternX, y: patternY }}
                className={`pointer-events-none absolute -inset-10 z-0 opacity-40 mix-blend-multiply ${patternColor}`}
            >
                <svg
                    className="h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                >
                    <defs>
                        <pattern
                            id="jigsaw-pattern-dynamic"
                            x="0"
                            y="0"
                            width="160"
                            height="160"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                fill="currentColor"
                                d="M40 0 C 40 10, 50 15, 60 15 C 70 15, 80 10, 80 0 H 160 V 40 C 150 40, 145 50, 145 60 C 145 70, 150 80, 160 80 V 160 H 120 C 120 150, 110 145, 100 145 C 90 145, 80 150, 80 160 H 0 V 120 C 10 120, 15 110, 15 100 C 15 90, 10 80, 0 80 V 0 Z"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#jigsaw-pattern-dynamic)" />
                </svg>
            </motion.div>

            {/* Content Area */}
            <div className="relative z-20 w-full h-full min-w-0">{children}</div>
        </motion.div>
    );
}