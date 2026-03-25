// components/docs/doc-breadcrumb.tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface DocBreadcrumbProps {
    category?: string;
    title: string;
}

export function DocBreadcrumb({ category, title }: DocBreadcrumbProps) {
    return (
        <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
            <Link href="/docs/introduction" className="hover:text-foreground truncate">
                Docs
            </Link>
            {category && (
                <>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="truncate">{category}</span>
                </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground truncate">{title}</span>
        </div>
    );
}