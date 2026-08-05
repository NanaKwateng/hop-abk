// "use client";

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { cn } from '@/lib/utils';
// import { ChevronLeft, ChevronRight, RefreshCcw, X, BookOpen } from 'lucide-react';

// export interface BookPage {
//     title?: string;
//     content: React.ReactNode;
//     backContent?: React.ReactNode;
//     pageNumber: number;
// }

// export interface InteractiveBookProps {
//     coverImage: string;
//     bookTitle?: string;
//     bookAuthor?: string;
//     pages: BookPage[];
//     className?: string;
//     width?: number | string;
//     height?: number | string;
// }

// export default function InteractiveBook({
//     coverImage,
//     bookTitle = "Book Title",
//     bookAuthor = "Author Name",
//     pages,
//     className,
//     width = 350,
//     height = 500,
// }: InteractiveBookProps) {
//     const [isOpen, setIsOpen] = useState(false);
//     const [currentPageIndex, setCurrentPageIndex] = useState(-1);
//     const [isHovering, setIsHovering] = useState(false);

//     // Calculate dynamic width/height values for animations
//     const widthNum = typeof width === 'number' ? width : 350;

//     // Sync container shift with cover open
//     const BOOK_OPEN_DURATION = 1.5;
//     const EASING: [number, number, number, number] = [0.25, 0, 0, 1]; // milder smoothing

//     const handleOpenBook = () => setIsOpen(true);

//     const handleCloseBook = (e?: React.MouseEvent) => {
//         e?.stopPropagation();
//         setIsOpen(false);
//         setCurrentPageIndex(-1);
//     };

//     const nextPage = (e?: React.MouseEvent) => {
//         e?.stopPropagation();
//         if (currentPageIndex < pages.length - 1) {
//             setCurrentPageIndex((prev) => prev + 1);
//         }
//     };

//     const prevPage = (e?: React.MouseEvent) => {
//         e?.stopPropagation();
//         if (currentPageIndex >= 0) {
//             setCurrentPageIndex((prev) => prev - 1);
//         }
//     };

//     const restartBook = (e?: React.MouseEvent) => {
//         e?.stopPropagation();
//         setCurrentPageIndex(-1);
//     };

//     const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setCurrentPageIndex(parseInt(e.target.value, 10));
//     };

//     // Keyboard navigation
//     useEffect(() => {
//         if (!isOpen) return;
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if (e.key === 'ArrowRight') nextPage();
//             if (e.key === 'ArrowLeft') prevPage();
//             if (e.key === 'Escape') handleCloseBook();
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [isOpen, currentPageIndex]);

//     return (
//         <div
//             className={cn("relative flex items-center justify-center perspective-[2000px]", className)}
//             style={{
//                 width: typeof width === 'number' ? width * 3.5 : '100%',
//                 height: typeof height === 'number' ? height + 100 : 'auto'
//             }}
//         >
//             <motion.div
//                 className={cn(
//                     "relative preserve-3d"
//                 )}
//                 style={{ width, height }}
//                 initial={{ x: 0 }}
//                 animate={{ x: isOpen ? widthNum / 2 : 0 }}
//                 transition={{ duration: BOOK_OPEN_DURATION, ease: EASING }}
//             >

//                 {/* Front Cover */}
//                 <motion.div
//                     className="absolute inset-0 w-full h-full origin-left"
//                     initial={{ rotateY: 0, zIndex: 100 }}
//                     animate={{
//                         rotateY: isOpen ? -180 : (isHovering ? -15 : 0),
//                         zIndex: isOpen ? 0 : 100
//                     }}
//                     transition={{
//                         rotateY: { duration: BOOK_OPEN_DURATION, ease: EASING },
//                         zIndex: { delay: isOpen ? BOOK_OPEN_DURATION * 0.6 : BOOK_OPEN_DURATION * 0.4 }
//                     }}
//                     style={{ transformStyle: 'preserve-3d' }}
//                     onClick={!isOpen ? handleOpenBook : undefined}
//                     onHoverStart={() => !isOpen && setIsHovering(true)}
//                     onHoverEnd={() => setIsHovering(false)}
//                 >
//                     {/* Front Face */}
//                     <div
//                         className="absolute inset-0 w-full h-full backface-hidden rounded-r-md rounded-l-sm shadow-2xl cursor-pointer overflow-hidden group"
//                         style={{ transform: 'translateZ(0.5px)' }}
//                     >
//                         {/* Image Background */}
//                         <div
//                             className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
//                             style={{ backgroundImage: `url(${coverImage})` }}
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

//                         <div className="absolute bottom-4 left-3 right-3 text-white text-left">
//                             <h1 className="text-sm font-serif font-bold tracking-wide mb-1 drop-shadow-md leading-tight">{bookTitle}</h1>
//                             <p className="text-[8px] font-sans tracking-widest opacity-90 uppercase border-t border-white/30 pt-1 inline-block">{bookAuthor}</p>
//                         </div>

//                         {/* Spine Highlight */}
//                         <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/30 to-transparent opacity-40" />
//                         <div className="absolute left-[12px] top-0 bottom-0 w-[1px] bg-black/30" />
//                     </div>

//                     {/* Back Face (Inner Cover) */}
//                     <div
//                         className="absolute inset-0 w-full h-full backface-hidden rounded-l-md rounded-r-sm bg-[#fdfbf7] rotate-y-180 flex flex-col p-8 border-r border-neutral-200 shadow-xl cursor-pointer hover:bg-[#fcfaf5] transition-colors"
//                         style={{ transform: 'rotateY(180deg) translateZ(0.5px)' }}
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             prevPage();
//                         }}
//                     >
//                         <div className="flex-1 flex flex-col justify-center items-center text-center opacity-80">
//                             <h2 className="text-2xl font-serif text-neutral-800 mb-2 tracking-wide">{bookTitle}</h2>
//                             <div className="w-8 h-[1px] bg-neutral-300 mb-3" />
//                             <p className="text-xs text-neutral-500 uppercase tracking-widest">Interactive Edition</p>
//                         </div>
//                     </div>
//                 </motion.div>

//                 {/* Pages Stack */}
//                 <div className="absolute inset-0 w-full h-full z-0" style={{ transformStyle: 'preserve-3d' }}>
//                     {pages.map((page, index) => {
//                         const isFlipped = index <= currentPageIndex;
//                         // Stagger delays slightly for a realistic "whip" effect if user clicks fast, 
//                         // but mostly we want instant feedback with smooth transition.

//                         return (
//                             <motion.div
//                                 key={index}
//                                 className="absolute inset-0 w-full h-full origin-left bg-[#fdfbf7] rounded-r-md rounded-l-sm shadow-sm border border-neutral-100"
//                                 style={{ transformStyle: 'preserve-3d' }}
//                                 initial={{ rotateY: 0, zIndex: pages.length - index }}
//                                 animate={{
//                                     rotateY: isFlipped ? -180 : 0,
//                                     zIndex: isFlipped ? index + 1 : pages.length - index
//                                 }}
//                                 transition={{
//                                     duration: 0.6,
//                                     ease: [0.645, 0.045, 0.355, 1]
//                                 }}
//                             >
//                                 {/* Front Face (Right Side) */}
//                                 <div
//                                     className="absolute inset-0 w-full h-full backface-hidden p-8 flex flex-col bg-[#fdfbf7] cursor-pointer hover:bg-[#fcfaf5] transition-colors"
//                                     style={{ transform: 'translateZ(0.5px)' }}
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         nextPage();
//                                     }}
//                                 >
//                                     <div className="flex-1">
//                                         <div className="text-xs text-neutral-400 text-right mb-4 font-sans tracking-wider">
//                                             {page.pageNumber * 2 - 1}
//                                         </div>
//                                         <div className="prose prose-neutral prose-sm max-w-none font-serif text-neutral-700 leading-relaxed select-none">
//                                             {page.title && (
//                                                 <h3 className="text-xl font-medium text-center mb-6 text-neutral-800 tracking-tight">
//                                                     {page.title}
//                                                 </h3>
//                                             )}
//                                             {page.content}
//                                         </div>
//                                     </div>
//                                     <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none mix-blend-multiply" />
//                                 </div>

//                                 {/* Back Face (Left Side) */}
//                                 <div
//                                     className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-[#fdfbf7] border-r border-neutral-200 overflow-hidden p-8 flex flex-col cursor-pointer hover:bg-[#fcfaf5] transition-colors"
//                                     style={{ transform: 'rotateY(180deg) translateZ(0.5px)' }}
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         prevPage();
//                                     }}
//                                 >
//                                     <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none mix-blend-multiply" />

//                                     <div className="flex-1 overflow-hidden">
//                                         <div className="text-xs text-neutral-400 text-left mb-4 font-sans tracking-wider">
//                                             {page.pageNumber * 2}
//                                         </div>
//                                         <div className="prose prose-neutral prose-sm max-w-none font-serif text-neutral-700 leading-relaxed select-none h-full flex flex-col">
//                                             {page.backContent ? (
//                                                 <div className="flex-1">
//                                                     {page.backContent}
//                                                 </div>
//                                             ) : (
//                                                 <div className="w-full h-full flex items-center justify-center opacity-[0.03]">
//                                                     <span className="font-serif text-8xl italic font-bold text-black">
//                                                         {page.pageNumber * 2}
//                                                     </span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </motion.div>
//                         );
//                     })}

//                     {/* Back Cover (Static) */}
//                     <div
//                         className="absolute inset-0 w-full h-full bg-[#fdfbf7] rounded-r-md rounded-l-sm shadow-xl border border-neutral-200"
//                         style={{ transform: 'translateZ(-1px)', zIndex: -1 }}
//                     >
//                         <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center opacity-40">
//                             <p className="font-serif text-neutral-500 italic">The End</p>
//                             <button
//                                 onClick={restartBook}
//                                 className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-sm text-neutral-600 cursor-pointer"
//                             >
//                                 <RefreshCcw size={14} /> Read Again
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Controls Bar Removed */}

//             </motion.div>

//             {/* Side Navigation Arrows */}
//             <AnimatePresence>
//                 {isOpen && (
//                     <>
//                         {/* Close Button */}
//                         <motion.button
//                             initial={{ opacity: 0, scale: 0.8 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             exit={{ opacity: 0, scale: 0.8 }}
//                             onClick={handleCloseBook}
//                             className="absolute top-8 right-8 p-2 rounded-full bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 backdrop-blur-sm text-neutral-800 dark:text-neutral-100 z-[1000] transition-all hover:scale-110 shadow-sm hover:shadow-xl"
//                         >
//                             <X size={24} />
//                         </motion.button>
//                     </>
//                 )}
//             </AnimatePresence>

//             {/* Hint */}
//             {!isOpen && (
//                 <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 1, duration: 1 }}
//                     className="absolute bottom-4 text-neutral-500 dark:text-neutral-400 text-sm font-medium tracking-widest uppercase cursor-pointer z-50 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
//                     onClick={handleOpenBook}
//                 >
//                     Click to Open
//                 </motion.div>
//             )}
//         </div>
//     );
// }


// components/ui/interactive-book.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Page {
    pageNumber: number;
    title: string;
    content: string;
}

interface InteractiveBookProps {
    coverImage?: string;
    pages: Page[];
    className?: string;
}

const spring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
};

export function InteractiveBook({
    coverImage,
    pages,
    className,
}: InteractiveBookProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [direction, setDirection] = useState<"forward" | "backward">("forward");

    const totalPages = pages.length;
    const isCover = currentPage === 0;
    const isLastPage = currentPage === totalPages;

    const goToNextPage = () => {
        if (isFlipping) return;
        if (currentPage < totalPages) {
            setDirection("forward");
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentPage((prev) => prev + 1);
                setIsFlipping(false);
            }, 300);
        }
    };

    const goToPrevPage = () => {
        if (isFlipping) return;
        if (currentPage > 0) {
            setDirection("backward");
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentPage((prev) => prev - 1);
                setIsFlipping(false);
            }, 300);
        }
    };

    const goToPage = (pageIndex: number) => {
        if (isFlipping) return;
        if (pageIndex === currentPage) return;
        setDirection(pageIndex > currentPage ? "forward" : "backward");
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPage(pageIndex);
            setIsFlipping(false);
        }, 300);
    };

    const currentContent = isCover ? null : pages[currentPage - 1];

    return (
        <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
            <div className="relative aspect-[3/4] w-full perspective-1000">
                <Card className="relative h-full w-full overflow-hidden shadow-2xl border-0">
                    <AnimatePresence mode="wait">
                        {isCover ? (
                            <motion.div
                                key="cover"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={spring}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-background p-8 text-center"
                            >
                                {coverImage && (
                                    <div className="mb-6">
                                        <img
                                            src={coverImage}
                                            alt="Book Cover"
                                            className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-primary/20"
                                        />
                                    </div>
                                )}
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                    HOP User Guide
                                </h1>
                                <p className="mt-4 text-lg text-muted-foreground max-w-md">
                                    Your complete guide to managing your church with HOP
                                </p>
                                <div className="mt-8 flex items-center gap-4">
                                    <div className="h-1 w-12 rounded-full bg-primary" />
                                    <span className="text-sm text-muted-foreground">
                                        {totalPages} pages
                                    </span>
                                    <div className="h-1 w-12 rounded-full bg-primary" />
                                </div>
                                <Button
                                    size="lg"
                                    className="mt-8 gap-2"
                                    onClick={goToNextPage}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Start Reading
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={currentPage}
                                initial={{
                                    opacity: 0,
                                    x: direction === "forward" ? 50 : -50,
                                    rotateY: direction === "forward" ? 10 : -10,
                                }}
                                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                exit={{
                                    opacity: 0,
                                    x: direction === "forward" ? -50 : 50,
                                    rotateY: direction === "forward" ? -10 : 10,
                                }}
                                transition={spring}
                                className="absolute inset-0 p-8 md:p-12 overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Page {currentContent?.pageNumber} of {totalPages}
                                    </span>
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => goToPage(i + 1)}
                                                className={cn(
                                                    "h-1.5 w-6 rounded-full transition-all",
                                                    i + 1 === currentPage
                                                        ? "bg-primary"
                                                        : "bg-muted hover:bg-muted-foreground/30"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                                        {currentContent?.title}
                                    </h2>
                                    <div className="prose prose-sm md:prose-base max-w-none">
                                        {currentContent?.content.split('\n').map((paragraph, index) => (
                                            <p key={index} className="text-muted-foreground leading-relaxed">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
                                    {currentContent?.pageNumber} / {totalPages}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isCover && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
                                onClick={goToPrevPage}
                                disabled={isFlipping}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
                                onClick={goToNextPage}
                                disabled={isFlipping || isLastPage}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </>
                    )}
                </Card>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 0 || isFlipping}
                    className="gap-1"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                    {isCover ? "Cover" : `${currentPage} / ${totalPages}`}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={isLastPage || isFlipping}
                    className="gap-1"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}