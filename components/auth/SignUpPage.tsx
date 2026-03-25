import { SignUpForm } from "@/components/auth/signup-form";
import { StepIndicator } from "@/components/auth/step-indicator";

export const metadata = {
  title: "Sign Up | Creative Workspace",
  description: "Join our platform to manage your workflow efficiently.",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row bg-[#000000]">
      {/* Visual Sidebar */}
      <section className="relative flex w-full flex-col justify-end p-8 md:w-1/2 md:p-16 lg:p-24 overflow-hidden min-h-[400px]">
        {/* The "Green Aura" Gradient */}
        <div
          className="absolute inset-0 z-0 opacity-60"
          style={{
            background: `radial-gradient(circle at 20% 50%, #064e3b 0%, #022c22 30%, #000000 70%)`
          }}
        />

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
            Get Started <br /> with Us
          </h1>
          <p className="max-w-xs text-zinc-400">
            Complete these easy steps to register your account.
          </p>

          <nav className="flex items-center gap-3 pt-8" aria-label="Registration steps">
            <StepIndicator step={1} label="Sign up your account" variant="active" />
            <StepIndicator step={2} label="Set up your workspace" variant="inactive" />
            <StepIndicator step={3} label="Set up your profile" variant="inactive" />
          </nav>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex w-full items-center justify-center p-8 md:w-1/2 bg-white">
        <SignUpForm />
      </section>
    </main>
  );
}