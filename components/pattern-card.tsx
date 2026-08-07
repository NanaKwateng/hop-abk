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
     * Optional background color(s).
     * Accepts a Hex, RGB, HSL, Tailwind class (`bg-...`), or an array of colors to animate.
     * Defaults to a dark GitHub Universe aesthetic if omitted.
     */
    bgColor?: string | string[];
    /** Time in milliseconds between background color transitions when an array is passed */
    intervalDuration?: number;
    /** Variant preset matching the GitHub Universe '24 themes */
    variant?: "pink-blue" | "emerald-cyan" | "amber-purple";
}

export default function PatternCardContainer({
    children,
    className = "",
    bgColor,
    intervalDuration = 6000,
    variant = "pink-blue",
}: PatternCardContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [colorIndex, setColorIndex] = useState(0);

    // Background color array cycling logic
    const isColorArray = Array.isArray(bgColor) && bgColor.length > 0;
    const colorsList = isColorArray ? (bgColor as string[]) : [];

    useEffect(() => {
        if (!isColorArray || colorsList.length <= 1) return;

        const timer = setInterval(() => {
            setColorIndex((prev) => (prev + 1) % colorsList.length);
        }, intervalDuration);

        return () => clearInterval(timer);
    }, [isColorArray, colorsList.length, intervalDuration]);

    // Determine active background style
    const currentBgColor = isColorArray
        ? colorsList[colorIndex]
        : typeof bgColor === "string"
            ? bgColor
            : undefined;

    const isTailwindClass =
        typeof currentBgColor === "string" && currentBgColor.startsWith("bg-");

    // Mouse interaction & Parallax physics
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 22 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), springConfig);

    // Parallax offsets for foreground 3D SVG primitives
    const shapeX = useSpring(useTransform(x, [-0.5, 0.5], [-18, 18]), springConfig);
    const shapeY = useSpring(useTransform(y, [-0.5, 0.5], [-18, 18]), springConfig);
    const bgShapeX = useSpring(useTransform(x, [-0.5, 0.5], [10, -10]), springConfig);

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

    // Interactive Cursor Spotlight Glow
    const glow = useMotionTemplate`radial-gradient(450px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.15), transparent 80%)`;

    return (
        <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={
                !isTailwindClass && currentBgColor
                    ? { backgroundColor: currentBgColor }
                    : undefined
            }
            transition={{ duration: 1.8, ease: "easeInOut" }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative w-full h-full min-w-0 overflow-hidden rounded-[2rem] p-6 md:p-10 transition-shadow duration-300 hover:shadow-2xl border border-white/10 ${!currentBgColor ? "bg-[#090A0F] text-white" : ""
                } ${isTailwindClass ? currentBgColor : ""} ${className}`}
        >
            {/* Spotlight Glow Overlay */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
                style={{ background: glow }}
            />

            {/* GitHub Universe Background Grid Pattern */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-15 mix-blend-overlay">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern
                            id="gh-grid"
                            width="32"
                            height="32"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 32 0 L 0 0 0 32"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#gh-grid)" />
                </svg>
            </div>

            {/* Background Parallax Arc */}
            <motion.div
                style={{ x: bgShapeX }}
                className="pointer-events-none absolute -right-12 -top-12 z-0 w-80 h-80 opacity-40"
            >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                        <radialGradient id="arcGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#8A2BE2" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="100" cy="100" r="90" fill="url(#arcGlow)" />
                </svg>
            </motion.div>

            {/* 3D GitHub Universe Interactive Shapes */}
            <motion.div
                style={{ x: shapeX, y: shapeY }}
                className="pointer-events-none absolute right-2 bottom-2 z-0 w-64 md:w-80 h-64 md:h-80 opacity-90 select-none"
            >
                <svg
                    viewBox="0 0 320 320"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                >
                    <defs>
                        {/* Pink to Magenta Tower Gradient */}
                        <linearGradient id="pinkTowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF77BC" />
                            <stop offset="50%" stopColor="#E03088" />
                            <stop offset="100%" stopColor="#7B0046" />
                        </linearGradient>

                        {/* Blue Grid Prism Gradient */}
                        <linearGradient id="bluePrismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#79A8FF" />
                            <stop offset="50%" stopColor="#306EE8" />
                            <stop offset="100%" stopColor="#0F2B80" />
                        </linearGradient>

                        {/* Cyan Accent Gradient */}
                        <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#41F3C5" />
                            <stop offset="100%" stopColor="#118366" />
                        </linearGradient>
                    </defs>

                    {/* 3D Curved Extrusion Base */}
                    <g transform="translate(140, 20) rotate(15)">
                        <path
                            d="M 20,40 C 20,15 50,15 50,40 V 160 C 50,185 20,185 20,160 Z"
                            fill="url(#pinkTowerGrad)"
                        />
                        <path
                            d="M 50,40 C 50,15 80,15 80,40 V 160 C 80,185 50,185 50,160 Z"
                            fill="url(#pinkTowerGrad)"
                            opacity="0.8"
                        />
                        {/* Top Caps */}
                        <ellipse cx="35" cy="30" rx="15" ry="10" fill="#FFA3D7" />
                        <ellipse cx="65" cy="30" rx="15" ry="10" fill="#FF83C3" />
                    </g>

                    {/* Isometric Gridded Blue Block */}
                    <g transform="translate(40, 120)">
                        {/* Top Face */}
                        <polygon points="60,0 120,30 60,60 0,30" fill="#91B9FF" />
                        {/* Left Face */}
                        <polygon points="0,30 60,60 60,140 0,110" fill="url(#bluePrismGrad)" />
                        {/* Right Face */}
                        <polygon points="60,60 120,30 120,110 60,140" fill="#1C53C7" />

                        {/* Grid Overlay on Block */}
                        <path
                            d="M 30,15 L 90,45 M 30,45 L 30,125 M 90,45 L 90,125 M 0,70 L 60,100 L 120,70"
                            stroke="#FFFFFF"
                            strokeOpacity="0.25"
                            strokeWidth="1.5"
                        />
                    </g>

                    {/* Green-Cyan Stepped Ribbon */}
                    <g transform="translate(10, 160)">
                        <path
                            d="M 10,60 Q 40,20 80,60 T 150,60"
                            fill="none"
                            stroke="url(#cyanGrad)"
                            strokeWidth="24"
                            strokeLinecap="round"
                        />
                    </g>

                    {/* Floating Orbiting Sphere */}
                    <circle cx="270" cy="80" r="12" fill="url(#pinkTowerGrad)" />
                    <circle cx="270" cy="80" r="4" fill="#FFFFFF" opacity="0.8" />
                </svg>
            </motion.div>

            {/* Rendered Children Slot */}
            <div className="relative z-20 w-full h-full min-w-0">{children}</div>
        </motion.div>
    );
}