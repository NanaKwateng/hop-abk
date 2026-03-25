// components/docs/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigation, type NavCategory } from "@/lib/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn("fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block", className)}>
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
                <div className="space-y-6">
                    {navigation.map((category) => (
                        <SidebarCategory
                            key={category.title}
                            category={category}
                            pathname={pathname}
                        />
                    ))}
                </div>
            </ScrollArea>
        </aside>
    );
}

function SidebarCategory({
    category,
    pathname,
}: {
    category: NavCategory;
    pathname: string;
}) {
    return (
        <div className="px-3 py-2">
            {/* Category title, hidden if you strictly want to match the image, but kept to not break logic */}
            <h4 className="mb-3 px-2 text-sm font-semibold tracking-tight text-muted-foreground">
                {category.title}
            </h4>
            {/* Switched from grid w-full to flex flex-col items-start to allow dynamic widths */}
            <div className="flex flex-col items-start gap-1.5 text-sm">
                {category.items.map((item) => {
                    // Exact match OR starts with path (handles nested routes nicely)
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                                // Use w-fit and rounded-full for the dynamic length pill shape
                                "w-fit justify-start h-auto py-1.5 pl-1.5 pr-6 font-normal rounded-full transition-all",
                                isActive
                                    ? "bg-secondary text-foreground font-medium" // Active Background Pill
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50" // Inactive
                            )}
                            asChild
                        >
                            <Link href={item.href}>
                                <div className="flex items-center gap-3">
                                    {/* Circular colorful Icon */}
                                    <div className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                        item.iconBg,
                                        item.iconColor
                                    )}>
                                        <item.icon className="h-[18px] w-[18px]" />
                                    </div>

                                    {/* Text Content */}
                                    <span className="flex items-center">
                                        {item.title}
                                        {item.label && (
                                            <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-[10px] leading-none text-[#000000] font-bold uppercase">
                                                {item.label}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}