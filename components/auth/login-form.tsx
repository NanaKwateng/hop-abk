"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { MailCheck } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Badge } from "../ui/badge";

export function LoginForm() {
    const [isSuccess, setIsSuccess] = useState(false); // New State
    const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });
    const supabase = createClient();

    const onSubmit = async (data: LoginInput) => {
        const result = await loginAction(data);
        if (result.error) {
            toast.error(result.error);
        } else {
            setIsSuccess(true); // Show success UI
            toast.success("Login link sent to your email!");
        }
    };

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${location.origin}/auth/callback` }
        });
    };

    // --- SUCCESS STATE UI ---
    if (isSuccess) {
        return (
            <div className="w-full max-w-sm space-y-8 text-center p-12 bg-black/60 backdrop-blur-md rounded-3xl border-3">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <MailCheck className="text-emerald-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">Check your email</h2>
                    <p className="text-sm text-zinc-500">
                        We sent a login link to <span className="font-bold text-white">{getValues("email")}</span>.
                    </p>
                </div>
                <Button variant="outline" className="w-full text-white" onClick={() => setIsSuccess(false)}>
                    Back to Login
                </Button>
            </div>
        );
    }

    // --- FORM STATE UI ---
    return (
        <div className="w-full max-w-sm space-y-8 bg-black/60 p-8 rounded-xl border-0 lg:border lg:border-gray-800">
            <header className="space-y-2 text-center md:text-left">
                <h1 className="text-2xl font-semibold text-white">Welcome Back</h1>
                <p className="text-sm text-zinc-500">Let&apos;s get you started from where you left off. Continue to explore creative workspaces 🎉</p>
            </header>

            <div className="grid grid-cols-1">
                <Button onClick={signInWithGoogle} className="space-x-4">
                    <FcGoogle />
                    <span className="font-semibold">
                        Google
                    </span>
                </Button>
            </div>

            {/* <div className="relative flex justify-center text-[10px]">
                <Badge className="px-2 text-zinc-500"> ---Or continue with email ---</Badge>
            </div> */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FieldGroup>
                    <Field className="p-4">
                        <FieldLabel className="text-zinc-400">Email Address</FieldLabel>
                        <Input {...register("email")} className="bg-zinc-900/50 text-white" placeholder="name@example.com" />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </Field>
                </FieldGroup>

                <Button type="submit" disabled={isSubmitting} className="w-full py-6 font-bold">
                    {isSubmitting ? "Sending Link..." : "Continue"}
                </Button>

                <div className="text-center text-sm text-zinc-500 flex items-center justify-center">
                    <p>
                        Don&apos;t have an account?
                    </p>
                    <Link
                        href="/auth/sign-up" className="text-white hover:underline"
                    >
                        <Button variant={"link"} size={"sm"} className="text-white/60">
                            Sign up
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}