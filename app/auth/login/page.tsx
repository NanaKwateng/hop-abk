// app/auth/login/page.tsx (SERVER COMPONENT - no changes needed)
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
    title: "Login | Creative Workspace",
    description: "Access your dashboard and manage your projects.",
};

export default function LoginPage() {
    return <LoginForm />;
}