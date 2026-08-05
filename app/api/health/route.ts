// app/api/health/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const start = Date.now();
    const checks: any = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: { status: "unhealthy", latency: 0 },
            memory: {
                used: process.memoryUsage().heapUsed,
                total: process.memoryUsage().heapTotal,
                percentage: ((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(2),
            },
        },
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
    };

    // Check database
    try {
        const dbStart = Date.now();
        const supabase = await createClient();
        const { error } = await supabase.from("members").select("count", { count: "exact", head: true });
        checks.services.database.latency = Date.now() - dbStart;
        checks.services.database.status = error ? "unhealthy" : "healthy";
        if (error) checks.status = "unhealthy";
    } catch (error) {
        checks.services.database.status = "unhealthy";
        checks.status = "unhealthy";
    }

    const statusCode = checks.status === "healthy" ? 200 : 503;

    return NextResponse.json(checks, {
        status: statusCode,
        headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    });
}


//offline status