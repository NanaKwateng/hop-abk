// app/verify/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VerifyForm } from "@/components/member/verify-form";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Member Verification",
    description: "Enter your Membership ID to access your dashboard.",
};

export default async function VerifyPage() {
    // If already verified, skip to dashboard
    const cookieStore = await cookies();
    const session = cookieStore.get("member_session");

    if (session?.value) {
        redirect("/users/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
            <VerifyForm />
        </div>
    );
}