// components/member/verify-form.tsx
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    ShieldCheck,
    Loader2,
    ArrowRight,
    AlertCircle,
    KeyRound,
} from "lucide-react";
import { verifyMembershipId } from "@/actions/member-verify";
import { cn } from "@/lib/utils";

export function VerifyForm() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!code.trim()) {
            setError("Please enter your Membership ID.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await verifyMembershipId(code);

                if (result.success) {
                    router.push("/users/dashboard");
                    router.refresh();
                } else {
                    setError(
                        result.error ??
                        "Verification failed. Please try again."
                    );
                }
            } catch (err: any) {
                setError("Something went wrong. Please try again.");
                console.error("[VERIFY] Error:", err);
            }
        });
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            {/* ── Header ── */}
            <CardHeader className="text-center space-y-4 pb-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                </div>

                <div className="space-y-1">
                    <CardTitle className="text-2xl">
                        Member Dashboard
                    </CardTitle>
                    <CardDescription className="text-base">
                        Enter your Membership ID to access your payment
                        records and analytics.
                    </CardDescription>
                </div>
            </CardHeader>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-4">
                    {/* Error alert */}
                    {error && (
                        <Alert
                            variant="destructive"
                            className="animate-in fade-in slide-in-from-top-1"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Membership ID input */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="membership-id"
                            className="text-sm font-medium"
                        >
                            Membership ID
                        </Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                id="membership-id"
                                type="text"
                                placeholder="Enter your ID (e.g., MEM-001)"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value);
                                    if (error) setError(null);
                                }}
                                className={cn(
                                    "pl-10 h-12 text-lg font-mono tracking-wider text-center",
                                    error &&
                                    "border-destructive focus-visible:ring-destructive"
                                )}
                                disabled={isPending}
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Your Membership ID was provided during
                            registration.
                        </p>
                    </div>
                </CardContent>

                {/* ── Submit ── */}
                <CardFooter className="flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full h-11 text-base"
                        disabled={isPending || !code.trim()}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Access Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        Having trouble? Contact your administrator for
                        assistance.
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}