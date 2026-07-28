// actions/sms/save-template.ts

"use server";

import { createClient } from "@/lib/supabase/server";
import { templateSchema } from "@/lib/validations/sms";
import { revalidatePath } from "next/cache";
import type { SMSTemplate, TemplateInput } from "@/lib/types/sms";

export async function saveTemplate(input: TemplateInput & { id?: string }): Promise<SMSTemplate> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // Validate input
    const validated = templateSchema.parse(input);

    const templateData = {
        name: validated.name,
        subject: validated.subject || null,
        message: validated.message,
        category: validated.category,
        is_shared: validated.isShared || false,
        created_by: user.id,
    };

    let result;

    if (input.id) {
        // Update existing template
        result = await supabase
            .from("sms_templates")
            .update(templateData)
            .eq("id", input.id)
            .eq("created_by", user.id) // Only allow update if owned
            .select()
            .single();
    } else {
        // Create new template
        result = await supabase
            .from("sms_templates")
            .insert(templateData)
            .select()
            .single();
    }

    if (result.error) {
        console.error("[Save Template] Error:", result.error);
        throw new Error(`Failed to save template: ${result.error.message}`);
    }

    revalidatePath("/admin/sms");

    return {
        id: result.data.id,
        name: result.data.name,
        subject: result.data.subject || null,
        message: result.data.message,
        category: result.data.category,
        createdAt: result.data.created_at,
        createdBy: result.data.created_by,
        isShared: result.data.is_shared || false,
    };
}

export async function deleteTemplate(id: string): Promise<void> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from("sms_templates")
        .delete()
        .eq("id", id)
        .eq("created_by", user.id);

    if (error) {
        console.error("[Delete Template] Error:", error);
        throw new Error(`Failed to delete template: ${error.message}`);
    }

    revalidatePath("/admin/sms");
}