"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "../ui/button";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { UserDropdown } from "../auth/UserMenu";

export const HeroSection = () => {
    const containerRef = useRef<HTMLElement>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    // Parallax and fade effects
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="relative h-screen w-full overflow-hidden bg-black text-white"
            aria-label="Welcome to Helious"
        >
            {/* Background Container with Parallax */}
            <motion.div
                style={{ y: yBg }}
                className="absolute inset-0 z-0 h-[110%] w-full"
            >
                {/* Video Background */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    onCanPlayThrough={() => setIsVideoLoaded(true)}
                    // Poster image is crucial for performance and UX while video loads
                    poster="https://images.unsplash.com/photo-1506501139174-099022df5260?q=80&w=2071&auto=format&fit=crop"
                    className={`h-full w-full object-cover brightness-[0.6] contrast-125 transition-opacity duration-1000 ${isVideoLoaded ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <source src="/videos/video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Fallback/Loading Image - visible while video is buffering */}
                {!isVideoLoaded && (
                    <img
                        src="https://images.unsplash.com/photo-1506501139174-099022df5260?q=80&w=2071&auto=format&fit=crop"
                        alt="Hero Fallback"
                        className="absolute inset-0 h-full w-full object-cover brightness-[0.6]"
                    />
                )}

                {/* High-Performance Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 z-10" />
            </motion.div>

            {/* Navigation */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-8 right-8 md:right-16 z-30"
            >
                <UserDropdown />
            </motion.header>

            {/* Bottom Content Area */}
            <motion.div
                style={{ opacity }}
                className="absolute bottom-0 z-20 flex w-full flex-col justify-between gap-8 p-6 md:flex-row md:items-end md:p-12 lg:p-20"
            >
                {/* Huge Title & Asterisk */}
                <div className="relative flex items-start">
                    <motion.h1
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[18vw] md:text-[12vw] font-serif leading-[0.8]"
                    >
                        Welcome
                    </motion.h1>

                    {/* Animated Asterisk */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="mt-4 ml-2"
                    >
                        <svg
                            className="w-10 h-10 md:w-20 md:h-20 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5L12 2Z" />
                        </svg>
                    </motion.div>
                </div>

                {/* Right Side Text & Button */}
                <div className="flex max-w-sm flex-col gap-8 md:mb-6">
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-sm md:text-base font-light leading-relaxed text-neutral-200"
                    >
                        At HOP, we're catalysts for change, architects of righteousness, and drivers of growth
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                    >
                        <Link href={"/users/dashboard"}>
                            <Button
                                className="group pl-8 pr-3 py-7 rounded-full text-lg bg-white text-black hover:bg-neutral-200"
                                variant={"secondary"}
                            >
                                Get started
                                <div className="ml-6 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-[-45deg]">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="M5 12h14m-7-7 7 7-7 7" />
                                    </svg>
                                </div>
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};