"use client";

import * as React from "react";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { TocItem } from "@/types/nav";
import { cn } from "@/lib/utils";

interface TocProps {
    items: TocItem[];
}

export function DashboardTableOfContents({ items }: TocProps) {
    const activeId = useScrollSpy(items.map((item) => item.url.split("#")[1]));

    return (
        <div className="hidden text-sm xl:block">
            <div className="sticky top-16 -mt-10 pt-4">
                <div className="pb-4">
                    <h4 className="mb-1 text-sm font-semibold text-foreground">
                        On This Page
                    </h4>
                    <ul className="space-y-2 pt-2">
                        {items.map((item) => (
                            <li key={item.url}>
                                <a
                                    href={item.url}
                                    className={cn(
                                        "inline-block no-underline transition-colors hover:text-foreground",
                                        item.url === `#${activeId}`
                                            ? "font-medium text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {item.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}