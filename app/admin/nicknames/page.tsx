import { Suspense } from "react";
import { NicknameList } from "@/components/nicknames/nickname-list";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Nicknames Directory",
    description: "Search members by nickname and manage their assigned aliases.",
};

export default function NicknamesPage() {
    return (
        // Clean background supporting light/dark, minimal layout constraints
        <div className="w-full min-h-[calc(100vh-80px)] p-6 md:p-10 text-slate-900 dark:text-slate-100 selection:bg-indigo-200 dark:selection:bg-indigo-800">
            <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-[2fr,1fr] xl:gap-16">

                {/* Left Section: Context & Constraints (Static) */}
                <div className="space-y-10 md:sticky md:top-24 md:self-start">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            Member <span className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">Nicknames</span>
                        </h1>
                        <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl">
                            Search for registered alias tags across your network, view details, and manage assigned nicknames in real-time.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 space-y-4 shadow-inner">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Constraint Guidelines</h3>
                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <p>• Each nickname must be <strong className="text-slate-800 dark:text-slate-200">unique</strong> across all members.</p>
                            <p>• Nicknames can be 2-50 characters long.</p>
                            <p>• Allowed: letters, numbers, spaces, hyphens, and underscores.</p>
                            <p>• Dynamic lookup updates instantly with real-time feedback.</p>
                        </div>
                    </div>
                </div>

                {/* Right Section: Interactive Area (Dynamic) */}
                <div className="relative min-h-[400px]">
                    {/* Subtle halo glow localized in the right area */}
                    <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] opacity-70" />

                    <Suspense
                        fallback={
                            <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400 animate-pulse">
                                Initializing search engine...
                            </div>
                        }
                    >
                        <NicknameList />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}