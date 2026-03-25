// app/admin/accounts/settings/page.tsx
import { Suspense } from "react";
import { fetchOwnProfile } from "@/actions/admin-settings";
import { AccountSettingsPage } from "@/components/admin-settings/account-settings-page";
import { SettingsSkeleton } from "@/components/admin-settings/settings-skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Account Settings",
    description: "Manage your admin profile and security.",
};

export default function AccountSettingPage() {
    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <AccountContent />
        </Suspense>
    );
}

async function AccountContent() {
    let profile;
    try {
        profile = await fetchOwnProfile();
    } catch (error) {
        console.error("[ACCOUNT SETTINGS] Error:", error);
        profile = null;
    }

    if (!profile) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Failed to load profile. Please refresh.
            </div>
        );
    }

    return <AccountSettingsPage profile={profile} />;
}