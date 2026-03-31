// components/admin/assistive-touch.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
    IoGridOutline,
    IoCloseOutline,
    IoChevronBack,
} from "react-icons/io5";

// ── Spring configs ──
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 500, damping: 35 };
const SPRING_BOUNCY = { type: "spring" as const, stiffness: 400, damping: 22, mass: 0.8 };
const SPRING_GENTLE = { type: "spring" as const, stiffness: 250, damping: 25 };

// ── Snap positions ──
const EDGE_PADDING = 12;
const BUTTON_SIZE = 52;

// ── Flatten nav items for the menu ──
const allNavItems = navigation.flatMap((cat) =>
    cat.items.map((item) => ({
        ...item,
        category: cat.title,
    }))
);

export function AssistiveTouch() {
    const pathname = usePathname();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: EDGE_PADDING, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);

    // ── Initialize position and track window size ──
    useEffect(() => {
        setMounted(true);

        function updateSize() {
            setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        }

        updateSize();

        // Set initial position (bottom-right)
        setPosition({
            x: window.innerWidth - BUTTON_SIZE - EDGE_PADDING,
            y: window.innerHeight - BUTTON_SIZE - 100,
        });

        // Try to restore saved position
        try {
            const saved = localStorage.getItem("assistive-touch-pos");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.x !== undefined && parsed.y !== undefined) {
                    setPosition({
                        x: Math.min(Math.max(EDGE_PADDING, parsed.x), window.innerWidth - BUTTON_SIZE - EDGE_PADDING),
                        y: Math.min(Math.max(EDGE_PADDING + 56, parsed.y), window.innerHeight - BUTTON_SIZE - EDGE_PADDING),
                    });
                }
            }
        } catch { }

        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    // ── Snap to nearest edge ──
    const snapToEdge = useCallback(
        (x: number, y: number) => {
            if (windowSize.w === 0) return { x, y };

            const midX = windowSize.w / 2;
            const snappedX =
                x + BUTTON_SIZE / 2 < midX
                    ? EDGE_PADDING
                    : windowSize.w - BUTTON_SIZE - EDGE_PADDING;

            const snappedY = Math.min(
                Math.max(EDGE_PADDING + 56, y), // Below header
                windowSize.h - BUTTON_SIZE - EDGE_PADDING
            );

            return { x: snappedX, y: snappedY };
        },
        [windowSize]
    );

    // ── Save position ──
    const savePosition = useCallback((pos: { x: number; y: number }) => {
        try {
            localStorage.setItem("assistive-touch-pos", JSON.stringify(pos));
        } catch { }
    }, []);

    // ── Drag handlers ──
    function handleDragStart() {
        setIsDragging(true);
        hasMoved.current = false;
        dragStartPos.current = { ...position };
    }

    function handleDrag(_: any, info: PanInfo) {
        const dx = Math.abs(info.offset.x);
        const dy = Math.abs(info.offset.y);
        if (dx > 3 || dy > 3) {
            hasMoved.current = true;
        }
    }

    function handleDragEnd(_: any, info: PanInfo) {
        setIsDragging(false);

        const newX = dragStartPos.current.x + info.offset.x;
        const newY = dragStartPos.current.y + info.offset.y;
        const snapped = snapToEdge(newX, newY);

        setPosition(snapped);
        savePosition(snapped);
    }

    // ── Toggle menu (only if not dragged) ──
    function handleTap() {
        if (hasMoved.current) return;
        setIsOpen((prev) => !prev);
    }

    // ── Navigate ──
    function handleNavigate(href: string) {
        setIsOpen(false);
        router.push(href);
    }

    // ── Close menu when route changes ──
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Only show on mobile/tablet, only in admin pages
    if (!mounted || !pathname.startsWith("/admin")) return null;

    // ── Determine menu position (above or below button, left or right) ──
    const isOnRight = position.x > windowSize.w / 2;
    const isNearBottom = position.y > windowSize.h - 350;

    return (
        <>
            {/* ── Backdrop when menu is open ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-[2px] md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ── Main container (draggable) ── */}
            <div ref={containerRef} className="fixed z-[999] md:hidden">
                {/* ── Floating Button ── */}
                <motion.div
                    drag
                    dragMomentum={false}
                    dragElastic={0.1}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    onTap={handleTap}
                    animate={{
                        x: position.x,
                        y: position.y,
                        scale: isDragging ? 1.1 : 1,
                    }}
                    transition={isDragging ? { type: "tween", duration: 0 } : SPRING_SNAPPY}
                    style={{ position: "fixed", top: 0, left: 0, zIndex: 999 }}
                    className="touch-none"
                >
                    <motion.div
                        animate={{
                            opacity: isOpen ? 0 : isDragging ? 0.9 : 0.65,
                        }}
                        whileHover={{ opacity: 0.85 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "flex items-center justify-center rounded-full",
                            "bg-foreground/80 backdrop-blur-xl shadow-lg shadow-black/20",
                            "border border-white/10 dark:border-white/5",
                            "cursor-grab active:cursor-grabbing"
                        )}
                        style={{
                            width: BUTTON_SIZE,
                            height: BUTTON_SIZE,
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    exit={{ rotate: 90, scale: 0 }}
                                    transition={SPRING_BOUNCY}
                                >
                                    <IoCloseOutline className="h-6 w-6 text-background" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="grid"
                                    initial={{ rotate: 90, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    exit={{ rotate: -90, scale: 0 }}
                                    transition={SPRING_BOUNCY}
                                >
                                    <IoGridOutline className="h-5 w-5 text-background" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* ── Menu Panel ── */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 10 }}
                            transition={SPRING_BOUNCY}
                            className="fixed"
                            style={{
                                width: Math.min(280, windowSize.w - 32),
                                [isNearBottom ? "bottom" : "top"]: isNearBottom
                                    ? windowSize.h - position.y + 8
                                    : position.y + BUTTON_SIZE + 8,
                                [isOnRight ? "right" : "left"]: isOnRight
                                    ? windowSize.w - position.x - BUTTON_SIZE
                                    : position.x,
                                zIndex: 999,
                            }}
                        >
                            <div className="rounded-3xl bg-background/95 backdrop-blur-2xl border border-border/60 shadow-2xl shadow-black/15 dark:shadow-black/40 overflow-hidden">
                                {/* Header */}
                                <div className="px-4 pt-4 pb-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Quick Nav
                                        </p>
                                        <motion.button
                                            whileTap={{ scale: 0.85 }}
                                            onClick={() => setIsOpen(false)}
                                            className="h-6 w-6 rounded-full bg-muted/60 flex items-center justify-center"
                                        >
                                            <IoCloseOutline className="h-3.5 w-3.5 text-muted-foreground" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Navigation Grid */}
                                <div className="px-3 pb-3 max-h-[60vh] overflow-y-auto overscroll-contain">
                                    {navigation.map((category, catIndex) => (
                                        <div key={category.title} className="mb-1">
                                            <p className="px-2 pt-2 pb-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                                {category.title}
                                            </p>
                                            <div className="grid grid-cols-3 gap-1">
                                                {category.items.map((item, itemIndex) => {
                                                    const isActive =
                                                        pathname === item.href ||
                                                        pathname.startsWith(`${item.href}/`);

                                                    return (
                                                        <motion.button
                                                            key={item.href}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{
                                                                ...SPRING_GENTLE,
                                                                delay:
                                                                    catIndex * 0.05 +
                                                                    itemIndex * 0.03,
                                                            }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() =>
                                                                handleNavigate(item.href)
                                                            }
                                                            className={cn(
                                                                "flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-colors",
                                                                isActive
                                                                    ? "bg-primary/10"
                                                                    : "hover:bg-muted/50 active:bg-muted/80"
                                                            )}
                                                        >
                                                            <div
                                                                className={cn(
                                                                    "flex h-10 w-10 items-center justify-center rounded-2xl transition-transform",
                                                                    item.iconBg,
                                                                    item.iconColor
                                                                )}
                                                            >
                                                                <item.icon className="h-[18px] w-[18px]" />
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    "text-[10px] leading-tight text-center font-medium line-clamp-2",
                                                                    isActive
                                                                        ? "text-primary"
                                                                        : "text-foreground/70"
                                                                )}
                                                            >
                                                                {item.title}
                                                            </span>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer — current page indicator */}
                                <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {allNavItems.find(
                                                (item) =>
                                                    pathname === item.href ||
                                                    pathname.startsWith(`${item.href}/`)
                                            )?.title ?? "Admin"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}