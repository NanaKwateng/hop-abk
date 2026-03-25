import { createClient } from "@/lib/supabase/server"

export async function logAudit({
    userId,
    action,
    entity,
    entityId,
    metadata
}: {
    userId: string
    action: string
    entity: string
    entityId?: string
    metadata?: any
}) {
    // FIX: Add 'await' before createClient()
    const supabase = await createClient()

    // Now .from is accessible
    const { error } = await supabase.from("audit_logs").insert({
        user_id: userId,
        action,
        entity,
        entity_id: entityId,
        metadata
    })

    if (error) {
        console.error("Audit Logging Failed:", error.message)
    }
}
