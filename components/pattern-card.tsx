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
     * Optional custom background color(s).
     * Accepts a Hex, RGB, HSL, Tailwind class (`bg-...`), or an array of colors to animate.
     * If omitted, defaults to system Light/Dark mode classes automatically.
     */
    bgColor?: string | string[];
    /** Time in milliseconds between background color transitions when an array is passed */
    intervalDuration?: number;
}

export default function PatternCardContainer({
    children,
    className = "",
    bgColor,
    intervalDuration = 6000,
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

    const currentBgColor = isColorArray
        ? colorsList[colorIndex]
        : typeof bgColor === "string"
            ? bgColor
            : undefined;

    const isTailwindClass =
        typeof currentBgColor === "string" && currentBgColor.startsWith("bg-");

    // Parallax and Mouse tilt physics
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 140, damping: 22 };
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), springConfig);
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-3, 3]), springConfig);

    // Parallax offsets for foreground 3D SVG primitives
    const shapeX = useSpring(useTransform(x, [-0.5, 0.5], [-24, 24]), springConfig);
    const shapeY = useSpring(useTransform(y, [-0.5, 0.5], [-20, 20]), springConfig);
    const bgGlowX = useSpring(useTransform(x, [-0.5, 0.5], [15, -15]), springConfig);

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

    // Cursor Spotlight Glow
    const glow = useMotionTemplate`radial-gradient(550px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.12), transparent 80%)`;

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
            className={`relative w-full h-full min-w-0 overflow-hidden rounded-[2.5rem] p-6 md:p-12 transition-all duration-300 shadow-xl border ${!currentBgColor
                    ? "bg-[#090A0E] text-white border-white/10 dark:bg-[#090A0E] dark:text-white dark:border-white/10"
                    : ""
                } ${isTailwindClass ? currentBgColor : ""} ${className}`}
        >
            {/* Interactive Cursor Glow */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
                style={{ background: glow }}
            />

            {/* GitHub Universe Dynamic Ambient Glow (Pink + Magenta + Cyan) */}
            <motion.div
                style={{ x: bgGlowX }}
                className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/2 z-0 opacity-60 mix-blend-screen blur-3xl"
            >
                <div className="absolute top-1/4 right-10 w-72 h-72 rounded-full bg-gradient-to-tr from-[#E03088] to-[#7B0046] opacity-70" />
                <div className="absolute bottom-10 right-28 w-60 h-60 rounded-full bg-gradient-to-tr from-[#306EE8] to-[#41F3C5] opacity-50" />
            </motion.div>

            {/* Grid Pattern Overlay */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-10 dark:opacity-15 mix-blend-overlay">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern
                            id="gh-universe-grid"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#gh-universe-grid)" />
                </svg>
            </div>

            {/* Full-Scale GitHub Universe '24 3D SVG Composition */}
            <motion.div
                style={{ x: shapeX, y: shapeY }}
                className="pointer-events-none absolute -right-8 md:right-4 -bottom-8 md:-bottom-12 z-0 w-[380px] md:w-[520px] h-[380px] md:h-[520px] select-none"
            >
                <svg
                    viewBox="0 0 600 600"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
                >
                    <defs>
                        {/* Extruded Pink Pill Gradients */}
                        <linearGradient id="pillTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFAEE2" />
                            <stop offset="100%" stopColor="#F851B5" />
                        </linearGradient>

                        <linearGradient id="pillFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#F851B5" />
                            <stop offset="60%" stopColor="#B81472" />
                            <stop offset="100%" stopColor="#570032" />
                        </linearGradient>

                        {/* Blue Isometric Box Gradients */}
                        <linearGradient id="blueBoxTop" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#B3CDFF" />
                            <stop offset="100%" stopColor="#6EA0FF" />
                        </linearGradient>

                        <linearGradient id="blueBoxLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3F7BFF" />
                            <stop offset="100%" stopColor="#1643B3" />
                        </linearGradient>

                        <linearGradient id="blueBoxRight" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1E52D1" />
                            <stop offset="100%" stopColor="#0B206B" />
                        </linearGradient>

                        {/* Emerald Wavy Tube Gradients */}
                        <linearGradient id="emeraldTube" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22D3EE" />
                            <stop offset="50%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#047857" />
                        </linearGradient>

                        {/* Glow Filter for Spheres */}
                        <filter id="orbGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* BACKGROUND WIREFRAME LINES */}
                    <path
                        d="M 450 120 C 520 180, 500 320, 540 450"
                        stroke="url(#pillTopGrad)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.4"
                    />
                    <path
                        d="M 180 320 C 180 200, 320 140, 480 180"
                        stroke="#6EA0FF"
                        strokeWidth="1.5"
                        strokeDasharray="6 6"
                        opacity="0.3"
                    />

                    {/* 1. TALL PINK EXTRUDED PILL TOWER (Right Rear) */}
                    <g transform="translate(320, 40) rotate(18)">
                        {/* Main Extruded Cylinder Body */}
                        <path
                            d="M 40,50 C 40,22 90,22 90,50 V 380 C 90,408 40,408 40,380 Z"
                            fill="url(#pillFrontGrad)"
                        />
                        <path
                            d="M 90,50 C 90,22 140,22 140,50 V 380 C 140,408 90,408 90,380 Z"
                            fill="url(#pillFrontGrad)"
                            opacity="0.85"
                        />
                        {/* Top Ellipse Caps */}
                        <ellipse cx="65" cy="50" rx="25" ry="18" fill="url(#pillTopGrad)" />
                        <ellipse cx="115" cy="50" rx="25" ry="18" fill="url(#pillTopGrad)" />
                        {/* Horizontal Segment Grooves */}
                        <path
                            d="M 40,110 C 40,128 90,128 90,110 M 40,170 C 40,188 90,188 90,170 M 40,230 C 40,248 90,248 90,230 M 40,290 C 40,308 90,308 90,290"
                            stroke="#F851B5"
                            strokeWidth="2"
                            opacity="0.5"
                        />
                    </g>

                    {/* 2. ISOMETRIC GLASS BLUE CUBE (Center Foreground) */}
                    <g transform="translate(180, 240)">
                        {/* Top Face */}
                        <polygon points="110,0 220,55 110,110 0,55" fill="url(#blueBoxTop)" />
                        {/* Left Face */}
                        <polygon points="0,55 110,110 110,250 0,195" fill="url(#blueBoxLeft)" />
                        {/* Right Face */}
                        <polygon points="110,110 220,55 220,195 110,250" fill="url(#blueBoxRight)" />

                        {/* Precise Grid Subdivisions on Top Face */}
                        <path
                            d="M 55,27.5 L 165,82.5 M 165,27.5 L 55,82.5 M 36.6,18.3 L 146.6,73.3 M 73.3,36.6 L 183.3,91.6"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                            opacity="0.5"
                        />

                        {/* Grid Subdivisions on Left Face */}
                        <path
                            d="M 36.6,73.3 L 36.6,213.3 M 73.3,91.6 L 73.3,231.6 M 0,101.6 L 110,156.6 M 0,148.3 L 110,203.3"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                            opacity="0.35"
                        />

                        {/* Grid Subdivisions on Right Face */}
                        <path
                            d="M 146.6,91.6 L 146.6,231.6 M 183.3,73.3 L 183.3,213.3 M 110,156.6 L 220,101.6 M 110,203.3 L 220,148.3"
                            stroke="#000000"
                            strokeWidth="1.5"
                            opacity="0.3"
                        />
                    </g>

                    {/* 3. EMERALD TUBE RIBBON (Bottom Front Overlay) */}
                    <g transform="translate(110, 370)">
                        <path
                            d="M 10,100 C 60,30 130,20 210,80 C 270,120 320,110 370,60"
                            fill="none"
                            stroke="url(#emeraldTube)"
                            strokeWidth="42"
                            strokeLinecap="round"
                        />
                        {/* Inner Tube Specular Highlight */}
                        <path
                            d="M 10,100 C 60,30 130,20 210,80 C 270,120 320,110 370,60"
                            fill="none"
                            stroke="#A7F3D0"
                            strokeWidth="6"
                            strokeLinecap="round"
                            opacity="0.6"
                        />
                    </g>

                    {/* 4. FLOATING ORBITING SPHERES */}
                    <g filter="url(#orbGlow)">
                        <circle cx="500" cy="210" r="16" fill="url(#pillTopGrad)" />
                        <circle cx="500" cy="210" r="5" fill="#FFFFFF" opacity="0.9" />

                        <circle cx="160" cy="180" r="10" fill="#6EA0FF" />
                        <circle cx="160" cy="180" r="3" fill="#FFFFFF" opacity="0.8" />
                    </g>
                </svg>
            </motion.div>

            {/* Content Slot (Welcome text, widgets, sidebar, etc.) */}
            <div className="relative z-20 w-full h-full min-w-0">{children}</div>
        </motion.div>
    );
}