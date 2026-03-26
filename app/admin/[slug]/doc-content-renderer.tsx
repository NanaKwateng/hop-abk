// app/admin/[slug]/doc-content-renderer.tsx
import { Suspense } from "react";
import type { DocContent } from "@/lib/docs-content";

import CreateUserForm from "@/components/dashboard/users/create-user-form";
import { UserTableShell } from "@/components/dashboard/users/user-table-shell";
import { UserTableSkeleton } from "@/components/dashboard/users/user-table-skeleton";
import MainPage from "@/components/dashboard/introduction/blocks/main-page";

import FinancePageServer from "@/components/dashboard/finance/FinancePage";
import WorkflowsPage from "@/app/workflow/page";
import AccountSettingPage from "../accounts/settings/page";
import SettingsPage from "../settings/page";
import CustomizePage from "../customize/page";


interface DocContentRendererProps {
    slug: string;
    content: DocContent;
}

export function DocContentRenderer({ slug, content }: DocContentRendererProps) {
    switch (slug) {
        // --- Getting Started ---
        case "introduction": return <IntroductionContent />;
        case "users": return <UsersContent />;
        case "finance": return <FinancialContent />;
        case "all-workflows": return <AllWorkFlows />;
        case "Manage accouts": return <ManageAccounts />;
        case "Customize Settings": return <Customization />;
        case "register-member": return <RegisterMemberContent />;

        // Fallback for anything not explicitly listed
        default: return <GenericContent content={content} />;
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

function ManageAccounts() {
    return (
        <div className="min-h-screen w-full">
            <AccountSettingPage />
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

/* ──────────────────────────────────────────────── */


/* ──────────────────────────────────────────────── */
/*  GENERIC FALLBACK                                 */
/* ──────────────────────────────────────────────── */
function GenericContent({ content }: { content: DocContent }) {
    // Keep your original GenericContent function code here untouched
    return <div>Generic fallback...</div>;
}