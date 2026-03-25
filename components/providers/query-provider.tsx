// src/components/providers/query-provider.tsx
// ============================================================
// Wraps the app with TanStack Query's QueryClientProvider.
// This MUST be at the top of the component tree so all
// components below can use useQuery and useMutation hooks.
//
// "use client" is needed because TanStack Query uses React context,
// which only works in client components in Next.js App Router.
// ============================================================

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
    // useState ensures each browser tab gets its own QueryClient
    // (important for SSR and avoiding shared state between users)
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,   // Data is "fresh" for 30 seconds
                        retry: 1,            // Retry failed requests once
                        refetchOnWindowFocus: false, // Don't refetch when tab regains focus
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools: Shows query cache state. Only visible in development. */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}