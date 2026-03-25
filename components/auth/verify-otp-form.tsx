"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { RefreshCwIcon, Loader2, CheckCheckIcon, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth"; // Import Server Actions

export function InputOTPForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // async function handleVerify() {
    //     if (!email || token.length < 6) {
    //         toast.error("Enter a valid code");
    //         return;
    //     }

    //     setIsLoading(true);
    //     // Calls the Server Action
    //     const result = await verifyOtpAction(email, token);

    //     if (result.error) {
    //         toast.error(result.error);
    //         setIsLoading(false);
    //         return;
    //     }

    //     toast.success("Login successful");
    //     // Redirect based on the role returned by the server action
    //     router.push(result.role === "admin" ? "/admin" : "/users");
    // }

    async function handleResend() {
        if (!email) return;
        setIsResending(true);
        // Reuse Login Action for resend logic
        const result = await loginAction({ email });
        setIsResending(false);

        if (result.error) {
            toast.error("Failed to resend");
        } else {
            toast.success("Code resent");
        }
    }

    return (
        <Card className="mx-auto max-w-md">
            <CardHeader>
                <CardTitle>
                    <FileCheck />
                    Verify your identity
                </CardTitle>
                <CardDescription>Code sent to : {" [ USER NAME ] "}<span className="font-medium text-primary">{email}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Verification Code</span>
                    <Button variant="ghost" size="sm" onClick={handleResend} disabled={isResending || !email} className="h-8 gap-2">
                        <RefreshCwIcon className={isResending ? "animate-spin" : ""} size={14} /> Resend
                    </Button>
                </div>

                <InputOTP maxLength={9} value={token} onChange={setToken} disabled={isLoading}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>

                    <InputOTPSeparator />

                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>

                    <InputOTPSeparator />

                    <InputOTPGroup>
                        <InputOTPSlot index={6} />
                        <InputOTPSlot index={7} />
                        <InputOTPSlot index={8} />
                    </InputOTPGroup>
                </InputOTP>
            </CardContent>

            <CardFooter className="border-0 bg-transparent">
                <Button
                    //onClick={handleVerify} 
                    className="w-full" disabled={isLoading || token.length < 6}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheckIcon className="mr-2 h-4 w-4" />}
                    {isLoading ? "Verifying..." : "Verify"}

                </Button>
            </CardFooter>
        </Card>
    );
}





