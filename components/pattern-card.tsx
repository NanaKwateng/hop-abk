"use client";

import React, { useRef } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionTemplate,
} from "framer-motion";

interface PatternCardContainerProps {
    children: React.ReactNode;
    className?: string;
    bgColor?: string;
    patternColor?: string;
}

export default function PatternCardContainer({
    children,
    className = "",
    bgColor = "bg-[#F9D658]", // Warm yellow matched to the image banner
    patternColor = "text-[#F1C83B]", // Darker yellow shade for subtle background puzzle contrast
}: PatternCardContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse positions normalized relative to container bounds (-0.5 to 0.5)
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Absolute pixel coordinates for mouse spotlight
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs for tilt/shake physics
    const springConfig = { stiffness: 180, damping: 20 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), springConfig);

    // Background SVG micro-displacement response
    const patternX = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);
    const patternY = useSpring(useTransform(y, [-0.5, 0.5], [-12, 12]), springConfig);

    // Mouse move handler
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const posX = e.clientX - rect.left;
        const posY = e.clientY - rect.top;

        mouseX.set(posX);
        mouseY.set(posY);

        x.set(posX / width - 0.5);
        y.set(posY / height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        mouseX.set(0);
        mouseY.set(0);
    };

    // Dynamic Radial Glow Overlay
    const glow = useMotionTemplate`radial-gradient(450px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.45), transparent 80%)`;

    return (
        <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative w-full overflow-hidden rounded-[2.5rem] p-8 md:p-12 transition-shadow duration-300 hover:shadow-2xl ${bgColor} ${className}`}
        >
            {/* Interactive Cursor Spotlight Glow */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
                style={{ background: glow }}
            />

            {/* Embedded Interlocking Puzzle SVG Pattern */}
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
                            id="jigsaw-pattern"
                            x="0"
                            y="0"
                            width="160"
                            height="160"
                            patternUnits="userSpaceOnUse"
                        >
                            {/* Interlocking Puzzle Tile Geometry */}
                            <path
                                fill="currentColor"
                                d="M40 0 C 40 10, 50 15, 60 15 C 70 15, 80 10, 80 0 H 160 V 40 C 150 40, 145 50, 145 60 C 145 70, 150 80, 160 80 V 160 H 120 C 120 150, 110 145, 100 145 C 90 145, 80 150, 80 160 H 0 V 120 C 10 120, 15 110, 15 100 C 15 90, 10 80, 0 80 V 0 Z"
                            />
                            <path
                                fill="currentColor"
                                opacity="0.3"
                                d="M120 0 C 120 12, 130 18, 140 18 C 150 18, 160 12, 160 0 H 200 V 80 C 190 80, 185 90, 185 100 C 185 110, 190 120, 200 120 V 200 H 120 Z"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#jigsaw-pattern)" />
                </svg>
            </motion.div>

            {/* Rendered Children Slot */}
            <div className="relative z-20 w-full">{children}</div>
        </motion.div>
    );
}