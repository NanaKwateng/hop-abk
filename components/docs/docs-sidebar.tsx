// components/docs/docs-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NavCategory, NavItem } from "@/lib/navigation";

export function DocsSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block px-4">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8 px-8">
                <div className="w-full">
                    {navigation.map((category: NavCategory, index: number) => (
                        <div key={index} className="pb-4">
                            <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
                                {category.title}
                            </h4>
                            <div className="grid grid-flow-row auto-rows-max text-sm">
                                {category.items.map((item: NavItem, i: number) => (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className={cn(
                                            "group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:underline text-muted-foreground hover:text-foreground",
                                            pathname === item.href &&
                                            "font-medium text-foreground"
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </aside>
    );
}