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