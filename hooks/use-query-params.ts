// src/hooks/use-query-params.ts
// ============================================================
// URL QUERY PARAMS explained:
//
// A URL like: /admin/users?search=john&page=2&gender=Male
//                          ↑ these are "query parameters"
//
// This hook READS from and WRITES to the URL bar.
//
// WHY?
// 1. Refresh page → filters preserved (they're in the URL!)
// 2. Share URL → recipient sees same filtered view
// 3. Back button → returns to previous filter state
// 4. Bookmark → save a specific view
//
// HOW?
// We use Next.js's useSearchParams (reads URL) and useRouter (writes URL)
// When user changes a filter, we update the URL.
// When page loads, we read filters FROM the URL.
// ============================================================

"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Hook to sync state with URL query parameters.
 * 
 * Returns functions to get, set, and remove URL parameters.
 */
export function useQueryParams() {
    const router = useRouter();
    const pathname = usePathname(); // Current path, e.g., "/admin/users"
    const searchParams = useSearchParams(); // Current query params

    /**
     * Get a single query parameter value.
     * URL: /admin/users?search=john
     * getParam("search") → "john"
     * getParam("missing") → null
     */
    const getParam = useCallback(
        (key: string): string | null => {
            return searchParams.get(key);
        },
        [searchParams]
    );

    /**
     * Get all values for a parameter (for multi-value params).
     * URL: /admin/users?group=Youth&group=Men
     * getAllParams("group") → ["Youth", "Men"]
     */
    const getAllParams = useCallback(
        (key: string): string[] => {
            return searchParams.getAll(key);
        },
        [searchParams]
    );

    /**
     * Update one or more query parameters.
     * Preserves existing params that aren't being changed.
     * 
     * Example:
     *   Current URL: /admin/users?search=john&page=1
     *   setParams({ page: "2", gender: "Male" })
     *   New URL:     /admin/users?search=john&page=2&gender=Male
     * 
     * Pass null to REMOVE a parameter:
     *   setParams({ gender: null })
     *   New URL:     /admin/users?search=john&page=2
     */
    const setParams = useCallback(
        (params: Record<string, string | null>) => {
            // Start with current params
            const newParams = new URLSearchParams(searchParams.toString());

            // Apply changes
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === "") {
                    newParams.delete(key); // Remove param if value is null/empty
                } else {
                    newParams.set(key, value); // Set/update param
                }
            });

            // Build new URL string
            const queryString = newParams.toString();
            const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

            // Update browser URL without full page reload
            // router.push adds to history (back button works)
            // router.replace would NOT add to history
            router.push(newUrl, { scroll: false }); // scroll: false prevents jumping to top
        },
        [searchParams, pathname, router]
    );

    /**
     * Remove specific query parameters.
     * removeParams(["search", "gender"])
     */
    const removeParams = useCallback(
        (keys: string[]) => {
            const updates: Record<string, null> = {};
            keys.forEach((key) => {
                updates[key] = null;
            });
            setParams(updates);
        },
        [setParams]
    );

    /**
     * Clear ALL query parameters.
     * Navigates to the bare pathname: /admin/users
     */
    const clearAllParams = useCallback(() => {
        router.push(pathname, { scroll: false });
    }, [pathname, router]);

    return {
        getParam,
        getAllParams,
        setParams,
        removeParams,
        clearAllParams,
        searchParams, // Expose raw searchParams for special cases
    };
}




