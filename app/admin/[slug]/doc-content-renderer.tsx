// app/admin/[slug]/doc-content-renderer.tsx

import { Suspense } from "react";
import type { DocContent } from "@/lib/docs-content";

import CreateUserForm from "@/components/dashboard/users/create-user-form";
import { UserTableShell } from "@/components/dashboard/users/user-table-shell";
import { UserTableSkeleton } from "@/components/dashboard/users/user-table-skeleton";
import MainPage from "@/components/dashboard/introduction/blocks/main-page";

import FinancePageServer from "@/components/dashboard/finance/FinancePage";
import WorkflowsPage from "@/app/admin/workflow/page";
import AccountSettingPage from "../accounts/settings/page";
import SettingsPage from "../admin-settings/page";
import CustomizePage from "../customize/page";
import AdminFlowPage from "../admin-flow/page";
import BranchesPage from "../branches/page";
import TasksPage from "../task/page";
import NicknamesPage from "../nicknames/page"; // ✅ ADDED
import SMSPage from "../sms/page";

interface DocContentRendererProps {
    slug: string;
    content: DocContent;
}

export function DocContentRenderer({ slug, content }: DocContentRendererProps) {
    switch (slug) {
        // --- Getting Started ---
        case "introduction":
            return <IntroductionContent />;

        case "users":
            return <UsersContent />;

        case "register-member":
            return <RegisterMemberContent />;

        // --- Workflows & Activities ---
        case "all-workflows":
            return <AllWorkFlows />;

        case "finance":
            return <FinancialContent />;

        // ✅ ADDED: Nicknames page
        case "nicknames":
            return <NicknamesContent />;

        // --- Settings ---
        case "accounts":
            return <ManageAccounts />;

        case "admin-settings":
            return <ManageAdmin />;

        case "branches":
            return <Branches />;

        case "customize":
            return <Customization />;

        case "admin-flow":
            return <AdminFlow />;

        case "task":
            return <ManageTasks />;

        // Fallback for anything not explicitly listed
        default:
            return <GenericContent content={content} />;
    }
}

/* ──────────────────────────────────────────────── */
/*  ACTUAL PAGE COMPONENTS                          */
/* ──────────────────────────────────────────────── */

function IntroductionContent() {
    return (
        <div className="space-y-8">
            <MainPage />
        </div>
    );
}

function UsersContent() {
    return (
        <div className="space-y-8">
            <Suspense fallback={<UserTableSkeleton />}>
                <UserTableShell />
            </Suspense>
        </div>
    );
}

function RegisterMemberContent() {
    return (
        <div className="min-h-[60vh] bg-background">
            <CreateUserForm />
        </div>
    );
}

function FinancialContent() {
    return (
        <div className="w-full bg-background">
            <FinancePageServer />
        </div>
    );
}

function AllWorkFlows() {
    return (
        <div className="min-h-[60vh] bg-background">
            <WorkflowsPage />
        </div>
    );
}

// ✅ ADDED: Nicknames content component
function NicknamesContent() {
    return (
        <div className="min-h-[60vh] bg-background">
            <NicknamesPage />
        </div>
    );
}
// ✅ ADDED: Nicknames content component
function SMSContent() {
    return (
        <div className="min-h-[60vh] bg-background">
            <SMSPage />
        </div>
    );
}

function ManageAccounts() {
    return (
        <div className="min-h-screen w-full">
            <AccountSettingPage />
        </div>
    );
}

function ManageTasks() {
    return (
        <div className="min-h-screen w-full">
            <TasksPage />
        </div>
    );
}

function ManageAdmin() {
    return (
        <div className="min-h-screen w-full">
            <SettingsPage />
        </div>
    );
}

function Customization() {
    return (
        <div className="min-h-screen w-full">
            <CustomizePage />
        </div>
    );
}

function Branches() {
    return (
        <div className="min-h-screen w-full">
            <BranchesPage />
        </div>
    );
}

function AdminFlow() {
    return (
        <div className="min-h-screen w-full">
            <AdminFlowPage />
        </div>
    );
}

/* ──────────────────────────────────────────────── */
/*  GENERIC FALLBACK                                 */
/* ──────────────────────────────────────────────── */
function GenericContent({ content }: { content: DocContent }) {
    return <div>Generic fallback...</div>;
}