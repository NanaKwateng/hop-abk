// components/auth/signup-form.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { signUpAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ✅ FIXED: Use "easeOut" string instead of number[] array
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.2,
        } as any,
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut", // ✅ FIXED: string literal instead of number[]
        },
    },
};

export function SignUpForm() {
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
    });

    const supabase = createClient();

    // ✅ PRESERVED: Original backend logic
    const onSubmit = async (data: SignUpInput) => {
        const result = await signUpAction(data);
        if (result.error) {
            toast.error(result.error);
        } else {
            setIsSuccess(true);
            toast.success("Confirmation link sent!");
        }
    };

    // ✅ PRESERVED: Original Google OAuth logic
    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${location.origin}/auth/callback` },
        });
    };

    // ✅ SUCCESS STATE
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
                        transition={{ delay: 0.3, ease: "easeOut" }}
                        className="space-y-3"
                    >
                        <h2 className="text-3xl font-bold">Check your email</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            We sent a confirmation link to{" "}
                            <span className="font-semibold text-white">
                                {getValues("email")}
                            </span>
                            .<br />
                            Click the link in your email to activate your account.
                        </p>
                    </motion.div>

                    <Button
                        variant="outline"
                        className="w-full h-11 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 transition-all group"
                        onClick={() => setIsSuccess(false)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Sign Up
                    </Button>
                </motion.div>
            </main>
        );
    }

    // ✅ MAIN FORM
    return (
        <main className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-black text-white font-sans selection:bg-emerald-500/30">

            {/* LEFT SIDE */}
            <section className="relative hidden md:flex flex-col justify-between p-12 lg:p-16 bg-[#020804] overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-emerald-500/15 blur-[100px] rounded-full"
                />

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="relative z-10 space-y-4"
                >
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                        Get Started <br /> with Us
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-sm">
                        Complete these easy steps to register your account.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 flex gap-4"
                >
                    <StepItem number="1" title="Sign up your account" active index={0} />
                    <StepItem number="2" title="Set up your workspace" index={1} />
                    <StepItem number="3" title="Set up your profile" index={2} />
                </motion.div>
            </section>

            {/* RIGHT SIDE */}
            <section className="flex items-center justify-center p-6 md:p-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[400px] space-y-8"
                >
                    {/* Header */}
                    <motion.header variants={itemVariants} className="space-y-2">
                        <h2 className="text-3xl font-semibold tracking-tight">
                            Sign Up Account
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            Enter your personal data to create your account.
                        </p>
                    </motion.header>

                    {/* Google OAuth */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            variant="outline"
                            className="w-full h-11 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white transition-colors"
                            type="button"
                            onClick={signInWithGoogle}
                            disabled={isSubmitting}
                        >
                            <span className="mr-2 text-lg font-bold">G</span>
                            Continue with Google
                        </Button>
                    </motion.div>

                    {/* Divider */}
                    <motion.div
                        variants={itemVariants}
                        className="relative flex items-center justify-center"
                    >
                        <Separator className="bg-zinc-800" />
                        <span className="absolute bg-black px-3 text-xs text-zinc-500 uppercase font-medium">
                            Or
                        </span>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                        variants={containerVariants}
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <FieldGroup className="space-y-5">

                            {/* Name Row */}
                            <motion.div
                                variants={itemVariants}
                                className="grid grid-cols-2 gap-4"
                            >
                                <Field>
                                    <FieldLabel className="text-zinc-300 text-sm">
                                        First Name
                                    </FieldLabel>
                                    <Input
                                        {...register("firstName")}
                                        placeholder="John"
                                        className="bg-zinc-900/50 border-zinc-800 h-11 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <AnimatePresence mode="wait">
                                        {errors.firstName && (
                                            <motion.span
                                                key="firstName-error"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-red-500 text-[10px] uppercase font-bold block mt-1"
                                            >
                                                {errors.firstName.message}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Field>

                                <Field>
                                    <FieldLabel className="text-zinc-300 text-sm">
                                        Last Name
                                    </FieldLabel>
                                    <Input
                                        {...register("lastName")}
                                        placeholder="Doe"
                                        className="bg-zinc-900/50 border-zinc-800 h-11 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <AnimatePresence mode="wait">
                                        {errors.lastName && (
                                            <motion.span
                                                key="lastName-error"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-red-500 text-[10px] uppercase font-bold block mt-1"
                                            >
                                                {errors.lastName.message}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Field>
                            </motion.div>

                            {/* Email */}
                            <motion.div variants={itemVariants}>
                                <Field>
                                    <FieldLabel
                                        htmlFor="email"
                                        className="text-zinc-300 text-sm"
                                    >
                                        Email
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="eg. johnfrans@gmail.com"
                                        {...register("email")}
                                        className="bg-zinc-900/50 border-zinc-800 h-11 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <AnimatePresence mode="wait">
                                        {errors.email && (
                                            <motion.span
                                                key="email-error"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-red-500 text-[10px] uppercase font-bold block mt-1"
                                            >
                                                {errors.email.message}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Field>
                            </motion.div>

                            {/* Password */}
                            <motion.div variants={itemVariants}>
                                <Field>
                                    <FieldLabel
                                        htmlFor="password"
                                        className="text-zinc-300 text-sm"
                                    >
                                        Password
                                    </FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        {...register("password")}
                                        className="bg-zinc-900/50 border-zinc-800 h-11 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <FieldDescription className="text-zinc-500 text-xs mt-1">
                                        Must be at least 8 characters.
                                    </FieldDescription>
                                    <AnimatePresence mode="wait">
                                        {errors.password && (
                                            <motion.span
                                                key="password-error"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-red-500 text-[10px] uppercase font-bold block mt-1"
                                            >
                                                {errors.password.message}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Field>
                            </motion.div>

                            {/* Submit */}
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12 mt-2 transition-all"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin h-5 w-5" />
                                    ) : (
                                        "Sign Up"
                                    )}
                                </Button>
                            </motion.div>

                        </FieldGroup>
                    </motion.form>

                    {/* Footer */}
                    <motion.footer variants={itemVariants} className="text-center">
                        <p className="text-zinc-500 text-sm">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="text-white hover:text-emerald-400 font-semibold underline underline-offset-4 decoration-zinc-700 hover:decoration-emerald-500 transition-all"
                            >
                                Log in
                            </Link>
                        </p>
                    </motion.footer>

                </motion.div>
            </section>
        </main>
    );
}

/* ── StepItem Component ── */
function StepItem({
    number,
    title,
    active = false,
    index = 0,
}: {
    number: string;
    title: string;
    active?: boolean;
    index?: number;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`
                flex flex-col p-5 rounded-2xl border transition-all w-40 h-36 justify-between cursor-default
                ${active
                    ? "bg-white text-black border-white shadow-[0_10px_40px_-10px_rgba(255,255,255,0.2)]"
                    : "bg-white/5 text-zinc-500 border-white/10 backdrop-blur-md hover:border-white/20 hover:bg-white/10"
                }
            `}
        >
            <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    delay: 0.5 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                }}
                className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black
                    ${active ? "bg-black text-white" : "bg-zinc-800 text-zinc-400"}
                `}
            >
                {number}
            </motion.span>
            <p className="text-[13px] font-bold leading-tight">{title}</p>
        </motion.div>
    );
}