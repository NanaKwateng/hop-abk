// components/docs/table-of-contents.tsx
"use client";

import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import type { TocItem } from "@/lib/navigation";
import Link from "next/link";

interface TableOfContentsProps {
    items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
    const ids = items.map((item) => item.id);
    const activeId = useScrollSpy(ids);

    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        id: string
    ) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            // Update URL hash without scroll jump
            window.history.pushState(null, "", `#${id}`);
        }
    };

    return (
        <div className="space-y-2">
            <p className="font-medium">On This Page</p>
            <ul className="m-0 list-none">
                {items.map((item) => (
                    <li key={item.id} className="mt-0 pt-2">
                        <Link
                            href={`#${item.id}`}
                            onClick={(e) => handleClick(e, item.id)}
                            className={cn(
                                "inline-block text-sm no-underline transition-colors hover:text-foreground",
                                activeId === item.id
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}