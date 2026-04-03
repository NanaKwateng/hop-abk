// components/auth/login-form.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, Zap, Globe, MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // ✅ Fix
        },
    },
};

export function LoginForm() {
    const [isSuccess, setIsSuccess] = useState(false);
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const supabase = createClient();

    // ✅ PRESERVED: Original backend logic (magic link)
    const onSubmit = async (data: LoginInput) => {
        const result = await loginAction(data);
        if (result.error) {
            toast.error(result.error);
        } else {
            setIsSuccess(true);
            toast.success("Login link sent to your email!");
        }
    };

    // ✅ PRESERVED: Original Google OAuth logic
    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${location.origin}/auth/callback` },
        });
    };

    // ✅ PRESERVED: Success state UI (with new styling)
    if (isSuccess) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center bg-black text-white p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md space-y-8 text-center bg-zinc-950/50 backdrop-blur-xl p-10 rounded-3xl border border-zinc-800"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="flex justify-center"
                    >
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <MailCheck className="h-8 w-8 text-emerald-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                    >
                        <h2 className="text-3xl font-bold">Check your email</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            We sent a login link to{" "}
                            <span className="font-semibold text-white">{getValues("email")}</span>.
                            <br />
                            Click the link to sign in securely.
                        </p>
                    </motion.div>

                    <Button
                        variant="outline"
                        className="w-full h-11 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-all group"
                        onClick={() => setIsSuccess(false)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Button>
                </motion.div>
            </main>
        );
    }

    // ✅ NEW UI + OLD LOGIC: Main form
    return (
        <main className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-black text-white selection:bg-emerald-500/30">
            {/* LEFT PANEL */}
            <section className="relative hidden md:flex flex-col justify-between p-12 lg:p-16 bg-[#020804] overflow-hidden border-r border-zinc-900">
                <motion.div
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full"
                />

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative z-10 space-y-4"
                >
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                        Welcome
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-sm font-medium">
                        Log in to manage your workspace and continue your progress.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 flex gap-4"
                >
                    <InfoCard icon={<ShieldCheck className="w-4 h-4" />} title="Secure Access" active index={0} />
                    <InfoCard icon={<Zap className="w-4 h-4" />} title="Fast Session" index={1} />
                    <InfoCard icon={<Globe className="w-4 h-4" />} title="Sync Anywhere" index={2} />
                </motion.div>
            </section>

            {/* RIGHT PANEL */}
            <section className="flex items-center justify-center p-6 md:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-full max-w-[380px] space-y-8"
                >
                    <header className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Login Account</h2>
                        <p className="text-zinc-400 text-sm">
                            Enter your email to receive a secure login link.
                        </p>
                    </header>

                    {/* Google OAuth */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            className="w-full h-12 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 transition-all"
                            type="button"
                            onClick={signInWithGoogle}
                            disabled={isSubmitting}
                        >
                            <span className="mr-2 text-lg font-bold">G</span> Continue with Google
                        </Button>
                    </motion.div>

                    <div className="relative flex items-center justify-center">
                        <Separator className="bg-zinc-800" />
                        <span className="absolute bg-black px-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                            Or login with email
                        </span>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Field>
                                    <FieldLabel htmlFor="email" className="text-zinc-300 text-sm font-semibold">
                                        Email Address
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="name@company.com"
                                        {...register("email")}
                                        className="bg-zinc-900/50 border-zinc-800 h-12 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <AnimatePresence mode="wait">
                                        {errors.email && (
                                            <motion.span
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-red-500 text-[10px] uppercase font-bold mt-1 block"
                                            >
                                                {errors.email.message}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Field>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12 transition-all active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin h-5 w-5" />
                                    ) : (
                                        "Continue"
                                    )}
                                </Button>
                            </motion.div>
                        </FieldGroup>
                    </form>

                    <footer className="text-center pt-2">
                        <p className="text-zinc-500 text-sm">
                            Don't have an account?{" "}
                            <Link
                                href="/auth/sign-up"
                                className="text-white hover:text-emerald-400 font-semibold underline-offset-8 decoration-zinc-800 hover:decoration-emerald-500 underline transition-all"
                            >
                                Create one now
                            </Link>
                        </p>
                    </footer>
                </motion.div>
            </section>
        </main>
    );
}

/* InfoCard Component */
function InfoCard({
    icon,
    title,
    active = false,
    index = 0,
}: {
    icon: React.ReactNode;
    title: string;
    active?: boolean;
    index?: number;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`
                flex flex-col p-5 rounded-2xl border transition-all w-36 h-36 justify-between
                ${active
                    ? "bg-white text-black border-white shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                    : "bg-white/5 text-zinc-500 border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20"
                }
            `}
        >
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                className={`
                    flex items-center justify-center w-8 h-8 rounded-lg
                    ${active ? "bg-black text-white" : "bg-zinc-800 text-zinc-400"}
                `}
            >
                {icon}
            </motion.div>
            <p className="text-[13px] font-bold leading-tight">{title}</p>
        </motion.div>
    );
}