// app/docs/[slug]/toc-wrapper.tsx
"use client";

import { TableOfContents } from "@/components/docs/table-of-contents";
import type { TocItem } from "@/lib/navigation";

interface TableOfContentsWrapperProps {
    items: TocItem[];
}

export function TableOfContentsWrapper({ items }: TableOfContentsWrapperProps) {
    return <TableOfContents items={items} />;
}




