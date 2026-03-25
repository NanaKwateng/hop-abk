// components/docs/doc-pager.tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/navigation";

interface DocPagerProps {
    prev: NavItem | null;
    next: NavItem | null;
}

export function DocPager({ prev, next }: DocPagerProps) {
    return (
        <div className="flex flex-row items-center justify-between py-8">
            {prev ? (
                <Link
                    href={prev.href}
                    className={cn(
                        "inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
                    )}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {prev.title}
                </Link>
            ) : (
                <div />
            )}
            {next ? (
                <Link
                    href={next.href}
                    className={cn(
                        "inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent ml-auto"
                    )}
                >
                    {next.title}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            ) : (
                <div />
            )}
        </div>
    );
}