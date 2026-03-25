// components/auth/sign-up-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import { toast } from "sonner";
import { signUpAction } from "@/actions/auth";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { MailCheck, Loader2 } from "lucide-react";

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

    const onSubmit = async (data: SignUpInput) => {
        const result = await signUpAction(data);

        if (result.error) {
            toast.error(result.error);
        } else {
            setIsSuccess(true);
            toast.success("Confirmation link sent!");
        }
    };

    // ── Success State ──
    if (isSuccess) {
        return (
            <div className="w-full max-w-sm space-y-8 text-center">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <MailCheck className="text-emerald-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">
                        Check your email
                    </h2>
                    <p className="text-sm text-zinc-500">
                        We sent a confirmation link to{" "}
                        <span className="font-bold text-white">
                            {getValues("email")}
                        </span>
                        .
                    </p>
                    <p className="text-xs text-zinc-600">
                        Click the link in your email to activate your
                        account.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="w-full text-white"
                    onClick={() => setIsSuccess(false)}
                >
                    Back to Sign Up
                </Button>
            </div>
        );
    }

    // ── Form State ──
    return (
        <div className="w-full max-w-sm space-y-8">
            <h2 className="text-2xl font-semibold text-white">
                Sign Up Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FieldGroup>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel className="text-zinc-400">
                                First Name
                            </FieldLabel>
                            <Input
                                {...register("firstName")}
                                className="bg-zinc-900/50 text-white"
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel className="text-zinc-400">
                                Last Name
                            </FieldLabel>
                            <Input
                                {...register("lastName")}
                                className="bg-zinc-900/50 text-white"
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel className="text-zinc-400">
                            Email
                        </FieldLabel>
                        <Input
                            {...register("email")}
                            type="email"
                            className="bg-zinc-900/50 text-white"
                            placeholder="name@example.com"
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel className="text-zinc-400">
                            Password
                        </FieldLabel>
                        <Input
                            {...register("password")}
                            type="password"
                            className="bg-zinc-900/50 text-white"
                            placeholder="Min. 8 characters"
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </Field>
                </FieldGroup>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 font-bold"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        "Sign Up"
                    )}
                </Button>

                <p className="text-center text-sm text-zinc-500">
                    Already have an account?{" "}
                    <Link
                        href="/auth/login"
                        className="text-white hover:underline"
                    >
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}