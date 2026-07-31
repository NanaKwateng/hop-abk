// app/nicknames/page.tsx
import { Suspense } from "react";
import { NicknameList } from "@/components/nicknames/nickname-list";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Nicknames Directory",
    description: "Search members by nickname and manage their assigned aliases.",
};

export default function NicknamesPage() {
    return (
        /* Overhauled Background: Deep solid dark base layout node optimizing high vibrance contrast ratios */
        <div className="w-full min-h-screen bg-[#0a0a0c] p-6 md:p-12 text-white antialiased selection:bg-indigo-600/30">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">

                {/* Left Top Hero Brand Lockup Section */}
                <div className="max-w-2xl space-y-3 pt-4">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-tight">
                        Achieve <br className="hidden sm:inline" />Your Goals
                    </h1>
                    <p className="text-base md:text-lg font-medium text-neutral-400 tracking-tight leading-relaxed max-w-md">
                        Supercharge your fitness, weight, steps, focus, and healthy routines.
                    </p>
                </div>

                {/* Main Dashboard Layout Area */}
                <div className="relative min-h-[500px] mt-2">
                    <Suspense
                        fallback={
                            <div className="flex h-[400px] w-full items-center justify-center text-sm font-semibold text-neutral-500 animate-pulse">
                                Initializing network directories...
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
