import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDocContent } from "@/lib/docs-content";
import { getDocBySlug, getAdjacentDocs, navigation } from "@/lib/navigation";
import { DocBreadcrumb } from "@/components/docs/doc-breadcrumb";
import { DocPager } from "@/components/docs/doc-pager";
import { DocContentRenderer } from "./doc-content-renderer";
import { FloatingToc } from "@/components/docs/floating-toc"; // <-- Import the new component

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const content = getDocContent(slug);
    return {
        title: content.title,
        description: content.description,
    };
}

export async function generateStaticParams() {
    const allItems = navigation.flatMap((cat) =>
        cat.items.map((item) => ({
            slug: item.href.replace("/admin/", ""),
        }))
    );
    return allItems;
}

function getCategoryForSlug(slug: string): string | undefined {
    for (const category of navigation) {
        const found = category.items.find((item) => item.href === `/admin/${slug}`);
        if (found) return category.title;
    }
    return undefined;
}

export default async function AdminDynamicPage({ params }: PageProps) {
    const { slug } = await params;
    const docItem = getDocBySlug(slug);
    const content = getDocContent(slug);
    const { prev, next } = getAdjacentDocs(slug);
    const category = getCategoryForSlug(slug);

    if (!docItem && !content) {
        notFound();
    }

    return (
        // Changed grid layout slightly to give the right column fixed width (w-64 or w-72) 
        // to look like the Vercel deploy card proportions.
        <div className="w-full xl:grid xl:grid-cols-[1fr_280px] xl:gap-12 pb-12">
            {/* Middle: Main Content Area */}
            <div className="mx-auto w-full min-w-0 min-h-screen ">
                <DocBreadcrumb category={category} title={content.title} />

                <div className="space-y-2 mb-8">
                    <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl">
                        {content.title}
                    </h1>
                    {content.description && (
                        <p className="text-lg text-muted-foreground">
                            {content.description}
                        </p>
                    )}
                </div>

                {/* This renders your dynamic pages like <UsersContent/> or <PlaceholderContent/> */}
                <div className="pb-12">
                    <DocContentRenderer slug={slug} content={content} />
                </div>

                <DocPager prev={prev} next={next} />
            </div>

            {/* Right: Floating Card Table of Contents */}
            <div className="hidden text-sm xl:block">
                {/* 
                   The "sticky top-20" makes the card float and follow the user down the page.
                   The "relative" allows the card to float without forcing the parent height.
                */}
                <div className="sticky top-50 right-0 w-full pt-16">
                    <FloatingToc />
                </div>
            </div>
        </div>
    );
}