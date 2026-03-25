"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// ============================================================================
// SHARED UI / SHADCN MOCKS
// (Assuming you have Shadcn installed, you would import Button from "@/components/ui/button")
// ============================================================================

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" }>(
    ({ className, variant = "default", ...props }, ref) => {
        const baseStyle = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
        const variants = {
            default: "bg-white text-black hover:bg-gray-200",
            outline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
        };
        return (
            <button ref={ref} className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />
        );
    }
);
Button.displayName = "Button";

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

// Adds a cinematic film grain over the entire UI (Reduces cognitive load by creating texture cohesion)
export const FilmGrain = () => (
    <div
        className="pointer-events-none absolute inset-0 z-50 h-full w-full opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
);