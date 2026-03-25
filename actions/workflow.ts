// actions/workflow.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSlug, sanitizeSlug } from "@/lib/utils/slug";
import { withActionRetry } from "@/lib/utils/action-resilience"; // ✅ Queue helper added
import type {
    Workflow,
    WorkflowDetail,
    WorkflowEntry,
    CreateWorkflowPayload,
    CreateWorkflowEntryPayload,
    UpdateWorkflowEntryPayload
} from "@/lib/types/workflow";

// ── HELPERS ──
function mapWorkflow(w: any): Workflow {
    return {
        id: w.id, slug: w.slug, name: w.name, type: w.type, startDate: w.start_date, endDate: w.end_date,
        memberCount: w.workflow_members?.[0]?.count ?? 0, createdBy: w.created_by, createdAt: w.created_at, updatedAt: w.updated_at,
    };
}

function mapEntry(e: any): WorkflowEntry {
    return {
        id: e.id, workflowId: e.workflow_id, memberId: e.member_id, memberFirstName: e.members?.first_name ?? "", memberLastName: e.members?.last_name ?? "",
        title: e.title, description: e.description, amount: e.amount != null ? Number(e.amount) : null,
        roleTitle: e.role_title, roleDescription: e.role_description, entryType: e.entry_type ?? "record",
        paymentDate: e.payment_date, status: e.status ?? "pending", createdBy: e.created_by, createdAt: e.created_at, updatedAt: e.updated_at,
    };
}

async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Unauthorized");
    return { supabase, user };
}

// ── READ ACTIONS ──
export async function getWorkflows(): Promise<Workflow[]> {
    const { supabase } = await getAuthUser();
    const { data, error } = await supabase.from("workflows").select(`id, slug, name, type, start_date, end_date, created_by, created_at, updated_at, workflow_members(count)`).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapWorkflow);
}

export async function getWorkflowBySlug(slug: string): Promise<WorkflowDetail | null> {
    const { supabase } = await getAuthUser();
    const cleanSlug = sanitizeSlug(slug);

    const { data: workflow, error: wfError } = await supabase.from("workflows").select("*").eq("slug", cleanSlug).single();
    if (wfError || !workflow) return null;

    const { data: workflowMembers, error: mErr } = await supabase.from("workflow_members").select(`id, workflow_id, member_id, created_at, members!inner(id, first_name, last_name, membership_id, avatar_url, member_group)`).eq("workflow_id", workflow.id).order("created_at", { ascending: true });
    if (mErr) throw new Error(mErr.message);

    const { data: entries, error: eErr } = await supabase.from("workflow_entries").select(`id, workflow_id, member_id, title, description, amount, role_title, role_description, entry_type, payment_date, status, created_by, created_at, updated_at, members!inner(first_name, last_name)`).eq("workflow_id", workflow.id).order("created_at", { ascending: false });
    if (eErr) throw new Error(eErr.message);

    const members = (workflowMembers ?? []).map((wm: any) => ({
        id: wm.id, workflowId: wm.workflow_id, memberId: wm.member_id, firstName: wm.members.first_name, lastName: wm.members.last_name,
        membershipId: wm.members.membership_id, avatarUrl: wm.members.avatar_url, memberGroup: wm.members.member_group, createdAt: wm.created_at,
    }));

    return {
        id: workflow.id, slug: workflow.slug, name: workflow.name, type: workflow.type, startDate: workflow.start_date, endDate: workflow.end_date,
        memberCount: members.length, createdBy: workflow.created_by, createdAt: workflow.created_at, updatedAt: workflow.updated_at,
        members, entries: (entries ?? []).map(mapEntry),
    };
}

export async function getMemberWorkflowEntries(
    workflowId: string,
    memberId: string
): Promise<WorkflowEntry[]> {
    const { supabase } = await getAuthUser();

    const { data, error } = await supabase
        .from("workflow_entries")
        .select(
            `
      id, workflow_id, member_id, title, description, amount,
      role_title, role_description, entry_type, payment_date,
      status, created_by, created_at, updated_at,
      members!inner(first_name, last_name)
    `
        )
        .eq("workflow_id", workflowId)
        .eq("member_id", memberId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map(mapEntry);
}

// ✅ WRAPPED WRITE ACTIONS
export async function createWorkflow(payload: CreateWorkflowPayload): Promise<string> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuthUser();
        const slug = generateSlug(payload.name);
        const { data: existing } = await supabase.from("workflows").select("id").eq("slug", slug).maybeSingle();
        const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

        const { data: workflow, error: wfError } = await supabase.from("workflows")
            .insert({ name: payload.name, slug: finalSlug, type: payload.type, start_date: payload.startDate, end_date: payload.endDate, created_by: user.id })
            .select("id, slug").single();

        if (wfError) throw new Error(wfError.message);

        if (payload.memberIds.length > 0) {
            const memberRows = payload.memberIds.map((memberId) => ({ workflow_id: workflow.id, member_id: memberId }));
            const { error: membersError } = await supabase.from("workflow_members").insert(memberRows);
            if (membersError) {
                await supabase.from("workflows").delete().eq("id", workflow.id); // rollback
                throw new Error(membersError.message);
            }
        }
        revalidatePath("/admin/workflows");
        return workflow.slug;
    });
}

export async function deleteWorkflow(id: string): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();
        const { error } = await supabase.from("workflows").delete().eq("id", id);
        if (error) throw new Error(error.message);
        revalidatePath("/admin/workflows");
    });
}

export async function createWorkflowEntry(payload: CreateWorkflowEntryPayload): Promise<WorkflowEntry> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuthUser();
        const { data: entry, error } = await supabase.from("workflow_entries").insert({
            workflow_id: payload.workflowId, member_id: payload.memberId, title: payload.title, description: payload.description || null,
            amount: payload.amount ?? null, role_title: payload.roleTitle || null, role_description: payload.roleDescription || null,
            entry_type: payload.entryType, payment_date: payload.paymentDate || null, status: payload.status || "pending", created_by: user.id,
        }).select(`id, workflow_id, member_id, title, description, amount, role_title, role_description, entry_type, payment_date, status, created_by, created_at, updated_at, members!inner(first_name, last_name)`).single();

        if (error) throw new Error(error.message);
        revalidatePath("/admin/workflows");
        return mapEntry(entry);
    });
}

export async function updateWorkflowEntry(payload: UpdateWorkflowEntryPayload): Promise<WorkflowEntry> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();
        const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
        if (payload.title !== undefined) updateData.title = payload.title;
        if (payload.description !== undefined) updateData.description = payload.description;
        if (payload.amount !== undefined) updateData.amount = payload.amount;
        if (payload.roleTitle !== undefined) updateData.role_title = payload.roleTitle;
        if (payload.roleDescription !== undefined) updateData.role_description = payload.roleDescription;
        if (payload.paymentDate !== undefined) updateData.payment_date = payload.paymentDate;
        if (payload.status !== undefined) updateData.status = payload.status;

        const { data: entry, error } = await supabase.from("workflow_entries").update(updateData).eq("id", payload.id).eq("workflow_id", payload.workflowId)
            .select(`id, workflow_id, member_id, title, description, amount, role_title, role_description, entry_type, payment_date, status, created_by, created_at, updated_at, members!inner(first_name, last_name)`).single();

        if (error) throw new Error(error.message);
        revalidatePath("/admin/workflows");
        return mapEntry(entry);
    });
}

export async function deleteWorkflowEntry(entryId: string, workflowId: string): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();
        const { error } = await supabase.from("workflow_entries").delete().eq("id", entryId).eq("workflow_id", workflowId);
        if (error) throw new Error(error.message);
        revalidatePath("/admin/workflows");
    });
}