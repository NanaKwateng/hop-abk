// src/hooks/use-media-query.ts
// ============================================================
// Detects screen size so we can show different UI on mobile vs desktop.
// On mobile: show cards instead of a wide table.
// On desktop: show the full table.
// ============================================================

"use client";

import { useState, useEffect } from "react";

/**
 * Hook that returns true/false based on a CSS media query.
 * 
 * @param query - CSS media query string, e.g., "(min-width: 768px)"
 * @returns boolean - true if the query matches
 * 
 * Usage:
 *   const isDesktop = useMediaQuery("(min-width: 768px)");
 *   // isDesktop = true on tablets and larger
 *   // isDesktop = false on phones
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Create a MediaQueryList object
        const media = window.matchMedia(query);

        // Set initial value
        setMatches(media.matches);

        // Listen for changes (e.g., user resizes browser)
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        media.addEventListener("change", listener);

        // Cleanup: stop listening when component unmounts
        return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
}

