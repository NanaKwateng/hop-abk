// components/users/payments/payment-grid.tsx
"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Check,
    Circle,
    CreditCard,
    Undo2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    markMonthsPaid,
    markMonthUnpaid,
    fetchMemberPayments,
} from "@/actions/payments";
import { toast } from "sonner";
import type { MonthPayment } from "@/lib/types/payments";

// ═══════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════
const paymentSchema = z.object({
    amount: z.string().min(1, "Please enter an amount first").refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, "Amount must be greater than 0"),
});

interface PaymentGridProps {
    memberId: string;
    memberName: string;
    initialPayments: MonthPayment[];
}

export function PaymentGrid({
    memberId,
    memberName,
    initialPayments,
}: PaymentGridProps) {
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [yearInput, setYearInput] = useState(currentYear.toString());
    const [payments, setPayments] = useState<MonthPayment[]>(initialPayments);
    const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
    const [amount, setAmount] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [undoMonth, setUndoMonth] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    // UI State for Shake Animation
    const [isShaking, setIsShaking] = useState(false);

    const MAX_SELECTIONS = 3;
    const paidCount = payments.filter((p) => p.status === "paid").length;
    const unpaidCount = 12 - paidCount;

    const quickYears = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

    useEffect(() => {
        setYearInput(selectedYear.toString());
    }, [selectedYear]);

    const changeYear = useCallback(
        (year: number) => {
            if (year < 1900 || year > 2100) {
                toast.error("Invalid year");
                return;
            }
            if (year === selectedYear) return;
            setSelectedYear(year);
            setSelectedMonths(new Set());
            startTransition(async () => {
                try {
                    const data = await fetchMemberPayments(memberId, year);
                    setPayments(data);
                } catch (error: any) {
                    toast.error("Failed to load payments", { description: error.message });
                }
            });
        },
        [memberId, selectedYear]
    );

    function handleYearInputChange(e: React.ChangeEvent<HTMLInputElement>) { setYearInput(e.target.value); }
    function commitYearInput() {
        const parsed = parseInt(yearInput, 10);
        if (!isNaN(parsed) && parsed >= 1900 && parsed <= 2100) { changeYear(parsed); }
        else { setYearInput(selectedYear.toString()); }
    }
    function handleYearKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") { commitYearInput(); (e.target as HTMLInputElement).blur(); }
        if (e.key === "ArrowUp") { e.preventDefault(); changeYear(selectedYear + 1); }
        if (e.key === "ArrowDown") { e.preventDefault(); changeYear(selectedYear - 1); }
    }

    function toggleMonth(month: number) {
        const payment = payments.find((p) => p.month === month);
        if (payment?.status === "paid") return;
        setSelectedMonths((prev) => {
            const next = new Set(prev);
            if (next.has(month)) { next.delete(month); }
            else {
                if (next.size >= MAX_SELECTIONS) return prev;
                next.add(month);
            }
            return next;
        });
    }

    /* TWEAKED LOGIC: 
       Safe error handling for Zod flatten() to prevent "reading 0 of undefined"
       and trigger for the input shake animation.
    */
    function handleProcessInitiation() {
        const result = paymentSchema.safeParse({ amount });

        if (!result.success) {
            // Shake the input
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);

            // Safer extraction of the error message
            const firstError = result.error.format().amount?._errors[0] || "Invalid amount";
            toast.error("Validation Error", { description: firstError });
            return;
        }

        setShowConfirm(true);
    }

    async function handleConfirmPayment() {
        const months = Array.from(selectedMonths).sort();
        startTransition(async () => {
            try {
                await markMonthsPaid(memberId, selectedYear, months, amount ? parseFloat(amount) : undefined);
                const updated = await fetchMemberPayments(memberId, selectedYear);
                setPayments(updated);
                setSelectedMonths(new Set());
                setAmount("");
                toast.success("Payment recorded");
            } catch (error: any) {
                toast.error("Payment failed", { description: error.message });
            } finally {
                setShowConfirm(false);
            }
        });
    }

    async function handleUndoPayment() {
        if (undoMonth === null) return;
        startTransition(async () => {
            try {
                await markMonthUnpaid(memberId, selectedYear, undoMonth);
                const updated = await fetchMemberPayments(memberId, selectedYear);
                setPayments(updated);
                toast.success("Payment reversed");
            } catch (error: any) {
                toast.error("Failed to reverse", { description: error.message });
            } finally {
                setUndoMonth(null);
            }
        });
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Monthly Payments
                    </CardTitle>
                    <CardDescription>
                        Track and manage {memberName}&apos;s monthly dues.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => changeYear(selectedYear - 1)} disabled={isPending}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={yearInput}
                                onChange={handleYearInputChange}
                                onBlur={commitYearInput}
                                onKeyDown={handleYearKeyDown}
                                className="h-9 w-[100px] text-center font-semibold tabular-nums"
                                disabled={isPending}
                            />
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => changeYear(selectedYear + 1)} disabled={isPending}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            {quickYears.map((y) => (
                                <Button key={y} variant={y === selectedYear ? "default" : "outline"} size="sm" className="h-8 px-3 text-xs" onClick={() => changeYear(y)} disabled={isPending}>
                                    {y}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                            {paidCount} Paid
                        </Badge>
                        <Badge variant="outline">
                            {unpaidCount} Unpaid
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {payments.map((payment) => {
                    const isPaid = payment.status === "paid";
                    const isSelected = selectedMonths.has(payment.month);

                    return (
                        <div
                            key={payment.month}
                            role={isPaid ? undefined : "button"}
                            tabIndex={isPaid ? -1 : 0}
                            className={cn(
                                "group relative flex flex-col items-center gap-3 rounded-xl border p-5 transition-all duration-300 select-none outline-none",
                                // ── PAID: Coral bg (10% opacity) ──
                                isPaid && "bg-[#ff7f501a] border-[#ff7f504d] shadow-sm cursor-default",
                                // ── READY: Amber bg (10% opacity) ──
                                isSelected && !isPaid && "bg-[#ffbf001a] border-[#ffbf004d] ring-2 ring-amber-500/20 cursor-pointer",
                                !isPaid && !isSelected && "border-border bg-card hover:border-primary/40 hover:bg-accent/50 cursor-pointer",
                                isPending && "opacity-60 pointer-events-none"
                            )}
                            onClick={() => { if (!isPaid) toggleMonth(payment.month); }}
                        >
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-active:scale-90",
                                isPaid ? "bg-white/80 dark:bg-black/20 text-[#ff7f50]" : "bg-muted text-muted-foreground"
                            )}>
                                {isPaid ? (
                                    <Check className="h-6 w-6 stroke-[3px]" />
                                ) : (
                                    <Circle className={cn("h-5 w-5", isSelected && "fill-amber-500 text-amber-500")} />
                                )}
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-bold uppercase tracking-tight">
                                    {payment.monthName.slice(0, 3)}
                                </p>

                                <div className="mt-2 flex flex-col items-center gap-1">
                                    {isPaid ? (
                                        <>
                                            {/* CORRECTION: PAID badge is bg-black with visible text */}
                                            <Badge className="bg-black text-white hover:bg-black text-[10px] px-2 py-0 h-4 border-none">
                                                PAID
                                            </Badge>
                                            <span className="text-[12px] font-bold tabular-nums">
                                                GH₵ {payment.amount?.toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0 h-4", isSelected && "bg-amber-500 text-white border-amber-500")}>
                                            {isSelected ? "READY" : "DUE"}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {isPaid && (
                                <button
                                    className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                                    onClick={(e) => { e.stopPropagation(); setUndoMonth(payment.month); }}
                                >
                                    <Undo2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedMonths.size > 0 && (
                <Card className="sticky bottom-4 z-10 border-primary bg-background/95 shadow-2xl backdrop-blur-md">
                    <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-primary uppercase">Recording Payment</span>
                            <span className="text-sm font-medium">{selectedMonths.size} Month(s) Selected</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* NOTE: Added shake animation class trigger */}
                            <Input
                                type="number"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={cn(
                                    "w-28 h-9 font-bold transition-transform",
                                    isShaking && "animate-bounce border-destructive ring-destructive ring-1 translate-x-1"
                                )}
                            />
                            <Button size="sm" variant="ghost" onClick={() => setSelectedMonths(new Set())}>Cancel</Button>
                            <Button size="sm" onClick={handleProcessInitiation}>Confirm</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                        <AlertDialogDescription>Confirm payment for {memberName}?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmPayment}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={undoMonth !== null} onOpenChange={(open) => !open && setUndoMonth(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reverse Payment?</AlertDialogTitle>
                        <AlertDialogDescription>Mark this month as unpaid?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUndoPayment} className="bg-destructive text-white hover:bg-destructive/90">
                            Reverse
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* CSS FOR SHAKE ANIMATION */}
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
                    animation-iteration-count: 2;
                }
            `}</style>
        </div>
    );
}