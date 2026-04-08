// components/dashboard/tasks/create-task-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import confetti from "canvas-confetti";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Loader2,
    ArrowRight,
    ArrowLeft,
    Check,
    CreditCard,
    FileText,
    Shield,
    Users as UsersIcon,
    Activity,
    MoreHorizontal,
    CalendarDays,
    Sparkles,
    PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreateTaskMutation } from "@/queries/task-queries";
import {
    taskBasicInfoSchema,
    taskDurationSchema,
    taskMemberSelectionSchema,
    createTaskSchema,
    type CreateTaskInput,
} from "@/lib/validations/task-schema";
import { TaskMemberSelection } from "./task-member-selection";
import { TaskPurposeConfig } from "./task-purpose-config";
import type { DateRange } from "react-day-picker";
import type { TaskPurpose } from "@/lib/types/task";

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const STEPS = [
    { label: "Basic Info", description: "Name & purpose" },
    { label: "Duration", description: "Optional dates" },
    { label: "Members", description: "Select participants" },
    { label: "Configure", description: "Purpose settings" },
    { label: "Review", description: "Confirm details" },
] as const;

const PURPOSE_OPTIONS = [
    {
        value: "payments" as const,
        icon: CreditCard,
        label: "💳 Payments",
        description: "Track tithes, donations, or dues",
        color: "text-green-600",
        bg: "bg-green-100 dark:bg-green-950/50",
    },
    {
        value: "records" as const,
        icon: FileText,
        label: "📄 Records",
        description: "Log attendance, notes, or updates",
        color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-950/50",
    },
    {
        value: "roles" as const,
        icon: Shield,
        label: "🛡️ Roles",
        description: "Assign positions and responsibilities",
        color: "text-purple-600",
        bg: "bg-purple-100 dark:bg-purple-950/50",
    },
    {
        value: "groups" as const,
        icon: UsersIcon,
        label: "👥 Groups",
        description: "Create teams or committees",
        color: "text-indigo-600",
        bg: "bg-indigo-100 dark:bg-indigo-950/50",
    },
    {
        value: "monitoring" as const,
        icon: Activity,
        label: "📊 Monitoring",
        description: "Track activities and checkpoints",
        color: "text-orange-600",
        bg: "bg-orange-100 dark:bg-orange-950/50",
    },
    {
        value: "other" as const,
        icon: MoreHorizontal,
        label: "📌 Other",
        description: "Custom task type",
        color: "text-gray-600",
        bg: "bg-gray-100 dark:bg-gray-950/50",
    },
];

function fireSuccessConfetti() {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdTaskSlug, setCreatedTaskSlug] = useState<string | null>(null);

    const createMutation = useCreateTaskMutation();

    const form = useForm<any>({
        defaultValues: {
            name: "",
            purpose: "payments", // ✅ FIXED 
            description: "",
            hasDuration: false,
            dateRange: undefined,
            durationType: "", // ✅ FIXED: Empty string instead of undefined
            memberIds: [],
            paymentConfig: undefined,
            recordConfig: undefined,
            monitorConfig: undefined,
        },
    });

    const { watch, setValue, trigger, reset } = form;

    const purpose = watch("purpose");
    const hasDuration = watch("hasDuration");
    const dateRange = watch("dateRange") as DateRange | undefined;
    const memberIds = watch("memberIds") as string[];

    const progress = ((step - 1) / (STEPS.length - 1)) * 100;

    async function handleNext() {
        let valid = false;

        if (step === 1) {
            valid = await trigger(["name", "purpose"]);
        } else if (step === 2) {
            if (!hasDuration) {
                valid = true;
            } else {
                valid = await trigger(["dateRange", "durationType"]);
            }
        } else if (step === 3) {
            valid = memberIds.length > 0;
            if (!valid) toast.error("Select at least one member");
        } else {
            valid = true;
        }

        if (valid) setStep((s) => s + 1);
    }

    function handleBack() {
        setStep((s) => s - 1);
    }

    async function onSubmit() {
        const values = form.getValues();

        const payload: any = {
            name: values.name,
            purpose: values.purpose,
            description: values.description || undefined,
            hasDuration: values.hasDuration,
            memberIds: values.memberIds,
        };

        if (values.hasDuration && dateRange?.from && dateRange?.to) {
            payload.startDate = format(dateRange.from, "yyyy-MM-dd");
            payload.endDate = format(dateRange.to, "yyyy-MM-dd");
            payload.durationType = values.durationType;
        }

        if (values.purpose === "payments" && values.paymentConfig) {
            payload.paymentConfig = values.paymentConfig;
        } else if (values.purpose === "records" && values.recordConfig) {
            payload.recordConfig = values.recordConfig;
        } else if (values.purpose === "monitoring" && values.monitorConfig) {
            payload.monitorConfig = values.monitorConfig;
        }

        // ✅ Log before mutation
        console.log("[CreateTaskDialog] Submitting payload:", payload);

        createMutation.mutate(payload, {
            onSuccess: (slug) => {
                console.log("[CreateTaskDialog] Success! Slug:", slug);
                setCreatedTaskSlug(slug);
                setShowSuccess(true);
                fireSuccessConfetti();
            },
            onError: (error) => {
                console.error("[CreateTaskDialog] Mutation failed:", error);
                // Don't close dialog on error so user can retry
            },
        });
    }

    function handleClose() {
        if (!createMutation.isPending) {
            reset();
            setStep(1);
            setShowSuccess(false);
            setCreatedTaskSlug(null);
            onOpenChange(false);
        }
    }

    function goToTask() {
        if (createdTaskSlug) {
            console.log("[CreateTaskDialog] Navigating to:", `/admin/task/${createdTaskSlug}`);

            // ✅ FIXED: Use window.location for safer navigation
            window.location.href = `/admin/task/${createdTaskSlug}`;
        }
    }

    function backToTasks() {
        console.log("[CreateTaskDialog] Navigating to task list");

        // ✅ FIXED: Use window.location for safer navigation
        window.location.href = "/admin/task";
    }

    if (showSuccess) {
        return (
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent side="right" className="w-full sm:max-w-lg px-0 flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
                                <PartyPopper className="h-10 w-10 text-green-600" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Task Created! 🎉</h2>
                            <p className="text-muted-foreground">
                                Your task <strong>{form.getValues("name")}</strong> has been created successfully with{" "}
                                <strong>{memberIds.length}</strong> member{memberIds.length !== 1 ? "s" : ""}.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full max-w-xs">
                            <Button onClick={goToTask} size="lg" className="w-full">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Go to Task
                            </Button>
                            <Button variant="outline" onClick={backToTasks} size="lg" className="w-full">
                                Back to All Tasks
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent side="right" className="w-full sm:max-w-2xl px-2 flex flex-col gap-0">
                {/* Header */}
                <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-muted/30 space-y-4">
                    <SheetHeader className="text-left">
                        <SheetTitle className="text-xl">Create New Task</SheetTitle>
                        <SheetDescription>
                            Set up a task to track member activities and progress.
                        </SheetDescription>
                    </SheetHeader>

                    {/* Progress Bar - ✅ FIXED: Added blue color */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                Step {step} of {STEPS.length}
                            </span>
                            <span>{Math.round(progress)}% complete</span>
                        </div>
                        <Progress
                            value={progress}
                            className="h-1.5 [&>div]:bg-blue-600"
                        />
                    </div>

                    {/* Stepper - ✅ FIXED: Blue active states */}
                    <nav aria-label="Task creation steps" className="flex items-center justify-between">
                        {STEPS.map((s, i) => {
                            const stepNum = i + 1;
                            const isActive = stepNum === step;
                            const isComplete = stepNum < step;

                            return (
                                <div key={stepNum} className="flex flex-col items-center gap-1">
                                    <div
                                        className={cn(
                                            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                                            isActive && "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20",
                                            isComplete && "bg-blue-600/20 text-blue-600",
                                            !isActive && !isComplete && "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {isComplete ? <Check className="h-3.5 w-3.5" /> : stepNum}
                                    </div>
                                    <div className="hidden sm:block text-center">
                                        <p className={cn("text-[10px] font-medium leading-none", isActive ? "text-foreground" : "text-muted-foreground")}>
                                            {s.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden min-h-0">
                    {/* STEP 1: Basic Info */}
                    {step === 1 && (
                        <ScrollArea className="h-full">
                            <div className="px-6 py-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="task-name" className="text-sm font-medium">
                                        Task Name *
                                    </Label>
                                    <Input
                                        id="task-name"
                                        placeholder="e.g., Monthly Tithe Collection"
                                        className="h-11"
                                        autoFocus
                                        {...form.register("name")}
                                    />
                                    {form.formState.errors.name && (
                                        <p className="text-sm text-destructive">{form.formState.errors.name.message as string}</p>
                                    )}
                                </div>

                                {/* ✅ FIXED: RadioGroup with controlled value */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Task Purpose *</Label>
                                    <RadioGroup
                                        value={purpose || ""}
                                        onValueChange={(v) => setValue("purpose", v, { shouldValidate: true })}
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {PURPOSE_OPTIONS.map((opt) => {
                                                const Icon = opt.icon;
                                                return (
                                                    <div key={opt.value}>
                                                        <RadioGroupItem value={opt.value} id={`purpose-${opt.value}`} className="peer sr-only" />
                                                        <Label
                                                            htmlFor={`purpose-${opt.value}`}
                                                            className={cn(
                                                                "flex flex-col items-start gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all",
                                                                "hover:bg-accent hover:border-primary/40",
                                                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                            )}
                                                        >
                                                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", opt.bg)}>
                                                                <Icon className={cn("h-5 w-5", opt.color)} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold">{opt.label}</p>
                                                                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                                                            </div>
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </RadioGroup>
                                    {form.formState.errors.purpose && (
                                        <p className="text-sm text-destructive">{form.formState.errors.purpose.message as string}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="task-desc" className="text-sm font-medium">
                                        Description <span className="text-muted-foreground font-normal">(optional)</span>
                                    </Label>
                                    <Textarea
                                        id="task-desc"
                                        placeholder="Add notes about this task..."
                                        rows={3}
                                        {...form.register("description")}
                                    />
                                </div>
                            </div>
                        </ScrollArea>
                    )}

                    {/* STEP 2: Duration */}
                    {step === 2 && (
                        <ScrollArea className="h-full">
                            <div className="px-6 py-6 space-y-6">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="has-duration" className="text-sm font-medium">
                                            Set Duration
                                        </Label>
                                        <p className="text-xs text-muted-foreground">Add start and end dates for this task</p>
                                    </div>
                                    <Switch id="has-duration" checked={hasDuration} onCheckedChange={(checked) => setValue("hasDuration", checked)} />
                                </div>

                                {hasDuration && (
                                    <>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4" />
                                                Date Range *
                                            </Label>

                                            {dateRange?.from && (
                                                <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                                                    {format(dateRange.from, "MMMM d, yyyy")}
                                                    {dateRange.to && <> → {format(dateRange.to, "MMMM d, yyyy")}</>}
                                                </p>
                                            )}

                                            <div className="border rounded-lg overflow-x-auto">
                                                <Calendar
                                                    mode="range"
                                                    defaultMonth={dateRange?.from ?? new Date()}
                                                    selected={dateRange}
                                                    onSelect={(range) => setValue("dateRange", range, { shouldValidate: true })}
                                                    numberOfMonths={1}
                                                    disabled={(date) => date < new Date("1900-01-01")}
                                                    className="mx-auto"
                                                />
                                            </div>
                                        </div>

                                        {/* ✅ FIXED: RadioGroup with controlled value */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Duration Type</Label>
                                            <RadioGroup
                                                value={watch("durationType") || ""}
                                                onValueChange={(v) => setValue("durationType", v, { shouldValidate: true })}
                                            >
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { value: "weekly", label: "Weekly" },
                                                        { value: "monthly", label: "Monthly" },
                                                        { value: "quarterly", label: "Quarterly" },
                                                        { value: "custom", label: "Custom" },
                                                    ].map((opt) => (
                                                        <div key={opt.value}>
                                                            <RadioGroupItem value={opt.value} id={`duration-${opt.value}`} className="peer sr-only" />
                                                            <Label
                                                                htmlFor={`duration-${opt.value}`}
                                                                className={cn(
                                                                    "flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all text-sm font-medium",
                                                                    "hover:bg-accent hover:border-primary/40",
                                                                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                                )}
                                                            >
                                                                {opt.label}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </>
                                )}

                                {!hasDuration && (
                                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                            <CalendarDays className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">No Duration Set</p>
                                            <p className="text-xs text-muted-foreground">This task will have no specific end date.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}

                    {/* STEP 3: Members */}
                    {step === 3 && <TaskMemberSelection selectedIds={memberIds} onSelectionChange={(ids) => setValue("memberIds", ids)} />}

                    {/* STEP 4: Configure */}
                    {step === 4 && purpose && <TaskPurposeConfig purpose={purpose} form={form} />}

                    {/* STEP 5: Review */}
                    {step === 5 && (
                        <ScrollArea className="h-full">
                            <div className="px-6 py-6 space-y-6">
                                <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                                    <h3 className="font-semibold">Review Your Task</h3>
                                    <Separator />

                                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                                        <span className="text-muted-foreground">Name</span>
                                        <span className="font-medium">{form.getValues("name")}</span>

                                        <span className="text-muted-foreground">Purpose</span>
                                        <Badge variant="secondary" className="w-fit">
                                            {PURPOSE_OPTIONS.find((p) => p.value === purpose)?.label}
                                        </Badge>

                                        {form.getValues("description") && (
                                            <>
                                                <span className="text-muted-foreground">Description</span>
                                                <span className="font-medium text-xs">{form.getValues("description")}</span>
                                            </>
                                        )}

                                        <span className="text-muted-foreground">Members</span>
                                        <span className="font-medium">{memberIds.length} selected</span>

                                        {hasDuration && dateRange?.from && dateRange?.to && (
                                            <>
                                                <span className="text-muted-foreground">Duration</span>
                                                <span className="font-medium text-xs">
                                                    {format(dateRange.from, "MMM d")} → {format(dateRange.to, "MMM d, yyyy")}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Ready to create!</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                Click "Create Task" to proceed. You can manage members and activities after creation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t bg-muted/30">
                    <Button variant="outline" onClick={step === 1 ? handleClose : handleBack} disabled={createMutation.isPending} size="sm">
                        {step === 1 ? "Cancel" : <><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Back</>}
                    </Button>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                            Step {step}/{STEPS.length}
                        </span>
                        {step < STEPS.length ? (
                            <Button onClick={handleNext} size="sm">
                                Next
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                        ) : (
                            <Button onClick={onSubmit} disabled={createMutation.isPending} size="sm" className="min-w-[120px]">
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        Creating…
                                    </>
                                ) : (
                                    "Create Task"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}