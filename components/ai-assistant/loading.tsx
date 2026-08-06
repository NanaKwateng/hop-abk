// app/admin/ai-assistant/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function Loading() {
    return (
        <div className="relative h-screen w-full mx-auto flex flex-col items-center justify-center overflow-hidden bg-background text-foreground transition-colors duration-300">

            {/* ── BACKGROUND LAYER: Geometric SVG Shards ── */}
            <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-background/60 to-background dark:via-background/80 dark:to-background z-10" />

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 400 400"
                    className="absolute -top-12 -right-12 w-[35vw] max-w-[400px] h-auto opacity-[0.14] dark:opacity-[0.08] rotate-12 transform-gpu"
                >
                    <polygon points="200,0 275,25 240,75" fill="#00b4d8" />
                    <polygon points="275,25 340,10 310,80" fill="#0077b6" />
                    <polygon points="240,75 310,80 260,140" fill="#7209b7" />
                    <polygon points="340,10 400,0 390,60" fill="#d90429" />
                    <polygon points="200,0 240,75 175,55" fill="#ffb703" />
                </svg>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 400 400"
                    className="absolute -bottom-12 -left-12 w-[35vw] max-w-[400px] h-auto opacity-[0.14] dark:opacity-[0.08] -rotate-12 transform-gpu"
                >
                    <polygon points="0,400 90,310 130,390" fill="#fb8500" />
                    <polygon points="90,310 160,280 130,390" fill="#ffb703" />
                    <polygon points="90,310 110,240 160,280" fill="#f72585" />
                    <polygon points="110,240 200,260 160,280" fill="#06d6a0" />
                </svg>
            </div>

            {/* ── LOADING CONTENT LAYER ── */}
            <div className="relative flex flex-col items-center justify-center text-center gap-6 z-10 px-4">

                <figure className="relative w-[180px] h-[180px] md:w-[220px] md:h-[220px] flex items-center justify-center">
                    {/* 
                      IMPORTANT: verify /public/images/server.gif exists with
                      this EXACT case on disk (git is case-sensitive on Vercel's
                      Linux build even if it looked fine on macOS/Windows).
                      Run: git ls-files public/images  → confirm exact filename.
                    */}
                    <Image
                        src="/images/server.gif"
                        alt="Connecting to server"
                        fill
                        sizes="(max-width: 768px) 180px, 220px"
                        className="object-contain"
                        priority
                        unoptimized
                        onError={(e) => {
                            // Surfaces the failure instead of a silent blank box,
                            // and swaps to a safe inline fallback so the UI never breaks.
                            console.error("Failed to load /images/server.gif — check case-sensitivity and that the file is committed.");
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                    />
                </figure>

                <div className="space-y-3 flex flex-col items-center">
                    <figcaption className="text-sm font-medium tracking-wide text-muted-foreground animate-pulse">
                        Connecting to the server, please wait...
                    </figcaption>

                    <div className="flex gap-1 w-24 justify-center">
                        <Skeleton className="h-1.5 w-full rounded-full bg-muted-foreground/20 animate-pulse duration-700" />
                        <Skeleton className="h-1.5 w-full rounded-full bg-muted-foreground/20 animate-pulse duration-1000" />
                        <Skeleton className="h-1.5 w-full rounded-full bg-muted-foreground/20 animate-pulse duration-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}