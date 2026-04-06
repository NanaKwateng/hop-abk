// actions/task.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSlug, sanitizeSlug } from "@/lib/utils/slug";
import { withActionRetry } from "@/lib/utils/action-resilience";
import type {
    Task,
    TaskWithStats,
    TaskDetail,
    TaskMember,
    TaskActivity,
    CreateTaskPayload,
    CreateActivityPayload,
    UpdateActivityPayload,
    TaskFilters,
} from "@/lib/types/task";

// ── HELPERS ──

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred";
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

// ── MAPPERS ──

function mapTask(t: any): Task {
    return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        purpose: t.purpose,
        description: t.description,
        startDate: t.start_date,
        endDate: t.end_date,
        hasDuration: t.has_duration,
        durationType: t.duration_type,
        status: t.status,
        completionRate: t.completion_rate ?? 0,
        createdBy: t.created_by,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        completedAt: t.completed_at,
    };
}

function mapTaskWithStats(t: any): TaskWithStats {
    return {
        ...mapTask(t),
        memberCount: t.task_members?.[0]?.count ?? 0,
        activityCount: t.task_activities?.[0]?.count ?? 0,
        totalPayments: t.total_payments ?? null,
        daysUntilExpiry: t.days_until_expiry ?? null,
    };
}

function mapTaskMember(m: any): TaskMember {
    return {
        id: m.id,
        taskId: m.task_id,
        memberId: m.member_id,
        firstName: m.members?.first_name ?? "",
        lastName: m.members?.last_name ?? "",
        membershipId: m.members?.membership_id ?? null,
        avatarUrl: m.members?.avatar_url ?? null,
        memberGroup: m.members?.member_group ?? null,
        progress: m.progress ?? 0,
        status: m.status ?? "pending",
        assignedAt: m.assigned_at,
        completedAt: m.completed_at,
    };
}

function mapActivity(a: any): TaskActivity {
    return {
        id: a.id,
        taskId: a.task_id,
        memberId: a.member_id,
        memberFirstName: a.members?.first_name ?? "",
        memberLastName: a.members?.last_name ?? "",
        memberAvatarUrl: a.members?.avatar_url ?? null,
        activityType: a.activity_type,
        title: a.title,
        description: a.description,
        amount: a.amount != null ? Number(a.amount) : null,
        paymentDate: a.payment_date,
        paymentStatus: a.payment_status,
        paymentPeriod: a.payment_period,
        roleTitle: a.role_title,
        roleDescription: a.role_description,
        groupName: a.group_name,
        recordType: a.record_type,
        recordContent: a.record_content,
        monitorNote: a.monitor_note,
        monitorStatus: a.monitor_status,
        metadata: a.metadata,
        attachments: a.attachments,
        createdBy: a.created_by,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
    };
}

// ── READ ACTIONS ──

/**
 * Fetch all tasks with stats and filtering
 */
export async function getTasks(
    filters?: TaskFilters
): Promise<TaskWithStats[]> {
    const { supabase } = await getAuthUser();

    let query = supabase
        .from("tasks")
        .select(
            `
      *,
      task_members(count),
      task_activities(count)
    `
        )
        .order(filters?.sortBy || "created_at", {
            ascending: filters?.sortOrder === "asc",
        });

    // Apply filters
    if (filters?.status) {
        query = query.eq("status", filters.status);
    }
    if (filters?.purpose) {
        query = query.eq("purpose", filters.purpose);
    }
    if (filters?.search) {
        query = query.or(
            `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    // Calculate days until expiry for each task
    const tasksWithStats = (data ?? []).map((t) => {
        let daysUntilExpiry: number | null = null;
        if (t.end_date) {
            const diff = Math.ceil(
                (new Date(t.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            daysUntilExpiry = diff >= 0 ? diff : 0;
        }

        return {
            ...mapTask(t),
            memberCount: t.task_members?.[0]?.count ?? 0,
            activityCount: t.task_activities?.[0]?.count ?? 0,
            totalPayments: null, // Will be calculated if needed
            daysUntilExpiry,
        };
    });

    return tasksWithStats;
}

/**
 * Fetch single task by slug with full details
 */
export async function getTaskBySlug(
    slug: string
): Promise<TaskDetail | null> {
    console.log("========================================");
    console.log("[getTaskBySlug] START");
    console.log("[getTaskBySlug] Input slug:", slug);
    console.log("========================================");

    try {
        const { supabase } = await getAuthUser();
        const cleanSlug = sanitizeSlug(slug);

        console.log("[getTaskBySlug] Sanitized slug:", cleanSlug);

        // Fetch task
        const { data: task, error: taskError } = await supabase
            .from("tasks")
            .select("*")
            .eq("slug", cleanSlug)
            .single();

        console.log("[getTaskBySlug] Query result:", {
            found: !!task,
            error: taskError?.message,
            taskId: task?.id,
        });

        if (taskError || !task) {
            console.error("[getTaskBySlug] ❌ Task not found");
            console.error("[getTaskBySlug] Error:", taskError);
            return null;
        }

        console.log("[getTaskBySlug] ✅ Task found:", task.name);

        // Fetch members
        const { data: taskMembers, error: membersError } = await supabase
            .from("task_members")
            .select(
                `
        id, task_id, member_id, progress, status, assigned_at, completed_at,
        members!inner(id, first_name, last_name, membership_id, avatar_url, member_group)
      `
            )
            .eq("task_id", task.id)
            .order("assigned_at", { ascending: true });

        console.log("[getTaskBySlug] Members found:", taskMembers?.length ?? 0);

        if (membersError) {
            console.error("[getTaskBySlug] Members error:", membersError);
            throw new Error(membersError.message);
        }

        // Fetch activities
        const { data: activities, error: activitiesError } = await supabase
            .from("task_activities")
            .select(
                `
        *,
        members!inner(first_name, last_name, avatar_url)
      `
            )
            .eq("task_id", task.id)
            .order("created_at", { ascending: false });

        console.log("[getTaskBySlug] Activities found:", activities?.length ?? 0);

        if (activitiesError) {
            console.error("[getTaskBySlug] Activities error:", activitiesError);
            throw new Error(activitiesError.message);
        }

        const members = (taskMembers ?? []).map(mapTaskMember);
        const mappedActivities = (activities ?? []).map(mapActivity);

        // Calculate stats
        const completedMembers = members.filter(
            (m) => m.status === "completed"
        ).length;
        const avgProgress =
            members.length > 0
                ? members.reduce((sum, m) => sum + m.progress, 0) / members.length
                : 0;
        const totalPayments = mappedActivities
            .filter((a) => a.activityType === "payment" && a.amount)
            .reduce((sum, a) => sum + (a.amount ?? 0), 0);

        console.log("[getTaskBySlug] ✅ SUCCESS - Returning task detail");
        console.log("========================================");

        return {
            ...mapTask(task),
            members,
            activities: mappedActivities,
            stats: {
                totalMembers: members.length,
                completedMembers,
                avgProgress: Math.round(avgProgress),
                totalActivities: mappedActivities.length,
                totalPayments: totalPayments > 0 ? totalPayments : null,
            },
        };
    } catch (error) {
        console.error("[getTaskBySlug] ❌ EXCEPTION:", error);
        console.log("========================================");
        return null;
    }
}

/**
 * Fetch activities for a specific member in a task
 */
export async function getMemberTaskActivities(
    taskId: string,
    memberId: string
): Promise<TaskActivity[]> {
    const { supabase } = await getAuthUser();

    const { data, error } = await supabase
        .from("task_activities")
        .select(
            `
      *,
      members!inner(first_name, last_name, avatar_url)
    `
        )
        .eq("task_id", taskId)
        .eq("member_id", memberId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapActivity);
}

// ── WRITE ACTIONS ──

/**
 * Create a new task
 */
export async function createTask(
    payload: CreateTaskPayload
): Promise<string> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuthUser();

        // Generate unique slug
        const slug = generateSlug(payload.name);
        const { data: existing } = await supabase
            .from("tasks")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

        // Create task
        const { data: task, error: taskError } = await supabase
            .from("tasks")
            .insert({
                name: payload.name,
                slug: finalSlug,
                purpose: payload.purpose,
                description: payload.description || null,
                start_date: payload.startDate || null,
                end_date: payload.endDate || null,
                has_duration: payload.hasDuration,
                duration_type: payload.durationType || null,
                status: "active",
                created_by: user.id,
            })
            .select("id, slug")
            .single();

        if (taskError) throw new Error(taskError.message);

        // Add members
        if (payload.memberIds.length > 0) {
            const memberRows = payload.memberIds.map((memberId) => ({
                task_id: task.id,
                member_id: memberId,
                status: "pending",
                progress: 0,
            }));

            const { error: membersError } = await supabase
                .from("task_members")
                .insert(memberRows);

            if (membersError) {
                // Rollback task if member insert fails
                await supabase.from("tasks").delete().eq("id", task.id);
                throw new Error(membersError.message);
            }
        }

        revalidatePath("/admin/task");
        return task.slug;
    });
}

/**
 * Update task basic info
 */
export async function updateTask(
    id: string,
    updates: {
        name?: string;
        description?: string;
        status?: "active" | "completed" | "expired" | "archived";
        startDate?: string;
        endDate?: string;
    }
): Promise<Task> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.description !== undefined)
            updateData.description = updates.description;
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.startDate !== undefined)
            updateData.start_date = updates.startDate;
        if (updates.endDate !== undefined) updateData.end_date = updates.endDate;

        // Set completed_at if status is completed
        if (updates.status === "completed") {
            updateData.completed_at = new Date().toISOString();
        }

        const { data: task, error } = await supabase
            .from("tasks")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        revalidatePath("/admin/task");
        return mapTask(task);
    });
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        const { error } = await supabase.from("tasks").delete().eq("id", id);

        if (error) throw new Error(error.message);

        revalidatePath("/admin/task");
    });
}

/**
 * Add members to a task
 */
export async function addTaskMembers(
    taskId: string,
    memberIds: string[]
): Promise<{ added: number }> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        // Check for existing members
        const { data: existing, error: fetchError } = await supabase
            .from("task_members")
            .select("member_id")
            .eq("task_id", taskId);

        if (fetchError) throw new Error(fetchError.message);

        const existingIds = new Set(
            (existing ?? []).map((e: { member_id: string }) => e.member_id)
        );
        const newIds = memberIds.filter((id) => !existingIds.has(id));

        if (newIds.length === 0) return { added: 0 };

        const rows = newIds.map((memberId) => ({
            task_id: taskId,
            member_id: memberId,
            status: "pending",
            progress: 0,
        }));

        const { error } = await supabase.from("task_members").insert(rows);
        if (error) throw new Error(error.message);

        revalidatePath("/admin/task");
        return { added: newIds.length };
    });
}

/**
 * Remove members from a task
 */
export async function removeTaskMembers(
    taskId: string,
    memberIds: string[]
): Promise<{ removed: number }> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        const { error } = await supabase
            .from("task_members")
            .delete()
            .eq("task_id", taskId)
            .in("member_id", memberIds);

        if (error) throw new Error(error.message);

        // Also delete associated activities
        const { error: activityError } = await supabase
            .from("task_activities")
            .delete()
            .eq("task_id", taskId)
            .in("member_id", memberIds);

        if (activityError) {
            console.error("[removeTaskMembers] Activity cleanup failed:", activityError);
        }

        revalidatePath("/admin/task");
        return { removed: memberIds.length };
    });
}

/**
 * Create a task activity
 */
export async function createTaskActivity(
    payload: CreateActivityPayload
): Promise<TaskActivity> {
    return withActionRetry(async () => {
        const { supabase, user } = await getAuthUser();

        const { data: activity, error } = await supabase
            .from("task_activities")
            .insert({
                task_id: payload.taskId,
                member_id: payload.memberId,
                activity_type: payload.activityType,
                title: payload.title,
                description: payload.description || null,
                amount: payload.amount ?? null,
                payment_date: payload.paymentDate || null,
                payment_status: payload.paymentStatus || null,
                payment_period: payload.paymentPeriod || null,
                role_title: payload.roleTitle || null,
                role_description: payload.roleDescription || null,
                group_name: payload.groupName || null,
                record_type: payload.recordType || null,
                record_content: payload.recordContent || null,
                monitor_note: payload.monitorNote || null,
                monitor_status: payload.monitorStatus || null,
                metadata: payload.metadata || null,
                attachments: payload.attachments || null,
                created_by: user.id,
            })
            .select(
                `
        *,
        members!inner(first_name, last_name, avatar_url)
      `
            )
            .single();

        if (error) throw new Error(error.message);

        // Update member progress
        await updateMemberProgress(payload.taskId, payload.memberId);

        revalidatePath("/admin/task");
        return mapActivity(activity);
    });
}

/**
 * Update a task activity
 */
export async function updateTaskActivity(
    payload: UpdateActivityPayload
): Promise<TaskActivity> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (payload.title !== undefined) updateData.title = payload.title;
        if (payload.description !== undefined)
            updateData.description = payload.description;
        if (payload.amount !== undefined) updateData.amount = payload.amount;
        if (payload.paymentDate !== undefined)
            updateData.payment_date = payload.paymentDate;
        if (payload.paymentStatus !== undefined)
            updateData.payment_status = payload.paymentStatus;
        if (payload.paymentPeriod !== undefined)
            updateData.payment_period = payload.paymentPeriod;
        if (payload.roleTitle !== undefined)
            updateData.role_title = payload.roleTitle;
        if (payload.roleDescription !== undefined)
            updateData.role_description = payload.roleDescription;
        if (payload.groupName !== undefined)
            updateData.group_name = payload.groupName;
        if (payload.recordType !== undefined)
            updateData.record_type = payload.recordType;
        if (payload.recordContent !== undefined)
            updateData.record_content = payload.recordContent;
        if (payload.monitorNote !== undefined)
            updateData.monitor_note = payload.monitorNote;
        if (payload.monitorStatus !== undefined)
            updateData.monitor_status = payload.monitorStatus;
        if (payload.metadata !== undefined) updateData.metadata = payload.metadata;

        const { data: activity, error } = await supabase
            .from("task_activities")
            .update(updateData)
            .eq("id", payload.id)
            .eq("task_id", payload.taskId)
            .select(
                `
        *,
        members!inner(first_name, last_name, avatar_url)
      `
            )
            .single();

        if (error) throw new Error(error.message);

        revalidatePath("/admin/task");
        return mapActivity(activity);
    });
}

/**
 * Delete a task activity
 */
export async function deleteTaskActivity(
    activityId: string,
    taskId: string,
    memberId: string
): Promise<void> {
    return withActionRetry(async () => {
        const { supabase } = await getAuthUser();

        const { error } = await supabase
            .from("task_activities")
            .delete()
            .eq("id", activityId)
            .eq("task_id", taskId);

        if (error) throw new Error(error.message);

        // Update member progress
        await updateMemberProgress(taskId, memberId);

        revalidatePath("/admin/task");
    });
}

/**
 * Update member progress based on activities
 */
async function updateMemberProgress(
    taskId: string,
    memberId: string
): Promise<void> {
    const { supabase } = await getAuthUser();

    // Count completed activities
    const { count, error: countError } = await supabase
        .from("task_activities")
        .select("*", { count: "exact", head: true })
        .eq("task_id", taskId)
        .eq("member_id", memberId);

    if (countError) {
        console.error("[updateMemberProgress] Count error:", countError);
        return;
    }

    // Simple progress: if activities > 0, set progress
    const progress = Math.min((count ?? 0) * 20, 100); // 20% per activity, max 100%

    const { error: updateError } = await supabase
        .from("task_members")
        .update({
            progress,
            status: progress >= 100 ? "completed" : progress > 0 ? "in_progress" : "pending",
            completed_at: progress >= 100 ? new Date().toISOString() : null,
        })
        .eq("task_id", taskId)
        .eq("member_id", memberId);

    if (updateError) {
        console.error("[updateMemberProgress] Update error:", updateError);
    }

    // Update task completion rate
    await updateTaskCompletionRate(taskId);
}

/**
 * Update overall task completion rate
 */
async function updateTaskCompletionRate(taskId: string): Promise<void> {
    const { supabase } = await getAuthUser();

    const { data: members, error } = await supabase
        .from("task_members")
        .select("progress")
        .eq("task_id", taskId);

    if (error || !members || members.length === 0) return;

    const avgProgress =
        members.reduce((sum, m) => sum + (m.progress ?? 0), 0) / members.length;

    await supabase
        .from("tasks")
        .update({ completion_rate: Math.round(avgProgress) })
        .eq("id", taskId);
}

/**
 * Fetch tasks for export (with all data)
 */
export async function getTasksForExport(
    taskId: string
): Promise<TaskActivity[]> {
    const { supabase } = await getAuthUser();

    const { data, error } = await supabase
        .from("task_activities")
        .select(
            `
      *,
      members!inner(first_name, last_name, membership_id, avatar_url)
    `
        )
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapActivity);
}