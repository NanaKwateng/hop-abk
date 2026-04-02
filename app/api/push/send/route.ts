// app/api/push/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import webpush from "web-push";

// Configure VAPID
webpush.setVapidDetails(
    "mailto:your-email@church.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const supabase = createServiceClient();

        const { title, body, url, userIds } = await request.json();

        // Build query
        let query = supabase.from("push_subscriptions").select("*");

        if (userIds && userIds.length > 0) {
            query = query.in("user_id", userIds);
        }

        const { data: subscriptions, error } = await query;
        if (error) throw error;

        const payload = JSON.stringify({ title, body, url });

        // Send to all subscriptions
        const results = await Promise.allSettled(
            (subscriptions ?? []).map((sub) => {
                return webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.keys_p256dh,
                            auth: sub.keys_auth,
                        },
                    },
                    payload
                ).catch(async (err) => {
                    // Remove invalid subscriptions (user uninstalled, etc.)
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        await supabase
                            .from("push_subscriptions")
                            .delete()
                            .eq("endpoint", sub.endpoint);
                    }
                    throw err;
                });
            })
        );

        const sent = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.filter((r) => r.status === "rejected").length;

        return NextResponse.json({ sent, failed });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}





// -- Push notification subscriptions
// CREATE TABLE IF NOT EXISTS push_subscriptions (
//     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//     endpoint TEXT NOT NULL UNIQUE,
//     keys_p256dh TEXT NOT NULL,
//     keys_auth TEXT NOT NULL,
//     created_at TIMESTAMPTZ DEFAULT now(),
//     updated_at TIMESTAMPTZ DEFAULT now()
// );

// -- Index for fast lookups by user
// CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

// -- RLS
// ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

// -- Users can manage their own subscriptions
// CREATE POLICY "Users manage own subscriptions" ON push_subscriptions
//     FOR ALL USING (auth.uid() = user_id);

// -- Service role can access all (for sending)
// CREATE POLICY "Service role full access" ON push_subscriptions
//     FOR ALL USING (auth.role() = 'service_role');


// npm install web-push

// npx web-push generate-vapid-keys