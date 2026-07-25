import { Suspense } from "react";
import { NicknameList } from "@/components/nicknames/nickname-list";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Nicknames Studio",
    description: "Search members by nickname with fluid glass interactions.",
};

export default function NicknamesPage() {
    return (
        <main className="relative min-h-[85vh] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-10 text-slate-100 shadow-2xl backdrop-blur-3xl selection:bg-indigo-500 selection:text-white">
            {/* Ambient background glow accents (Gemini style) */}
            <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-600/15 blur-[120px]" />

            <Suspense
                fallback={
                    <div className="flex h-[400px] items-center justify-center text-sm font-medium text-slate-400 animate-pulse">
                        Initializing Liquid Interface...
                    </div>
                }
            >
                <NicknameList />
            </Suspense>
        </main>
    );
}