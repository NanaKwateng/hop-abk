// actions/admin-settings.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";
import type {
    AdminProfile,
    AdminInvite,
    AuditLogEntry,
    ImpersonationLogEntry,
} from "@/lib/types/admin-settings";

const MAX_ADMINS = 4;

// ── Auth helper ──
// NOTE: We only use the user-scoped `supabase` for auth.getUser().
// ALL database operations use `serviceClient` to bypass RLS,
// since admins need to read/write other users' profiles.

async function getAdminAuth() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // ✅ FIX: Use serviceClient to read own profile too,
    // in case RLS policies cause issues with the select
    const serviceClient = createServiceClient();

    const { data: profile } = await serviceClient
        .from("profiles")
        .select("role, is_primary_admin")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        throw new Error("Admin access required");
    }

    return {
        supabase,
        serviceClient,
        user,
        isPrimary: profile.is_primary_admin === true,
    };
}

// ✅ FIX: writeAuditLog now uses serviceClient to bypass RLS.
// Previously it used the user-scoped client, which could silently
// fail if RLS on audit_logs restricts inserts.
async function writeAuditLog(
    serviceClient: any,
    userId: string,
    action: string,
    entity?: string,
    entityId?: string,
    metadata?: Record<string, any>
) {
    const { error } = await serviceClient.from("audit_logs").insert({
        user_id: userId,
        action,
        entity: entity ?? null,
        entity_id: entityId ?? null,
        metadata: metadata ?? null,
    });

    if (error) {
        // Don't throw — audit log failure shouldn't break the main operation
        console.error("[AUDIT LOG] Failed to write:", error.message);
    }
}

// ══════════════════════════════════════════════════════════
// FETCH — All admins + pending invites
// ══════════════════════════════════════════════════════════

export async function fetchAdmins(): Promise<{
    admins: AdminProfile[];
    invites: AdminInvite[];
    currentUserId: string;
    isPrimaryAdmin: boolean;
}> {
    const { serviceClient, user, isPrimary } = await getAdminAuth();

    // ✅ FIX: Use serviceClient instead of supabase (user-scoped).
    // The user-scoped client only returns the current user's own row
    // because of the RLS policy: "Users can view own profile" (SELECT, authenticated).
    // This was the ROOT CAUSE of only one admin showing in the UI.
    const { data: adminProfiles, error: pErr } = await serviceClient
        .from("profiles")
        .select("*")
        .eq("role", "admin")
        .order("created_at", { ascending: true });

    if (pErr) throw new Error(pErr.message);

    // ── Match with members table for extra info ──
    const adminEmails = (adminProfiles ?? [])
        .map((p: any) => p.email)
        .filter(Boolean);

    let memberMap = new Map<string, any>();
    if (adminEmails.length > 0) {
        const { data: members } = await serviceClient
            .from("members")
            .select("email, membership_id, member_group, member_position")
            .in("email", adminEmails);

        for (const m of members ?? []) {
            if (m.email) memberMap.set(m.email.toLowerCase(), m);
        }
    }

    const admins: AdminProfile[] = (adminProfiles ?? []).map((p: any) => {
        const linked = p.email ? memberMap.get(p.email.toLowerCase()) : null;
        return {
            id: p.id,
            email: p.email ?? "",
            firstName: p.first_name,
            lastName: p.last_name,
            avatarUrl: p.avatar_url,
            role: p.role,
            isPrimaryAdmin: p.is_primary_admin === true,
            createdAt: p.created_at,
            membershipId: linked?.membership_id ?? null,
            memberGroup: linked?.member_group ?? null,
            memberPosition: linked?.member_position ?? null,
        };
    });

    // ✅ FIX: Use serviceClient for invites too
    const { data: rawInvites } = await serviceClient
        .from("admin_invites")
        .select("*")
        .order("created_at", { ascending: false });

    const invites: AdminInvite[] = (rawInvites ?? []).map((inv: any) => ({
        id: inv.id,
        email: inv.email,
        firstName: inv.first_name,
        lastName: inv.last_name,
        membershipId: inv.membership_id,
        invitedBy: inv.invited_by,
        createdAt: inv.created_at,
    }));

    return {
        admins,
        invites,
        currentUserId: user.id,
        isPrimaryAdmin: isPrimary,
    };
}

// ══════════════════════════════════════════════════════════
// ADD ADMIN — From members table
// ══════════════════════════════════════════════════════════

export async function addAdminFromMember(memberId: string): Promise<void> {
    const { serviceClient, user, isPrimary } = await getAdminAuth();

    console.log("[ADMIN] Adding admin from member:", memberId);

    // ── Step 1: Get the member's full data ──
    const { data: member, error: mErr } = await serviceClient
        .from("members")
        .select(
            "id, first_name, last_name, email, avatar_url, membership_id, member_group, member_position"
        )
        .eq("id", memberId)
        .single();

    if (mErr || !member) {
        throw new Error("Member not found.");
    }

    if (!member.email || !member.email.trim()) {
        throw new Error(
            "This member has no email address. An email is required for admin access."
        );
    }

    const email = member.email.toLowerCase().trim();

    console.log("[ADMIN] Member found:", member.first_name, member.last_name, email);

    // ── Step 2: Check admin count ──
    // ✅ FIX: Use serviceClient to get accurate count of ALL admins
    const { count: adminCount } = await serviceClient
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

    if ((adminCount ?? 0) >= MAX_ADMINS) {
        throw new Error(
            `Maximum ${MAX_ADMINS} admins allowed. Remove an admin first.`
        );
    }

    // ── Step 3: Check if already an admin ──
    const { data: existingProfile } = await serviceClient
        .from("profiles")
        .select("id, role, email")
        .eq("email", email)
        .maybeSingle();

    if (existingProfile?.role === "admin") {
        throw new Error(
            `${member.first_name} ${member.last_name} is already an admin.`
        );
    }

    // ── Step 4A: User exists in profiles → promote to admin ──
    if (existingProfile) {
        console.log("[ADMIN] Promoting existing user:", existingProfile.id);

        const { error: updateErr } = await serviceClient
            .from("profiles")
            .update({
                role: "admin",
                first_name: member.first_name,
                last_name: member.last_name,
                avatar_url: member.avatar_url,
            })
            .eq("id", existingProfile.id);

        if (updateErr) throw new Error(updateErr.message);

        await writeAuditLog(
            serviceClient,
            user.id,
            "admin_added",
            "profiles",
            existingProfile.id,
            {
                email,
                member_id: memberId,
                method: "promoted_existing_user",
            }
        );

        console.log("[ADMIN] User promoted to admin successfully");
    } else {
        // ── Step 4B: User hasn't signed up → create auth user + profile ──
        console.log("[ADMIN] Creating new auth user for:", email);

        const { data: newUser, error: createErr } =
            await serviceClient.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata: {
                    firstName: member.first_name,
                    lastName: member.last_name,
                },
            });

        if (createErr) {
            console.error("[ADMIN] Create user error:", createErr.message);

            // If user already exists in auth but not in profiles
            if (createErr.message.includes("already been registered")) {
                const { data: authUsers } =
                    await serviceClient.auth.admin.listUsers();

                const existingAuth = authUsers?.users?.find(
                    (u) => u.email?.toLowerCase() === email
                );

                if (existingAuth) {
                    await serviceClient.from("profiles").upsert(
                        {
                            id: existingAuth.id,
                            email,
                            role: "admin",
                            first_name: member.first_name,
                            last_name: member.last_name,
                            avatar_url: member.avatar_url,
                        },
                        { onConflict: "id" }
                    );

                    await writeAuditLog(
                        serviceClient,
                        user.id,
                        "admin_added",
                        "profiles",
                        existingAuth.id,
                        {
                            email,
                            member_id: memberId,
                            method: "promoted_existing_auth_user",
                        }
                    );

                    revalidatePath("/admin/settings");
                    return;
                }
            }

            throw new Error(
                `Failed to create admin account: ${createErr.message}`
            );
        }

        console.log("[ADMIN] Auth user created:", newUser.user.id);

        // ── Create profile ──
        const { error: profileErr } = await serviceClient
            .from("profiles")
            .insert({
                id: newUser.user.id,
                email,
                role: "admin",
                first_name: member.first_name,
                last_name: member.last_name,
                avatar_url: member.avatar_url,
            });

        if (profileErr) {
            console.error("[ADMIN] Profile creation error:", profileErr.message);
            // Rollback: delete the auth user we just created
            await serviceClient.auth.admin.deleteUser(newUser.user.id);
            throw new Error(
                `Failed to create admin profile: ${profileErr.message}`
            );
        }

        await writeAuditLog(
            serviceClient,
            user.id,
            "admin_added",
            "profiles",
            newUser.user.id,
            {
                email,
                member_id: memberId,
                method: "created_new_user",
            }
        );

        console.log("[ADMIN] Admin created successfully");
    }

    revalidatePath("/admin/settings");
}

// ══════════════════════════════════════════════════════════
// REMOVE ADMIN — Only primary admin can do this
// ══════════════════════════════════════════════════════════

export async function removeAdmin(targetId: string): Promise<void> {
    const { serviceClient, user, isPrimary } = await getAdminAuth();

    if (!isPrimary) {
        throw new Error("Only the primary admin can remove other admins.");
    }

    if (targetId === user.id) {
        throw new Error("You cannot remove yourself as primary admin.");
    }

    // ✅ FIX: Use serviceClient to read the target's profile.
    // Previously used user-scoped supabase, which returned null
    // because RLS only allows reading your own profile.
    // This caused "Admin not found" errors when trying to remove admins.
    const { data: target } = await serviceClient
        .from("profiles")
        .select("id, email, is_primary_admin")
        .eq("id", targetId)
        .single();

    if (!target) throw new Error("Admin not found.");
    if (target.is_primary_admin) {
        throw new Error("Cannot remove the primary admin.");
    }

    // ✅ FIX: Use serviceClient to update another user's profile.
    // RLS policy "Users can update own profile" blocks updating others.
    const { error } = await serviceClient
        .from("profiles")
        .update({ role: "member" })
        .eq("id", targetId);

    if (error) throw new Error(error.message);

    await writeAuditLog(serviceClient, user.id, "admin_removed", "profiles", targetId, {
        email: target.email,
    });

    revalidatePath("/admin/settings");
}

// ══════════════════════════════════════════════════════════
// REVOKE INVITE — Cancel a pending admin invite
// ══════════════════════════════════════════════════════════

export async function revokeAdminInvite(inviteId: string): Promise<void> {
    const { serviceClient, user, isPrimary } = await getAdminAuth();

    if (!isPrimary) {
        throw new Error("Only the primary admin can revoke invites.");
    }

    // ✅ FIX: Use serviceClient for admin_invites reads/deletes
    const { data: invite } = await serviceClient
        .from("admin_invites")
        .select("email")
        .eq("id", inviteId)
        .single();

    const { error } = await serviceClient
        .from("admin_invites")
        .delete()
        .eq("id", inviteId);

    if (error) throw new Error(error.message);

    await writeAuditLog(
        serviceClient,
        user.id,
        "admin_invite_revoked",
        "admin_invites",
        inviteId,
        { email: invite?.email }
    );

    revalidatePath("/admin/settings");
}

// ══════════════════════════════════════════════════════════
// IMPERSONATION
// ══════════════════════════════════════════════════════════

export async function logImpersonation(targetUserId: string): Promise<void> {
    const { serviceClient, user } = await getAdminAuth();

    // ✅ FIX: Use serviceClient for impersonation_logs insert
    await serviceClient.from("impersonation_logs").insert({
        admin_id: user.id,
        target_user_id: targetUserId,
    });

    await writeAuditLog(serviceClient, user.id, "impersonation", "profiles", targetUserId);
}

export async function fetchImpersonationLogs(): Promise<ImpersonationLogEntry[]> {
    const { serviceClient } = await getAdminAuth();

    // ✅ FIX: Use serviceClient to read all impersonation logs and profiles
    const { data, error } = await serviceClient
        .from("impersonation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) throw new Error(error.message);

    const allIds = new Set<string>();
    for (const row of data ?? []) {
        if (row.admin_id) allIds.add(row.admin_id);
        if (row.target_user_id) allIds.add(row.target_user_id);
    }

    const { data: profiles } = await serviceClient
        .from("profiles")
        .select("id, email, first_name, last_name")
        .in("id", Array.from(allIds));

    const profileMap = new Map<string, any>();
    for (const p of profiles ?? []) {
        profileMap.set(p.id, p);
    }

    return (data ?? []).map((row: any) => {
        const admin = profileMap.get(row.admin_id);
        const target = profileMap.get(row.target_user_id);

        return {
            id: row.id,
            adminId: row.admin_id,
            adminEmail: admin?.email ?? null,
            adminName: admin
                ? `${admin.first_name ?? ""} ${admin.last_name ?? ""}`.trim()
                : null,
            targetUserId: row.target_user_id,
            targetEmail: target?.email ?? null,
            targetName: target
                ? `${target.first_name ?? ""} ${target.last_name ?? ""}`.trim()
                : null,
            createdAt: row.created_at,
        };
    });
}

// ══════════════════════════════════════════════════════════
// AUDIT LOGS
// ══════════════════════════════════════════════════════════

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
    const { serviceClient } = await getAdminAuth();

    // ✅ FIX: Use serviceClient to read all audit logs and profiles
    const { data, error } = await serviceClient
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

    if (error) throw new Error(error.message);

    const userIds = new Set<string>();
    for (const row of data ?? []) {
        if (row.user_id) userIds.add(row.user_id);
    }

    const { data: profiles } = await serviceClient
        .from("profiles")
        .select("id, email, first_name, last_name")
        .in("id", Array.from(userIds));

    const profileMap = new Map<string, any>();
    for (const p of profiles ?? []) {
        profileMap.set(p.id, p);
    }

    return (data ?? []).map((row: any) => {
        const profile = row.user_id ? profileMap.get(row.user_id) : null;
        return {
            id: row.id,
            userId: row.user_id,
            userEmail: profile?.email ?? null,
            userName: profile
                ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
                : null,
            action: row.action,
            entity: row.entity,
            entityId: row.entity_id,
            metadata: row.metadata,
            createdAt: row.created_at,
        };
    });
}

// ══════════════════════════════════════════════════════════
// ACCOUNT — Update own profile + change email
// ══════════════════════════════════════════════════════════

export async function updateAdminProfile(input: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string | null;
}): Promise<void> {
    // ✅ For own profile updates, we CAN use user-scoped client
    // because RLS allows users to update their own row.
    // But using serviceClient is safer and consistent.
    const { serviceClient, user } = await getAdminAuth();

    const updateData: Record<string, any> = {};
    if (input.firstName !== undefined) updateData.first_name = input.firstName;
    if (input.lastName !== undefined) updateData.last_name = input.lastName;
    if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;

    if (Object.keys(updateData).length === 0) return;

    const { error } = await serviceClient
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

    if (error) throw new Error(error.message);

    await writeAuditLog(serviceClient, user.id, "profile_updated", "profiles", user.id);

    revalidatePath("/admin/accounts/settings");
    revalidatePath("/admin/settings");
}

export async function changeAdminEmail(newEmail: string): Promise<void> {
    const { supabase, serviceClient, user } = await getAdminAuth();

    const email = newEmail.toLowerCase().trim();
    if (!email) throw new Error("Email is required.");

    // Auth email change must use user-scoped client (needs their session)
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw new Error(error.message);

    // ✅ FIX: Use serviceClient for profile update
    await serviceClient
        .from("profiles")
        .update({ email })
        .eq("id", user.id);

    await writeAuditLog(serviceClient, user.id, "email_changed", "profiles", user.id, {
        new_email: email,
    });

    revalidatePath("/admin/accounts/settings");
}

export async function linkMemberProfile(membershipId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const { serviceClient, user } = await getAdminAuth();

    const { data: member, error: mErr } = await serviceClient
        .from("members")
        .select("id, email, first_name, last_name, membership_id")
        .eq("membership_id", membershipId.trim())
        .single();

    if (mErr || !member) {
        return { success: false, error: "No member found with this ID." };
    }

    // ✅ FIX: Use serviceClient to read own profile for email comparison
    const { data: profile } = await serviceClient
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

    if (
        profile?.email?.toLowerCase() !== member.email?.toLowerCase()
    ) {
        return {
            success: false,
            error:
                "Your admin email does not match this member's email. Cannot link.",
        };
    }

    await serviceClient
        .from("profiles")
        .update({
            first_name: member.first_name,
            last_name: member.last_name,
        })
        .eq("id", user.id);

    await writeAuditLog(serviceClient, user.id, "member_linked", "members", member.id, {
        membership_id: membershipId,
    });

    revalidatePath("/admin/accounts/settings");
    revalidatePath("/admin/settings");

    return { success: true };
}

export async function fetchOwnProfile(): Promise<AdminProfile> {
    const { serviceClient, user } = await getAdminAuth();

    const { data, error } = await serviceClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) throw new Error(error.message);

    let linked: any = null;

    if (data.email) {
        const { data: member } = await serviceClient
            .from("members")
            .select("membership_id, member_group, member_position")
            .eq("email", data.email.toLowerCase())
            .maybeSingle();
        linked = member;
    }

    return {
        id: data.id,
        email: data.email ?? "",
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.avatar_url,
        role: data.role,
        isPrimaryAdmin: data.is_primary_admin === true,
        createdAt: data.created_at,
        membershipId: linked?.membership_id ?? null,
        memberGroup: linked?.member_group ?? null,
        memberPosition: linked?.member_position ?? null,
    };
}