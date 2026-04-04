"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { createWorkflow } from "@/actions/workflow";
import {
    workflowSchema,
    type CreateWorkflowInput,
} from "@/lib/validations/workflow-schema";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Loader2, ArrowRight, ArrowLeft,
    FileText, CreditCard, Check, CalendarDays, Shield, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MemberSelectionTable } from "./member-selection-table";
import type { DateRange } from "react-day-picker";

const STEPS = [
    { label: "Details", description: "Name & duration" },
    { label: "Members", description: "Select participants" },
    { label: "Action", description: "Choose function" },
] as const;

interface CreateWorkflowDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateWorkflowDrawer({
    open,
    onOpenChange,
}: CreateWorkflowDrawerProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateWorkflowInput>({
        resolver: zodResolver(workflowSchema),
        defaultValues: {
            name: "",
            memberIds: [],
        },
    });

    const {
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = form;

    const selectedMembers = watch("memberIds") ?? [];
    const dateRange = watch("dateRange") as DateRange | undefined;
    const type = watch("type");

    async function handleNext() {
        let valid = false;
        if (step === 1) valid = await trigger(["name", "dateRange"]);
        if (step === 2) valid = await trigger(["memberIds"]);
        if (valid) setStep((s) => s + 1);
    }

    function handleBack() {
        setStep((s) => s - 1);
    }

    async function onSubmit(data: CreateWorkflowInput) {
        setIsSubmitting(true);
        try {
            const slug = await createWorkflow({
                name: data.name,
                startDate: format(data.dateRange.from, "yyyy-MM-dd"),
                endDate: format(data.dateRange.to, "yyyy-MM-dd"),
                memberIds: data.memberIds,
                type: data.type,
            });

            toast.success("Workflow created!", {
                description: `${data.name} with ${data.memberIds.length} members.`,
            });

            form.reset();
            setStep(1);
            onOpenChange(false);

            // ✅ Fixed: was /admin/workflows/${slug}
            router.push(`/admin/workflow/${slug}`);
            router.refresh();
        } catch (error: unknown) {
            // ✅ Fixed: was error: any
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to create workflow";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleClose() {
        if (!isSubmitting) {
            form.reset();
            setStep(1);
            onOpenChange(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-2xl px-2 flex flex-col gap-0"
            >
                {/* Header + Stepper */}
                <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-muted/30 space-y-4">
                    <SheetHeader className="text-left">
                        <SheetTitle className="text-xl">
                            Create New Workflow
                        </SheetTitle>
                        <SheetDescription>
                            Set up a batch process for member records, payments, or roles.
                        </SheetDescription>
                    </SheetHeader>

                    {/* Stepper */}
                    <nav
                        aria-label="Workflow creation steps"
                        className="flex items-center justify-center"
                    >
                        {STEPS.map((s, i) => {
                            const stepNum = i + 1;
                            const isActive = stepNum === step;
                            const isComplete = stepNum < step;

                            return (
                                <div key={stepNum} className="flex items-center">
                                    {i > 0 && (
                                        <div
                                            className={cn(
                                                "h-px w-4 sm:w-14 mx-1.5",
                                                isComplete ? "bg-primary" : "bg-border"
                                            )}
                                        />
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                                                isActive && "bg-primary text-primary-foreground shadow-sm",
                                                isComplete && "bg-primary/20 text-primary",
                                                !isActive && !isComplete && "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {isComplete ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                stepNum
                                            )}
                                        </div>
                                        <div className="hidden sm:block">
                                            <p
                                                className={cn(
                                                    "text-xs font-medium leading-none",
                                                    isActive ? "text-foreground" : "text-muted-foreground"
                                                )}
                                            >
                                                {s.label}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                {s.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden min-h-0">
                    {/* STEP 1 */}
                    {step === 1 && (
                        <ScrollArea className="h-120">
                            <div className="px-6 py-6 space-y-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="wf-name"
                                        className="text-sm font-medium"
                                    >
                                        Workflow Name
                                    </Label>
                                    <Input
                                        id="wf-name"
                                        placeholder="eg. Building Committee"
                                        className="h-11 text-base"
                                        autoFocus
                                        {...form.register("name")}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        Duration
                                    </Label>

                                    {dateRange?.from && (
                                        <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 inline-block">
                                            {format(dateRange.from, "MMMM d, yyyy")}
                                            {dateRange.to && (
                                                <>
                                                    {" → "}
                                                    {format(dateRange.to, "MMMM d, yyyy")}
                                                </>
                                            )}
                                        </p>
                                    )}

                                    <div className="border rounded-lg overflow-x-auto">
                                        <Calendar
                                            mode="range"
                                            defaultMonth={dateRange?.from ?? new Date()}
                                            selected={dateRange}
                                            onSelect={(range) =>
                                                setValue("dateRange", range as any, {
                                                    shouldValidate: true,
                                                })
                                            }
                                            numberOfMonths={1}
                                            disabled={(date) =>
                                                date < new Date("1900-01-01")
                                            }
                                            className="mx-auto"
                                        />
                                    </div>

                                    {errors.dateRange && (
                                        <p className="text-sm text-destructive">
                                            {(errors.dateRange as any)?.root?.message ??
                                                (errors.dateRange as any)?.from?.message ??
                                                "Select a valid date range"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="flex flex-col h-full overflow-y-auto">
                            <MemberSelectionTable
                                selectedIds={selectedMembers}
                                onSelectionChange={(ids) =>
                                    setValue("memberIds", ids, {
                                        shouldValidate: true,
                                    })
                                }
                            />
                            {errors.memberIds && (
                                <div className="shrink-0 px-6 py-2 bg-destructive/10 border-t">
                                    <p className="text-sm text-destructive font-medium">
                                        {errors.memberIds.message}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <ScrollArea className="h-full">
                            <div className="px-6 py-6 space-y-6">
                                <div className="text-center space-y-1">
                                    <h3 className="text-lg font-semibold">
                                        What action will this workflow perform?
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Choose the function for{" "}
                                        <strong>{selectedMembers.length}</strong> selected
                                        member{selectedMembers.length !== 1 ? "s" : ""}.
                                    </p>
                                </div>

                                <RadioGroup
                                    value={type}
                                    onValueChange={(val) =>
                                        setValue("type", val as any, {
                                            shouldValidate: true,
                                        })
                                    }
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                >
                                    {/* Assign Roles */}
                                    <div>
                                        <RadioGroupItem
                                            value="roles"
                                            id="type-roles"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="type-roles"
                                            className={cn(
                                                "flex flex-col items-center gap-3 rounded-xl border-2 p-6 cursor-pointer transition-all",
                                                "hover:bg-accent hover:border-blue-400",
                                                "peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50",
                                                "dark:peer-data-[state=checked]:bg-blue-950/20"
                                            )}
                                        >
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50">
                                                <Shield className="h-7 w-7 text-blue-600" />
                                            </div>
                                            <span className="text-base font-semibold">
                                                Assign Roles
                                            </span>
                                            <span className="text-xs text-muted-foreground text-center leading-relaxed">
                                                Assign roles with titles and descriptions to
                                                selected members.
                                            </span>
                                        </Label>
                                    </div>

                                    {/* Payments */}
                                    <div>
                                        <RadioGroupItem
                                            value="payments"
                                            id="type-payments"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="type-payments"
                                            className={cn(
                                                "flex flex-col items-center gap-3 rounded-xl border-2 p-6 cursor-pointer transition-all",
                                                "hover:bg-accent hover:border-green-400",
                                                "peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50",
                                                "dark:peer-data-[state=checked]:bg-green-950/20"
                                            )}
                                        >
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
                                                <CreditCard className="h-7 w-7 text-green-600" />
                                            </div>
                                            <span className="text-base font-semibold">
                                                Payments
                                            </span>
                                            <span className="text-xs text-muted-foreground text-center leading-relaxed">
                                                Process tithes, donations, or dues with amount
                                                tracking.
                                            </span>
                                        </Label>
                                    </div>

                                    {/* Records */}
                                    <div>
                                        <RadioGroupItem
                                            value="records"
                                            id="type-records"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="type-records"
                                            className={cn(
                                                "flex flex-col items-center gap-3 rounded-xl border-2 p-6 cursor-pointer transition-all",
                                                "hover:bg-accent hover:border-primary/40",
                                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                            )}
                                        >
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                                <FileText className="h-7 w-7 text-primary" />
                                            </div>
                                            <span className="text-base font-semibold">
                                                Records
                                            </span>
                                            <span className="text-xs text-muted-foreground text-center leading-relaxed">
                                                Log titles, descriptions, and data updates for
                                                members.
                                            </span>
                                        </Label>
                                    </div>

                                    {/* Monitor */}
                                    <div>
                                        <RadioGroupItem
                                            value="monitor"
                                            id="type-monitor"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="type-monitor"
                                            className={cn(
                                                "flex flex-col items-center gap-3 rounded-xl border-2 p-6 cursor-pointer transition-all",
                                                "hover:bg-accent hover:border-orange-400",
                                                "peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50",
                                                "dark:peer-data-[state=checked]:bg-orange-950/20"
                                            )}
                                        >
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/50">
                                                <Activity className="h-7 w-7 text-orange-600" />
                                            </div>
                                            <span className="text-base font-semibold">
                                                Monitor
                                            </span>
                                            <span className="text-xs text-muted-foreground text-center leading-relaxed">
                                                Track and observe member activities without
                                                actions.
                                            </span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {errors.type && (
                                    <p className="text-sm text-destructive text-center">
                                        {errors.type.message}
                                    </p>
                                )}

                                {/* Summary */}
                                {type && (
                                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                                        <p className="text-sm font-medium">Summary</p>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                                            <span className="text-muted-foreground">Name</span>
                                            <span className="font-medium">
                                                {form.getValues("name")}
                                            </span>
                                            <span className="text-muted-foreground">Action</span>
                                            <span className="font-medium capitalize">
                                                {type === "payments"
                                                    ? "💳 Payments"
                                                    : type === "roles"
                                                        ? "🛡️ Assign Roles"
                                                        : type === "monitor"
                                                            ? "📊 Monitor"
                                                            : "📄 Records"}
                                            </span>
                                            <span className="text-muted-foreground">Members</span>
                                            <span className="font-medium">
                                                {selectedMembers.length} selected
                                            </span>
                                            {dateRange?.from && dateRange?.to && (
                                                <>
                                                    <span className="text-muted-foreground">
                                                        Duration
                                                    </span>
                                                    <span className="font-medium">
                                                        {format(dateRange.from, "MMM d")} →{" "}
                                                        {format(dateRange.to, "MMM d, yyyy")}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={step === 1 ? handleClose : handleBack}
                        disabled={isSubmitting}
                        size="sm"
                    >
                        {step === 1 ? (
                            "Cancel"
                        ) : (
                            <>
                                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                                Back
                            </>
                        )}
                    </Button>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                            Step {step}/3
                        </span>
                        {step < 3 ? (
                            <Button onClick={handleNext} size="sm">
                                Next
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                        ) : (
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isSubmitting || !type}
                                size="sm"
                                className="min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        Creating…
                                    </>
                                ) : (
                                    "Create Workflow"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}