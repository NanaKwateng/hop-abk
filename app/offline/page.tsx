// app/offline/page.tsx
"use client"
import { IoCloudOfflineOutline, IoRefreshOutline } from "react-icons/io5";


export default function OfflinePage() {
    return (
        <div className="min-h-[100dvh] bg-background flex items-center justify-center px-6">
            <div className="text-center max-w-sm space-y-4">
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center">
                        <IoCloudOfflineOutline className="h-8 w-8 text-muted-foreground" />
                    </div>
                </div>
                <h1 className="text-xl font-bold tracking-tight">You're Offline</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    It looks like you've lost your internet connection. Check your
                    connection and try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
                >
                    <IoRefreshOutline className="h-4 w-4" />
                    Try Again
                </button>
            </div>
        </div>
    );
}