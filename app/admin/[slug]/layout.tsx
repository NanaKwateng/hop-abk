// // /admin/[slug]/layout.tsx
// // ============================================================
// // Root layout: wraps EVERY page in the app.
// // Sets up: fonts, providers, and the toast notification system.
// // ============================================================

import { QueryProvider } from "@/components/providers/query-provider";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // DO NOT include <html> or <body> tags here
    return (
        <QueryProvider>
            <div className="min-h-screen bg-background">
                {/* Your admin-specific layout content */}
                {children}
            </div>
        </QueryProvider>
    );
}
