"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Define what a section looks like in our state
interface SectionItem {
    id: string;
    title: string;
}

export function FloatingToc() {
    const pathname = usePathname(); // Track route changes to rescan the page
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // 1. Wait a tiny moment for the React tree to fully render the page content
        const timeoutId = setTimeout(() => {
            // Find every <section> tag that has an ID attribute on the page
            const elements = Array.from(document.querySelectorAll("section[id]"));

            // Map over them and extract the title
            const newSections = elements.map((el) => {
                // Try to grab the first heading tag inside the section
                const heading = el.querySelector("h1, h2, h3, h4, h5, h6");
                let title = heading?.textContent || el.id;

                // If it couldn't find a heading, just format the ID nicely
                // (e.g., id="user-settings" becomes "User settings")
                if (!heading?.textContent) {
                    title = title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, " ");
                }
                return { id: el.id, title };
            });

            setSections(newSections);

            // 2. Set up an Intersection Observer to watch which section is on screen
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        // When a section comes near the top of the viewport, set it as active
                        if (entry.isIntersecting) {
                            setActiveId(entry.target.id);
                        }
                    });
                },
                { rootMargin: "0px 0px -80% 0px" } // Trigger when the top of the section hits the top 20% of the screen
            );

            elements.forEach((el) => observer.observe(el));

            // Cleanup when the component unmounts or path changes
            return () => {
                elements.forEach((el) => observer.unobserve(el));
                observer.disconnect();
            };
        }, 100); // 100ms delay ensures DOM is painted

        return () => clearTimeout(timeoutId);
    }, [pathname]); // Re-run this effect every time the URL changes!

    // =========================================================
    // FALLBACK UI: If there are no sections with IDs on the page
    // =========================================================
    if (sections.length === 0) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="font-semibold leading-none tracking-tight text-lg">
                        Welcome Admin 👋
                    </h3>
                </div>
                <div className="p-6 pt-0 text-sm text-muted-foreground">
                    <p className="leading-relaxed">
                        You're doing excellent work organizing and managing the House of God. Every update you make here helps the church thrive. Keep up the great work!
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // ACTIVE TOC UI: If the page has <section id="..."> tags
    // =========================================================
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-5 border-b bg-muted/40 rounded-t-xl">
                <h3 className="font-semibold leading-none tracking-tight">On This Page</h3>
            </div>
            <div className="p-5 flex flex-col space-y-2.5">
                {sections.map((section) => (
                    <Link
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={(e) => {
                            // Smooth scroll fallback
                            e.preventDefault();
                            document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                            setActiveId(section.id);
                            // Optionally, update URL hash silently
                            window.history.pushState(null, "", `#${section.id}`);
                        }}
                        className={`text-sm transition-colors hover:text-foreground ${activeId === section.id
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                            }`}
                    >
                        {section.title}
                    </Link>
                ))}
            </div>
        </div>
    );
}