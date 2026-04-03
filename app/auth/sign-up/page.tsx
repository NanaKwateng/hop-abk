// app/auth/sign-up/page.tsx (SERVER COMPONENT - no changes needed)
import { SignUpForm } from "@/components/auth/signup-form";
import { StepIndicator } from "@/components/auth/step-indicator";

export const metadata = {
    title: "Sign Up | Creative Workspace",
    description: "Join our platform to manage your workflow efficiently.",
};

export default function SignUpPage() {
    return <SignUpForm />;
}