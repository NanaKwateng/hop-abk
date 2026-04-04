// app/not-found.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    // Trigger entrance animation after mount
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    function handleBack() {
        setIsLeaving(true);
        setTimeout(() => router.push("/admin"), 300);
    }

    return (
        <div
            className={cn(
                "min-h-screen flex flex-col items-center justify-center",
                "bg-background text-foreground",
                "px-6 transition-opacity duration-300",
                isLeaving ? "opacity-0" : "opacity-100"
            )}
        >
            {/* Floating icon */}
            <div
                className={cn(
                    "transition-all duration-700 ease-out",
                    mounted
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                )}
            >
                <div className="relative flex items-center justify-center mb-8">
                    {/* Soft glow ring */}
                    <div className="absolute h-24 w-24 rounded-full bg-primary/10 animate-pulse" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-muted shadow-inner">
                        <FileQuestion className="h-9 w-9 text-muted-foreground" />
                    </div>
                </div>
            </div>

            {/* Text block */}
            <div
                className={cn(
                    "text-center space-y-3 transition-all duration-700 delay-100 ease-out",
                    mounted
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                )}
            >
                {/* 404 label */}
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Error 404
                </p>

                {/* Headline */}
                <h1 className="text-3xl font-bold tracking-tight">
                    Page not found
                </h1>

                {/* Subline */}
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or has been
                    moved.
                </p>
            </div>

            {/* Divider */}
            <div
                className={cn(
                    "my-8 h-px w-16 bg-border transition-all duration-700 delay-200 ease-out",
                    mounted ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                )}
            />

            {/* Back button */}
            <div
                className={cn(
                    "transition-all duration-700 delay-300 ease-out",
                    mounted
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                )}
            >
                <Button
                    onClick={handleBack}
                    variant="outline"
                    className={cn(
                        "gap-2 px-6 h-10 text-sm font-medium",
                        "transition-all duration-200",
                        "hover:bg-primary hover:text-primary-foreground",
                        "hover:border-primary hover:shadow-md",
                        "active:scale-95"
                    )}
                >
                    <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                    Back to Dashboard
                </Button>
            </div>

            {/* Subtle background pattern — decorative, aria-hidden */}
            <div
                aria-hidden="true"
                className={cn(
                    "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
                    "transition-opacity duration-700 delay-500",
                    mounted ? "opacity-100" : "opacity-0"
                )}
            >
                {/* Top-left blob */}
                <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
                {/* Bottom-right blob */}
                <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            </div>
        </div>
    );
}