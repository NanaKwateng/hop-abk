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
import SettingsPage from "../admin-settings/page";
import CustomizePage from "../customize/page";
import AdminFlowPage from "../admin-flow/page";
import BranchesPage from "../branches/page";

interface DocContentRendererProps {
    slug: string;
    content: DocContent;
}

export function DocContentRenderer({ slug, content }: DocContentRendererProps) {
    // ════════════════════════════════════════════════════════════════
    // HOW THIS WORKS:
    // 
    // 1. User clicks a sidebar link, e.g. href="/admin/admin-settings"
    // 2. Next.js matches app/admin/[slug]/page.tsx
    // 3. slug = "admin-settings" (the URL segment after /admin/)
    // 4. This switch must match EXACTLY that URL slug
    //
    // IMPORTANT: The case values must be the URL path segment,
    // NOT the display title from navigation.ts.
    //
    // Navigation href:           → URL slug extracted:
    // /admin/introduction        → "introduction"
    // /admin/users               → "users"  
    // /admin/register-member     → "register-member"
    // /admin/all-workflows       → "all-workflows"
    // /admin/finance             → "finance"
    // /admin/admin-settings      → "admin-settings"
    // /admin/customize           → "customize"
    // /admin/admin-flow          → "admin-flow"
    //
    // NOTE: /admin/accounts/settings is a NESTED route (has its own
    // page.tsx at app/admin/accounts/settings/page.tsx), so it does
    // NOT go through [slug]. The slug would only be "accounts" if
    // someone hit /admin/accounts directly.
    // ════════════════════════════════════════════════════════════════

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

        // --- Settings ---
        // ✅ FIX: Was "Manage accounts" (display title).
        // This slug won't normally be hit because /admin/accounts/settings
        // has its own nested route. But if the sidebar ever links to
        // /admin/accounts, this catches it.
        case "accounts":
            return <ManageAccounts />;

        // ✅ FIX: This case was COMPLETELY MISSING.
        // The sidebar links to /admin/admin-settings → slug = "admin-settings"
        // Without this case, it fell through to GenericContent (the "Generic fallback..." 
        // you see in the production screenshot).
        case "admin-settings":
            return <ManageAdmin />;

        // ✅ FIX: This case was COMPLETELY MISSING.
        // The sidebar links to /admin/admin-settings → slug = "admin-settings"
        // Without this case, it fell through to GenericContent (the "Generic fallback..." 
        // you see in the production screenshot).
        case "branches":
            return <Branches />;

        // ✅ FIX: Was "Customize Settings" (display title).
        // The sidebar links to /admin/customize → slug = "customize"
        case "customize":
            return <Customization />;

        // ✅ FIX: Was "admin flow" (with a space, not a hyphen).
        // The sidebar links to /admin/admin-flow → slug = "admin-flow"
        // Also: was previously mapped to <ManageAdmin /> (wrong component).
        // Now correctly maps to <AdminFlow /> which renders AdminFlowPage.
        case "admin-flow":
            return <AdminFlow />;

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

function ManageAccounts() {
    return (
        <div className="min-h-screen w-full">
            <AccountSettingPage />
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

// ✅ FIX: This function existed before but was never referenced 
// in the switch statement. Now it's used by case "admin-flow".
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