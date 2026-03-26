"use client";

import React, { useRef, forwardRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import Image from "next/image";
import { SiGooglecloud, SiNotion, SiSlack, SiGithub } from "react-icons/si";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

// Animation Components
import { AnimatedBeam } from "./animated-beam";
import { cn } from "@/lib/utils";
import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

// --- Helper Circle Component for the Beams ---
const Circle = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
    ({ children, className }, ref) => (
        <div
            ref={ref}
            className={cn(
                "z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm",
                className
            )}
        >
            {children}
        </div>
    )
);
Circle.displayName = "Circle";

export default function LandingPage() {
    const phrase = "Heaven oo  3hoaa na y3p3.. 3hoaa na y3 b3k).. 3hoaa na y3 b3tena.. Amen! \u00A0\u00A0\u00A0\u00A0 ";
    const repeatedText = phrase.repeat(30);

    // Refs for Animated Beams (using null! fix for TypeScript)
    const containerRef = useRef<HTMLDivElement>(null!);
    const centerRef = useRef<HTMLDivElement>(null!);
    const icon1Ref = useRef<HTMLDivElement>(null!);
    const icon2Ref = useRef<HTMLDivElement>(null!);
    const icon3Ref = useRef<HTMLDivElement>(null!);
    const icon4Ref = useRef<HTMLDivElement>(null!);

    return (
        <div className="min-h-screen w-full flex items-center justify-center text-black selection:bg-[#c3aef0] selection:text-black">
            <motion.main
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#f7f7f6] w-full relative mx-auto py-20 px-4"
            >
                {/* Top Branding */}
                <header className="flex flex-col md:flex-row justify-between items-start gap-3 mb-10 relative z-10">
                    <div className="block">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                            <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5L12 2Z" />
                        </svg>
                        <span className="font-bold tracking-tight text-sm uppercase">House of Power Min. Int'l</span>
                    </div>

                    <p className="text-gray-700 max-w-sm">
                        Welcome to House of Power. We are honored to have you join us today.. Our branches are located worldwide and always open for you everytime. Our social media platforms are also active, scroll for more.
                    </p>

                    <HoverBorderGradient containerClassName="rounded-full"
                        as="button"
                        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2">
                        <Link href={"/auth/login"}>
                            Sign in
                        </Link>
                    </HoverBorderGradient>


                </header>

                {/* Hero Section */}
                <section className="relative w-full h-[55vh] md:h-[100vh] lg:h-[600px] rounded-3xl overflow-hidden mb-8 bg-neutral-200">
                    <Image
                        src="/images/hero.png"
                        alt="Hero"
                        className="w-full h-full object-cover"
                        fill
                        priority
                    />
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <svg viewBox="0 0 1200 400" className="w-full h-full object-cover opacity-90">
                            <defs>
                                <path id="curve1" d="M -800 200 C -200 200, 300 380, 800 200 C 1300 50, 1600 50, 2200 50" />
                                <path id="curve2" d="M -200 900 C 300 600, 700 300, 1800 -200" />
                            </defs>
                            <use href="#curve1" stroke="#cbb5f5" strokeWidth="65" fill="transparent" />
                            <text fontSize="22" fontWeight="500" fill="#000" dominantBaseline="middle">
                                <motion.textPath href="#curve1" animate={{ startOffset: "-100%" }} transition={{ repeat: Infinity, duration: 60, ease: "linear" }}>
                                    {repeatedText}
                                </motion.textPath>
                            </text>
                            <use href="#curve2" stroke="#cbb5f5" strokeWidth="65" fill="transparent" />
                            <text fontSize="22" fontWeight="500" fill="#000" dominantBaseline="middle">
                                <motion.textPath href="#curve2" animate={{ startOffset: "-100%" }} transition={{ repeat: Infinity, duration: 75, ease: "linear" }}>
                                    {repeatedText}
                                </motion.textPath>
                            </text>
                        </svg>
                    </div>
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-end relative">

                    {/* Left Column: Heading */}
                    <div className="col-span-1 lg:col-span-6 relative">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="font-thin text-[12vh] tracking-tighter leading-none max-w-md"
                        >
                            You&apos;re Warmly<br />Welcome
                        </motion.h1>
                        <motion.div
                            className="absolute right-4 bottom-4 lg:right-[-40px] lg:bottom-4 w-16 h-16 z-10"
                            animate={{ rotate: -360 }}
                            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                        >
                            <svg viewBox="0 0 100 100" fill="none"><path d="M50 0C50 27.6 27.6 50 0 50C27.6 50 50 72.4 50 100C50 72.4 72.4 50 100 50C72.4 50 50 27.6 50 0Z" fill="blue" /></svg>
                        </motion.div>
                    </div>

                    {/* Right Column: Cards */}
                    <div className="col-span-1 lg:col-span-6 flex flex-col justify-between h-full pt-4 lg:pt-0">
                        <div className="relative p-4 flex gap-4 justify-end mb-10 lg:mb-20">
                            <div className="absolute top-0 animate-spin">
                                <Plus size={24} />
                            </div>
                            <p className="text-2xl max-w-sm leading-normal">
                                At HOP, we&apos;re catalysts for <span className="font-bold">change</span>, architects of <span className="font-bold">righteousness</span>, and drivers of <span className="font-bold">growth</span>.
                            </p>
                            <div className="absolute bottom-0 right-20 animate-spin">
                                <Plus size={24} />
                            </div>
                        </div>

                        {/* Content Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* Portrait Image Card */}
                            <div className="hidden md:flex col-span-1 sm:col-span-1 h-36 sm:h-auto rounded-[1.5rem] overflow-hidden relative group border">
                                <Image
                                    src="/images/NanaKwateng.jpg"
                                    alt="Portrait"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    fill
                                />
                            </div>

                            {/* --- REFACTORED STATS & BEAMS CARD --- */}
                            {/* --- REFACTORED STATS & BEAMS CARD --- */}
                            <Card className="relative col-span-1 sm:col-span-3 md:col-span-2 bg-transparent rounded-[1.5rem] flex flex-col justify-between h-auto border-[1px] border-black border-3 overflow-hidden shadow-sm">
                                <CardHeader className="flex flex-row justify-between items-start p-5 pb-0">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <img
                                                key={i}
                                                src={`https://i.pravatar.cc/150?u=${i + 10}`}
                                                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                                                alt="avatar"
                                            />
                                        ))}
                                    </div>
                                    <Badge variant="secondary" className="text-xs font-semibold h-auto py-1 px-2">
                                        <Link href={"youtube.com/prohetfranciskwateng"} className="flex">

                                            Know Better <ArrowUpRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </Badge>
                                </CardHeader>

                                <CardContent className="flex-grow p-0 relative min-h-[250px]" ref={containerRef}>
                                    <div className="flex h-full w-full items-center justify-center">
                                        <div className="flex w-full items-center justify-between max-w-[340px] px-8 relative z-20">

                                            {/* Left Column Icons */}
                                            <div className="flex flex-col justify-center gap-12">
                                                <Circle ref={icon1Ref} className="h-10 w-10 border-red-100 bg-red-50/50">
                                                    <FaYoutube className="h-5 w-5 text-red-600" size={24} />
                                                </Circle>
                                                <Circle ref={icon2Ref} className="h-10 w-10 border-blue-100 bg-blue-50/50">
                                                    <FaFacebook className="h-5 w-5 text-blue-600" size={24} />
                                                </Circle>
                                            </div>

                                            {/* Center Node (The CPU Core) */}
                                            <div className="flex flex-col justify-center">
                                                <div className="relative p-1 rounded-full bg-gradient-to-b from-blue-500 to-pink-500 shadow-inner">
                                                    <Circle ref={centerRef} className="h-16 w-16 border-2 border-white bg-white shadow-xl">
                                                        <Avatar className="h-14 w-14">
                                                            <AvatarImage src="/images/NanaKwateng.jpg" />
                                                            <AvatarFallback>AI</AvatarFallback>
                                                        </Avatar>
                                                    </Circle>
                                                </div>
                                            </div>

                                            {/* Right Column Icons */}
                                            <div className="flex flex-col justify-center gap-12">
                                                <Circle ref={icon3Ref} className="h-10 w-10 border-pink-100 bg-pink-50/50">
                                                    <FaInstagram className="h-5 w-5 text-deeppink" style={{ color: 'deeppink' }} size={24} />
                                                </Circle>
                                                <Circle ref={icon4Ref} className="h-10 w-10 border-yellow-100 bg-yellow-50/50">
                                                    <FaTiktok className="h-5 w-5 text-yellow-600" size={24} />
                                                </Circle>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Animated Beams with Requested Colors */}
                                    <AnimatedBeam
                                        containerRef={containerRef} fromRef={icon1Ref} toRef={centerRef}
                                        gradientStartColor="#ef4444" gradientStopColor="#dc2626" delay={0}
                                    />
                                    <AnimatedBeam
                                        containerRef={containerRef} fromRef={icon2Ref} toRef={centerRef}
                                        gradientStartColor="#3b82f6" gradientStopColor="#2563eb" delay={0.5}
                                    />
                                    <AnimatedBeam
                                        containerRef={containerRef} fromRef={icon3Ref} toRef={centerRef}
                                        gradientStartColor="#ff1493" gradientStopColor="#ff1493" delay={0.2}
                                    />
                                    <AnimatedBeam
                                        containerRef={containerRef} fromRef={icon4Ref} toRef={centerRef}
                                        gradientStartColor="#eab308" gradientStopColor="#eab308" delay={0.7}
                                    />
                                </CardContent>

                                <CardFooter className="flex items-end justify-between p-5 pt-0 mt-4 bg-white">
                                    <div>
                                        <p className="text-[10px] text-black mb-1">Global Impact <br /> Life Transformation</p>
                                        <h2 className="text-4xl font-medium tracking-tighter text-black">
                                            1m+
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] leading-tight text-neutral-500 max-w-[100px]">
                                            Reaching up to many, touching lives and changing destiny.
                                        </p>
                                    </div>
                                </CardFooter>
                            </Card>

                        </div>
                    </div>
                </div>
            </motion.main>
        </div>
    );
}