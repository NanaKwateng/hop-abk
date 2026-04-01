// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
    // ── Skip PWA and public static files immediately ──
    const { pathname } = request.nextUrl;

    const publicFiles = [
        "/manifest.json",
        "/sw.js",
        "/offline",
        "/favicon.ico",
    ];

    const publicPrefixes = [
        "/icons/",
        "/screenshots/",
    ];

    if (
        publicFiles.includes(pathname) ||
        publicPrefixes.some((prefix) => pathname.startsWith(prefix))
    ) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const path = url.pathname;

    const isAuthPage = path.startsWith("/auth");
    const isAdminPage = path.startsWith("/admin");
    const isOnboardingPage = path.startsWith("/onboarding");
    const isPublicRoot = path === "/";

    // 1. Unauthenticated User Protection
    if (!user) {
        if (!isAuthPage && !isPublicRoot) {
            url.pathname = "/auth/login";
            return NextResponse.redirect(url);
        }
        return response;
    }

    // 2. Authenticated User Logic
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role, onboarding_completed")
            .eq("id", user.id)
            .single();

        const role = profile?.role || "member";
        const hasCompletedOnboarding = profile?.onboarding_completed === true;

        // --- ONBOARDING FLOW ENFORCEMENT ---
        if (!hasCompletedOnboarding) {
            if (!isOnboardingPage) {
                url.pathname = "/onboarding";
                return NextResponse.redirect(url);
            }
            return response;
        }

        // --- USER HAS COMPLETED ONBOARDING ---

        if (isOnboardingPage) {
            url.pathname = role === "admin" ? "/admin" : "/users";
            return NextResponse.redirect(url);
        }

        if (isAuthPage || isPublicRoot) {
            url.pathname = role === "admin" ? "/admin" : "/users";
            return NextResponse.redirect(url);
        }

        if (isAdminPage && role !== "admin") {
            url.pathname = "/users";
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons/|screenshots/).*)",
    ],
};