// app/admin/settings/page.tsx
import { Suspense } from "react";
import { fetchAdmins, fetchAuditLogs, fetchImpersonationLogs } from "@/actions/admin-settings";
import { AdminSettingsPage } from "@/components/admin-settings/admin-settings-page";
import { SettingsSkeleton } from "@/components/admin-settings/settings-skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Admin Settings",
    description: "Manage admins, impersonation, and audit logs.",
};

export default function AdminFlowPage() {
    return (
        <Suspense fallback={< SettingsSkeleton />}>
            <SettingsContent />
        </Suspense>
    );
}

async function SettingsContent() {
    const [adminData, auditLogs, impersonationLogs] = await Promise.allSettled([
        fetchAdmins(),
        fetchAuditLogs(),
        fetchImpersonationLogs(),
    ]);

    return (
        <AdminSettingsPage
            adminData={
                adminData.status === "fulfilled" ? adminData.value : {
                    admins: [], invites: [], currentUserId: "", isPrimaryAdmin: false,
                }
            }
            auditLogs={auditLogs.status === "fulfilled" ? auditLogs.value : []}
            impersonationLogs={impersonationLogs.status === "fulfilled" ? impersonationLogs.value : []}
        />
    );
}