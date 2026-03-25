import { LoginForm } from "@/components/auth/login-form";
import { WavyBackground } from "@/components/ui/wavy-background";

export const metadata = {
    title: "Login | Creative Workspace",
    description: "Access your dashboard and manage your projects.",
};

export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col md:flex-row bg-black items-center justify-center overflow-hidden">
            <div className="hidden lg:flex">

                <WavyBackground className="absolute -z-10 w-full mx-auto pb-40">
                    Akwaaba
                </WavyBackground>
            </div>
            {/* Left Sidebar - Consistent Branding */}
            <section className="relative hidden w-full md:w-1/2 flex-col justify-center p-12 md:flex lg:p-24 overflow-hidden h-screen ">
                {/* <div
                    className="absolute inset-0 z-0 opacity-50"
                    style={{
                        background: `radial-gradient(circle at 20% 50%, #065f46 0%, #022c22 40%, #000000 80%)`
                    }}
                /> */}

                <div className="relative z-10 space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
                        Streamline <br /> Your Workflow.
                    </h2>
                    <p className="max-w-xs text-zinc-400 text-lg">
                        Experience the next generation of workspace management.
                    </p>
                </div>
            </section>

            {/* Right Section - Login Form */}
            <section className="flex w-full items-center justify-center p-8 md:w-1/2 z-1 ">
                <LoginForm />
            </section>
        </main>
    );
}