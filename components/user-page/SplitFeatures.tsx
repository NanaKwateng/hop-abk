"use client"

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "../ui/button";
import { useRef } from "react";



export const SplitFeatureSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    // Scale up the inner images slightly as you scroll down
    const scaleImage = useTransform(scrollYProgress, [0, 0.5], [1.2, 1]);

    // Dot Grid Background (CSS generated)
    const dotPattern = "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)";

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen w-full bg-[#0a0a0a] p-4 md:p-8 flex flex-col justify-between"
            style={{ backgroundImage: dotPattern, backgroundSize: '32px 32px' }}
            aria-labelledby="features-title"
        >

            {/* Main Split Visuals */}
            <div className="relative flex-1 w-full my-8 flex items-stretch gap-2 md:gap-4 overflow-hidden rounded-[2rem] md:rounded-[3rem]">



                {/* The 3 Panels creating a continuous image effect */}
                {[0, 1, 2].map((index) => (
                    <div key={index} className="relative w-1/3 h-full overflow-hidden rounded-2xl md:rounded-3xl border border-white/5">
                        {/* 
              To make it look like one continuous image split into 3, 
              we make the inner image 300% width, and translate it based on its index.
            */}
                        <motion.div
                            style={{ scale: scaleImage }}
                            className="absolute inset-0 h-full w-[300vw] max-w-[300%] bg-white"
                        >
                            <div
                                className="h-full w-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `/images/logo.jpeg')`,
                                    transform: `translateX(-${index * 33.333}%)`,
                                    width: '300%'
                                }}
                            />
                        </motion.div>
                        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                    </div>
                ))}

                {/* Center Pill Cutout/Overlay */}
                <div
                //className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 h-[40vh] w-[15vw] min-w-[120px] rounded-full bg-[#0a0a0a]/90 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden"
                >
                    {/* Inner dot grid for the pill */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: dotPattern, backgroundSize: '16px 16px' }} />
                    {/* Inner light reflection */}
                    {/* <div className="absolute bottom-4 right-4 h-16 w-16 rounded-full bg-white/20 blur-2xl animate" /> */}
                </div>
            </div>

            {/* Bottom Content (Organized Text) */}
            <footer className="z-20 flex w-full flex-col md:flex-row justify-between items-end p-2 md:p-6 text-white gap-8">

                <div className="flex max-w-sm flex-col gap-6">
                    <p className="text-sm md:text-base text-gray-400">
                        Micro is an all-in-one tool for email, CRM, project management, and more that automatically organizes itself.
                    </p>
                    <div>
                        <Button className=" rounded-full text-base bg-white text-black hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            Join the Waitlist
                        </Button>
                    </div>
                </div>

                <div className="text-right flex flex-col items-end">
                    {/* Scroll-revealed morphing text */}
                    <motion.h2
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-[12vw] md:text-[8vw] font-bold leading-[0.85] tracking-tighter"
                        id="features-title"
                    >
                        Organized.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-lg md:text-2xl text-gray-400 font-serif italic mt-2"
                    >
                        So you don't have to be.
                    </motion.p>
                </div>

            </footer>
        </section>
    );
};
