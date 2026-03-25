// components/admin-settings/admin-settings-page.tsx
"use client";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Shield, UserCog, ScrollText, Eye } from "lucide-react";
import { GiBrassEye } from "react-icons/gi";
import { FaUsersCog } from "react-icons/fa";
import { AdminManagement } from "./admin-management";
import { ImpersonationPanel } from "./impersonation-panel";
import { AuditLogsPanel } from "./audit-logs-panel";
import type {
    AdminProfile,
    AdminInvite,
    AuditLogEntry,
    ImpersonationLogEntry,
} from "@/lib/types/admin-settings";

interface AdminSettingsPageProps {
    adminData: {
        admins: AdminProfile[];
        invites: AdminInvite[];
        currentUserId: string;
        isPrimaryAdmin: boolean;
    };
    auditLogs: AuditLogEntry[];
    impersonationLogs: ImpersonationLogEntry[];
}

export function AdminSettingsPage({
    adminData,
    auditLogs,
    impersonationLogs,
}: AdminSettingsPageProps) {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Admin Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage admin access, impersonation, and audit trails.
                </p>
            </div>

            <Tabs defaultValue="admins" className="w-full">
                <TabsList className="w-xl grid grid-cols-3">
                    <TabsTrigger value="admins" className="gap-2">
                        <FaUsersCog className="h-4 w-4 hidden sm:inline" />
                        Admins
                    </TabsTrigger>
                    <TabsTrigger value="impersonation" className="gap-2">
                        <GiBrassEye className="h-4 w-4 hidden sm:inline" />
                        Impersonation
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="gap-2">
                        <ScrollText className="h-4 w-4 hidden sm:inline" />
                        Audit Logs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="admins" className="mt-6">
                    <AdminManagement data={adminData} />
                </TabsContent>

                <TabsContent value="impersonation" className="mt-6">
                    <ImpersonationPanel
                        logs={impersonationLogs}
                        currentUserId={adminData.currentUserId}
                    />
                </TabsContent>

                <TabsContent value="audit" className="mt-6">
                    <AuditLogsPanel logs={auditLogs} />
                </TabsContent>
            </Tabs>
        </div>
    );
}