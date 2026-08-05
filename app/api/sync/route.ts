// app/api/sync/route.ts

import { NextRequest, NextResponse } from "next/server";
import { syncManager } from "@/lib/offline/sync-manager";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const result = await syncManager.sync();

        return NextResponse.json({
            // FIXED: Removed 'success: true' to avoid property collision
            ...result,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Sync failed",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const status = await syncManager.getSyncStatus();

        return NextResponse.json({
            success: true,
            status,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to get sync status",
            },
            { status: 500 }
        );
    }
}
