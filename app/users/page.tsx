import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserDropdown } from "@/components/auth/UserMenu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FilmGrain } from "@/components/user-page/FilmGrain"
import { HeroSection } from "@/components/user-page/HeroSection"
import { SplitFeatureSection } from "@/components/user-page/SplitFeatures"
import LandingPage from "@/components/user-page/landing-main"
import BentoCard from "@/components/user-page/BentoCards"

export default async function UsersPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // NEW: Check if user has completed onboarding
    const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, first_name, last_name")
        .eq("id", user.id)
        .single()

    if (!profile?.onboarding_completed) {
        redirect("/onboarding")
    }

    return (
        <main className="relative flex w-full flex-col items-center bg-black font-sans selection:bg-white/30">
            <FilmGrain />
            <HeroSection />
            {/* <SplitFeatureSection /> */}
            {/* <LandingPage /> */}
            {/* <BentoCard /> */}
        </main>
    )
}





