// actions/sms/get-templates.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import type { SMSTemplate } from "@/lib/types/sms";

export async function getTemplates(
    category?: 'welcome' | 'payment_reminder' | 'event' | 'general' | 'custom'
): Promise<SMSTemplate[]> {
    const supabase = await createClient();

    let query = supabase
        .from("sms_templates")
        .select("*")
        .order("created_at", { ascending: false });

    if (category) {
        query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
        console.error("[Get Templates] Error:", error);
        throw new Error(`Failed to get templates: ${error.message}`);
    }

    return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        subject: row.subject || null,
        message: row.message,
        category: row.category,
        createdAt: row.created_at,
        createdBy: row.created_by,
        isShared: row.is_shared || false,
    }));
}

export async function getTemplate(id: string): Promise<SMSTemplate | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("sms_templates")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("[Get Template] Error:", error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        subject: data.subject || null,
        message: data.message,
        category: data.category,
        createdAt: data.created_at,
        createdBy: data.created_by,
        isShared: data.is_shared || false,
    };
}