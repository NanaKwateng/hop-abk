"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSlug, sanitizeSlug } from "@/lib/utils/slug";
import { withActionRetry } from "@/lib/utils/action-resilience";
import type {
    Workflow,
    WorkflowDetail,
    WorkflowEntry,
    CreateWorkflowPayload,
    CreateWorkflowEntryPayload,
    UpdateWorkflowEntryPayload,
} from "@/lib/types/workflow";

// ── HELPERS ──

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred";
}

function mapWorkflow(w: any): Workflow {
    return {
        id: w.id,
        slug: w.slug,
        name: w.name,
        type: w.type,
        startDate: w.start_date,
        endDate: w.end_date,
        memberCount: w.workflow_members?.[0]?.count ?? 0,
        createdBy: w.created_by,
        createdAt: w.created_at,
        updatedAt: w.updated_at,
    };
}

function mapEntry(e: any): WorkflowEntry {
    return {
        id: e.id,
        workflowId: e.workflow_id,
        memberId: e.member_id,
        memberFirstName: e.members?.first_name ?? "",
        memberLastName: e.members?.last_name ?? "",
        memberAvatarUrl: e.members?.avatar_url ?? null,
        title: e.title,
        description: e.description,
        amount: e.amount != null ? Number(e.amount) : null,
        roleTitle: e.role_title,
        roleDescription: e.role_description,
        entryType: e.entry_type ?? "record",
        paymentDate: e.payment_date,
        status: e.status ?? "pending",
        createdBy: e.created_by,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
    };
}

async function getAuthUser() {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Unauthorized");
    return { supabase, user };
}

// ── ENTRY SELECT FRAGMENT ──
// Single source of truth for the entry select query
const ENTRY_SELECT = `
    id, workflow_id, member_id, title, description, amount,
    role_title, role_description, entry_type, payment_date,
    status, created_by, created_at, updated_at,
    members!inner(first_name, last_name, avatar_url)
` as const;

// ── READ ACTIONS ──

export async function getWorkflows(): Promise<Workflow[]> {
    const { supabase } = await getAuthUser();
    const { data, error } = await supabase
        .from("workflows")
        .select(
            `id, slug, name, type, start_date, end_date,
             created_by, created_at, updated_at,
             workflow_members(count)`
        )
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapWorkflow);
}

// actions/workflow.ts - Updated getWorkflowBySlug with extensive logging

export async function getWorkflowBySlug(slug: string): Promise<WorkflowDetail | null> {
    console.log("========================================");
    console.log("[getWorkflowBySlug] START");
    console.log("[getWorkflowBySlug] Input slug:", slug);
    console.log("========================================");

    try {
        const { supabase } = await getAuthUser();
        const cleanSlug = sanitizeSlug(slug);

        console.log("[getWorkflowBySlug] Sanitized slug:", cleanSlug);

        // Query workflow
        const { data: workflow, error: wfError } = await supabase
            .from("workflows")
            .select("*")
            .eq("slug", cleanSlug)
            .single();

        console.log("[getWorkflowBySlug] Query result:", {
            found: !!workflow,
            error: wfError?.message,
            workflowId: workflow?.id,
        });

        if (wfError || !workflow) {
            console.error("[getWorkflowBySlug] ❌ Workflow not found");
            console.error("[getWorkflowBySlug] Error:", wfError);
            return null;
        }

        console.log("[getWorkflowBySlug] ✅ Workflow found:", workflow.name);

        // Query members
        const { data: workflowMembers, error: mErr } = await supabase
            .from("workflow_members")
            .select(`
                id, workflow_id, member_id, created_at,
                members!inner(id, first_name, last_name, membership_id, avatar_url, member_group)
            `)
            .eq("workflow_id", workflow.id)
            .order("created_at", { ascending: true });

        console.log("[getWorkflowBySlug] Members found:", workflowMembers?.length ?? 0);

        if (mErr) {
            console.error("[getWorkflowBySlug] Members error:", mErr);
            throw new Error(mErr.message);
        }

        // Query entries
        const { data: entries, error: eErr } = await supabase
            .from("workflow_entries")
            .select(`
                id, workflow_id, member_id, title, description, amount, 
                role_title, role_description, entry_type, payment_date, 
                status, created_by, created_at, updated_at,
                members!inner(first_name, last_name, avatar_url)
            `)
            .eq("workflow_id", workflow.id)
            .order("created_at", { ascending: false });

        console.log("[getWorkflowBySlug] Entries found:", entries?.length ?? 0);

        if (eErr) {
            console.error("[getWorkflowBySlug] Entries error:", eErr);
            throw new Error(eErr.message);
        }

        const members = (workflowMembers ?? []).map((wm: any) => ({
            id: wm.id,
            workflowId: wm.workflow_id,
            memberId: wm.member_id,
            firstName: wm.members.first_name,
            lastName: wm.members.last_name,
            membershipId: wm.members.membership_id,
            avatarUrl: wm.members.avatar_url,
            memberGroup: wm.members.member_group,
            createdAt: wm.created_at,
        }));

        console.log("[getWorkflowBySlug] ✅ SUCCESS - Returning workflow detail");
        console.log("========================================");

        return {
            id: workflow.id,
            slug: workflow.slug,
            name: workflow.name,
            type: workflow.type,
            startDate: workflow.start_date,
            endDate: workflow.end_date,
            memberCount: members.length,
            createdBy: workflow.created_by,
            createdAt: workflow.created_at,
            updatedAt: workflow.updated_at,
            members,
            entries: (entries ?? []).map(mapEntry),
        };
    } catch (error) {
        console.error("[getWorkflowBySlug] ❌ EXCEPTION:", error);
        console.log("========================================");
        return null;
    }
}

export async function getMemberWorkflowEntries(
    workflowId: string,
    memberId: string
): Promise<WorkflowEntry[]> {
    const { supabase } = await getAuthUser();
    const { data, error } = await supabase
        .from("workflow_entries")
        .select(ENTRY_SELECT)
        .eq("workflow_id", workflowId)
        .eq("member_id", memberId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapEntry);
}

// ── WRITE ACTIONS ──

export async function createWorkflow(
    payload: CreateWorkflowPayload
): Promise<string> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuthUser();

        // ✅ Fixed: generateSlug already appends a random suffix internally,
        // so we only need a collision fallback, not an additional suffix layer.
        const slug = generateSlug(payload.name);
        const { data: existing } = await supabase
            .from("workflows")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        // Only append extra suffix if there is a true collision (extremely rare)
        const finalSlug = existing
            ? `${slug}-${Date.now().toString(36)}`
            : slug;

        const { data: workflow, error: wfError } = await supabase
            .from("workflows")
            .insert({
                name: payload.name,
                slug: finalSlug,
                type: payload.type,
                start_date: payload.startDate,
                end_date: payload.endDate,
                created_by: user.id,
            })
            .select("id, slug")
            .single();

        if (wfError) throw new Error(wfError.message);

        if (payload.memberIds.length > 0) {
            const memberRows = payload.memberIds.map((memberId) => ({
                workflow_id: workflow.id,
                member_id: memberId,
            }));
            const { error: membersError } = await supabase
                .from("workflow_members")
                .insert(memberRows);

            if (membersError) {
                // Rollback the workflow if member insert fails
                await supabase.from("workflows").delete().eq("id", workflow.id);
                throw new Error(membersError.message);
            }
        }

        revalidatePath("/admin/workflow");
        return workflow.slug;
    });
}

export async function deleteWorkflow(id: string): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();
        const { error } = await supabase
            .from("workflows")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);

        // ✅ Fixed: was "/admin/workflows" (plural)
        revalidatePath("/admin/workflow");
    });
}

export async function addWorkflowMembers(
    workflowId: string,
    memberIds: string[]
): Promise<{ added: number }> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        // Deduplicate against existing members server-side
        const { data: existing, error: fetchError } = await supabase
            .from("workflow_members")
            .select("member_id")
            .eq("workflow_id", workflowId);

        if (fetchError) throw new Error(fetchError.message);

        const existingIds = new Set(
            (existing ?? []).map((e: { member_id: string }) => e.member_id)
        );
        const newIds = memberIds.filter((id) => !existingIds.has(id));

        if (newIds.length === 0) return { added: 0 };

        const rows = newIds.map((memberId) => ({
            workflow_id: workflowId,
            member_id: memberId,
        }));

        const { error } = await supabase.from("workflow_members").insert(rows);
        if (error) throw new Error(error.message);

        // ✅ Fixed: was "/admin/workflows" (plural)
        revalidatePath("/admin/workflow");
        return { added: newIds.length };
    });
}

export async function removeWorkflowMembers(
    workflowId: string,
    memberIds: string[]
): Promise<{ removed: number }> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        const { error } = await supabase
            .from("workflow_members")
            .delete()
            .eq("workflow_id", workflowId)
            .in("member_id", memberIds);

        if (error) throw new Error(error.message);

        // Clean up entries — log but don't throw, member removal already succeeded
        const { error: entryError } = await supabase
            .from("workflow_entries")
            .delete()
            .eq("workflow_id", workflowId)
            .in("member_id", memberIds);

        if (entryError) {
            console.error(
                "[removeWorkflowMembers] Entry cleanup failed:",
                entryError
            );
        }

        // ✅ Fixed: was "/admin/workflows" (plural)
        revalidatePath("/admin/workflow");
        return { removed: memberIds.length };
    });
}

export async function createWorkflowEntry(
    payload: CreateWorkflowEntryPayload
): Promise<WorkflowEntry> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuthUser();
        const { data: entry, error } = await supabase
            .from("workflow_entries")
            .insert({
                workflow_id: payload.workflowId,
                member_id: payload.memberId,
                title: payload.title,
                description: payload.description || null,
                amount: payload.amount ?? null,
                role_title: payload.roleTitle || null,
                role_description: payload.roleDescription || null,
                entry_type: payload.entryType,
                payment_date: payload.paymentDate || null,
                status: payload.status || "completed",
                created_by: user.id,
            })
            .select(ENTRY_SELECT)
            .single();

        if (error) throw new Error(error.message);
        revalidatePath("/admin/workflow");
        return mapEntry(entry);
    });
}

export async function updateWorkflowEntry(
    payload: UpdateWorkflowEntryPayload
): Promise<WorkflowEntry> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        // Build update object only from defined fields
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };
        if (payload.title !== undefined) updateData.title = payload.title;
        if (payload.description !== undefined)
            updateData.description = payload.description;
        if (payload.amount !== undefined) updateData.amount = payload.amount;
        if (payload.roleTitle !== undefined)
            updateData.role_title = payload.roleTitle;
        if (payload.roleDescription !== undefined)
            updateData.role_description = payload.roleDescription;
        if (payload.paymentDate !== undefined)
            updateData.payment_date = payload.paymentDate;
        if (payload.status !== undefined) updateData.status = payload.status;

        const { data: entry, error } = await supabase
            .from("workflow_entries")
            .update(updateData)
            .eq("id", payload.id)
            .eq("workflow_id", payload.workflowId)
            .select(ENTRY_SELECT)
            .single();

        if (error) throw new Error(error.message);
        revalidatePath("/admin/workflow");
        return mapEntry(entry);
    });
}

export async function deleteWorkflowEntry(
    entryId: string,
    workflowId: string
): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();
        const { error } = await supabase
            .from("workflow_entries")
            .delete()
            .eq("id", entryId)
            .eq("workflow_id", workflowId);

        if (error) throw new Error(error.message);
        revalidatePath("/admin/workflow");
    });
}