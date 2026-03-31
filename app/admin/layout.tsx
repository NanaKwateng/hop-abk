// src/app/admin/layout.tsx
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/docs/sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { CustomizationProvider } from "@/lib/context/customization-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AssistiveTouch } from "@/components/dashboard/assistive-touch";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (

        <CustomizationProvider>

            <QueryProvider>

                <div className="flex min-h-screen">
                    <DashboardHeader />


                    <aside className="w-64 bg-background hidden md:block">
                        <Sidebar />
                    </aside>
                    <SidebarInset>

                        <main className="flex-1 p-8">
                            {children}
                            <AssistiveTouch />
                        </main>
                    </SidebarInset>
                </div>
            </QueryProvider>

        </CustomizationProvider>

    );
}
