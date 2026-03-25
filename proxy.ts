// src/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
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
        // Fetch role AND onboarding status from DB
        const { data: profile } = await supabase
            .from("profiles")
            .select("role, onboarding_completed")
            .eq("id", user.id)
            .single();

        const role = profile?.role || "member";
        const hasCompletedOnboarding = profile?.onboarding_completed === true;

        // --- NEW: ONBOARDING FLOW ENFORCEMENT ---
        if (!hasCompletedOnboarding) {
            // If they haven't finished onboarding, force them to the onboarding page
            if (!isOnboardingPage) {
                url.pathname = "/onboarding";
                return NextResponse.redirect(url);
            }
            // If they are already on /onboarding, just let them stay there
            return response;
        }

        // --- USER HAS COMPLETED ONBOARDING ---

        // Prevent users who have already onboarded from going back to the onboarding page
        if (isOnboardingPage) {
            url.pathname = role === "admin" ? "/admin" : "/users";
            return NextResponse.redirect(url);
        }

        // A. If user is on Login/Signup page or Root, redirect to their dashboard
        if (isAuthPage || isPublicRoot) {
            url.pathname = role === "admin" ? "/admin" : "/users";
            return NextResponse.redirect(url);
        }

        // B. Protect Admin Routes
        if (isAdminPage && role !== "admin") {
            url.pathname = "/users";
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};