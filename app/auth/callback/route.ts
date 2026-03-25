// // app/auth/callback/route.ts
// import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";

// function isSafeNext(next: string | null) {
//     if (!next) return false;
//     if (!next.startsWith("/")) return false;
//     if (next.startsWith("//")) return false;
//     return true;
// }

// export async function GET(request: Request) {
//     const url = new URL(request.url);
//     const origin = url.origin;
//     const code = url.searchParams.get("code");
//     const next = url.searchParams.get("next");

//     if (!code) {
//         return NextResponse.redirect(new URL("/auth/login", origin));
//     }

//     const supabase = await createClient();

//     const { data, error } = await supabase.auth.exchangeCodeForSession(code);

//     if (error || !data.user) {
//         console.error("Auth exchange error:", error?.message);
//         return NextResponse.redirect(
//             new URL("/auth/login?error=auth_code_error", origin)
//         );
//     }

//     const user = data.user;
//     let role: string | null = null;

//     // ── Step 1: Check existing profile ──
//     const { data: profile, error: profileErr } = await supabase
//         .from("profiles")
//         .select("role")
//         .eq("id", user.id)
//         .maybeSingle();

//     if (profileErr) {
//         console.error("Profile fetch error:", profileErr.message);
//     } else if (profile?.role) {
//         role = profile.role;
//     } else {
//         // Self-heal: create profile if missing
//         const { error: upsertErr } = await supabase.from("profiles").upsert(
//             {
//                 id: user.id,
//                 email: user.email?.toLowerCase() ?? null,
//                 role: "member",
//             },
//             { onConflict: "id" }
//         );

//         if (upsertErr) {
//             console.error("Profile upsert error:", upsertErr.message);
//         }

//         role = "member";
//     }

//     // ═══════════════════════════════════════════════════════
//     // Step 2: CHECK ADMIN INVITES
//     //
//     // If this user's email was pre-approved as an admin
//     // (via the admin settings page), promote them now.
//     // This is the KEY mechanism for adding new admins.
//     // ═══════════════════════════════════════════════════════

//     if (role !== "admin" && user.email) {
//         const { data: invite, error: invErr } = await supabase
//             .from("admin_invites")
//             .select("id, first_name, last_name")
//             .eq("email", user.email.toLowerCase())
//             .maybeSingle();

//         if (!invErr && invite) {
//             console.log(
//                 "[AUTH CALLBACK] Found admin invite for:",
//                 user.email,
//                 "→ promoting to admin"
//             );

//             // Promote to admin
//             const updateData: Record<string, any> = { role: "admin" };

//             // If the invite has name info, update profile
//             if (invite.first_name) updateData.first_name = invite.first_name;
//             if (invite.last_name) updateData.last_name = invite.last_name;

//             await supabase
//                 .from("profiles")
//                 .update(updateData)
//                 .eq("id", user.id);

//             // Remove the invite (used)
//             await supabase
//                 .from("admin_invites")
//                 .delete()
//                 .eq("id", invite.id);

//             // Log it
//             await supabase.from("audit_logs").insert({
//                 user_id: user.id,
//                 action: "admin_invite_accepted",
//                 entity: "profiles",
//                 entity_id: user.id,
//                 metadata: { email: user.email },
//             });

//             role = "admin";
//         }
//     }

//     // ── Step 3: Redirect ──
//     if (isSafeNext(next)) {
//         return NextResponse.redirect(new URL(next!, origin));
//     }

//     const destination = role === "admin" ? "/admin" : "/users";
//     return NextResponse.redirect(new URL(destination, origin));
// }



// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isSafeNext(next: string | null) {
    if (!next) return false;
    if (!next.startsWith("/")) return false;
    if (next.startsWith("//")) return false;
    return true;
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const origin = url.origin;
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next");

    if (!code) {
        return NextResponse.redirect(new URL("/auth/login", origin));
    }

    const supabase = await createClient();

    // ── Exchange code for session ──
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
        console.error("Auth exchange error:", error?.message);
        return NextResponse.redirect(
            new URL("/auth/login?error=auth_code_error", origin)
        );
    }

    const user = data.user;
    let role: string | null = null;

    // ══════════════════════════════════════════════════════
    // Step 1: Check existing profile
    // ══════════════════════════════════════════════════════

    const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileErr) {
        console.error("Profile fetch error:", profileErr.message);
    } else if (profile?.role) {
        role = profile.role;
    } else {
        // ══════════════════════════════════════════════════
        // Step 2: Profile missing — create it using metadata
        //
        // user_metadata comes from signUp's data option:
        //   { firstName: "John", lastName: "Doe" }
        //
        // For Google OAuth, metadata has:
        //   { full_name: "John Doe", avatar_url: "..." }
        // ══════════════════════════════════════════════════

        const meta = user.user_metadata ?? {};

        const firstName =
            meta.firstName ??
            meta.first_name ??
            meta.full_name?.split(" ")[0] ??
            null;

        const lastName =
            meta.lastName ??
            meta.last_name ??
            meta.full_name?.split(" ").slice(1).join(" ") ??
            null;

        const avatarUrl = meta.avatar_url ?? meta.picture ?? null;

        // Default role — check admin_invites first
        let newRole = "member";

        if (user.email) {
            const { data: invite } = await supabase
                .from("admin_invites")
                .select("id, first_name, last_name")
                .eq("email", user.email.toLowerCase())
                .maybeSingle();

            if (invite) {
                console.log(
                    "[CALLBACK] Admin invite found for:",
                    user.email
                );
                newRole = "admin";

                // Use invite names if available
                if (invite.first_name && !firstName) {
                    // firstName from invite takes precedence if metadata is empty
                }

                // Delete the invite
                await supabase
                    .from("admin_invites")
                    .delete()
                    .eq("id", invite.id);
            }
        }

        const { error: upsertErr } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: user.id,
                    email: user.email?.toLowerCase() ?? null,
                    role: newRole,
                    first_name: firstName,
                    last_name: lastName,
                    avatar_url: avatarUrl,
                },
                { onConflict: "id" }
            );

        if (upsertErr) {
            console.error("Profile upsert error:", upsertErr.message);
        }

        role = newRole;
    }

    // ══════════════════════════════════════════════════════
    // Step 3: Double-check admin invites for EXISTING users
    //
    // If user already had a "member" profile but was later
    // invited as admin, promote them now.
    // ══════════════════════════════════════════════════════

    if (role !== "admin" && user.email) {
        const { data: invite } = await supabase
            .from("admin_invites")
            .select("id")
            .eq("email", user.email.toLowerCase())
            .maybeSingle();

        if (invite) {
            console.log(
                "[CALLBACK] Promoting existing user to admin:",
                user.email
            );

            await supabase
                .from("profiles")
                .update({ role: "admin" })
                .eq("id", user.id);

            await supabase
                .from("admin_invites")
                .delete()
                .eq("id", invite.id);

            await supabase.from("audit_logs").insert({
                user_id: user.id,
                action: "admin_invite_accepted",
                entity: "profiles",
                entity_id: user.id,
                metadata: { email: user.email },
            });

            role = "admin";
        }
    }

    // ── Step 4: Redirect ──
    if (isSafeNext(next)) {
        return NextResponse.redirect(new URL(next!, origin));
    }

    const destination = role === "admin" ? "/admin" : "/users";
    return NextResponse.redirect(new URL(destination, origin));
}