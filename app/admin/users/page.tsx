// src/app/admin/users/page.tsx
import { UserTableShell } from "@/components/dashboard/users/user-table-shell";
import { AIChat } from "@/components/ai-assistant/ai-chat";
export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
                <p className="text-muted-foreground">Manage your members and their roles.</p>
            </div>
            <UserTableShell />
            <AIChat />
        </div>
    );
}