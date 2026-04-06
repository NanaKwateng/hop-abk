// components/dashboard/tasks/task-payment-tracker.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Loader2,
    Save,
    Plus,
    Trash2,
    Pencil,
    CreditCard,
    CalendarDays,
    X,
    DollarSign,
} from "lucide-react";
import {
    createTaskActivity,
    updateTaskActivity,
    deleteTaskActivity,
    getMemberTaskActivities,
} from "@/actions/task";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils/task-utils";
import type { TaskMember, TaskActivity } from "@/lib/types/task";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

interface TaskPaymentTrackerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskId: string;
    member: TaskMember;
    onActivityChange: (activities: TaskActivity[]) => void;
}

function firePaymentConfetti() {
    confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7, x: 0.5 },
        colors: ["#10b981", "#34d399", "#fbbf24"],
        gravity: 1.2,
        scalar: 0.8,
        ticks: 100,
    });
}

export function TaskPaymentTracker({
    open,
    onOpenChange,
    taskId,
    member,
    onActivityChange,
}: TaskPaymentTrackerProps) {
    const [isSaving, startSaveTransition] = useTransition();
    const [isDeleting, startDeleteTransition] = useTransition();
    const [activities, setActivities] = useState<TaskActivity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState<TaskActivity | null>(
        null
    );
    const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentMonth, setPaymentMonth] = useState("");
    const [paymentDay, setPaymentDay] = useState("");
    const [paymentYear, setPaymentYear] = useState(
        new Date().getFullYear().toString()
    );
    const [paymentPeriod, setPaymentPeriod] = useState("");

    const initials =
        (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

    useEffect(() => {
        if (!open) return;
        let cancelled = false;

        setIsLoading(true);
        getMemberTaskActivities(taskId, member.memberId)
            .then((data) => {
                if (!cancelled) {
                    const paymentActivities = data.filter(
                        (a) => a.activityType === "payment"
                    );
                    setActivities(paymentActivities);
                    onActivityChange(paymentActivities);
                }
            })
            .catch(() => {
                if (!cancelled) toast.error("Failed to load payments");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, member.memberId, taskId]);

    function resetForm() {
        setTitle("");
        setDescription("");
        setAmount("");
        setPaymentMonth("");
        setPaymentDay("");
        setPaymentYear(new Date().getFullYear().toString());
        setPaymentPeriod("");
        setEditingActivity(null);
        setShowForm(false);
    }

    function startEdit(activity: TaskActivity) {
        setEditingActivity(activity);
        setTitle(activity.title);
        setDescription(activity.description ?? "");
        setAmount(activity.amount?.toString() ?? "");
        setPaymentPeriod(activity.paymentPeriod ?? "");

        if (activity.paymentDate) {
            const d = new Date(activity.paymentDate);
            setPaymentMonth(d.getMonth().toString());
            setPaymentDay(d.getDate().toString());
            setPaymentYear(d.getFullYear().toString());
        }
        setShowForm(true);
    }

    function buildPaymentDate(): string | undefined {
        if (!paymentMonth || !paymentDay || !paymentYear) return undefined;
        const month = parseInt(paymentMonth) + 1;
        const day = parseInt(paymentDay);
        const year = parseInt(paymentYear);
        if (isNaN(month) || isNaN(day) || isNaN(year)) return undefined;
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
            2,
            "0"
        )}`;
    }

    async function handleSave() {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Valid amount is required");
            return;
        }

        const paymentDate = buildPaymentDate();

        startSaveTransition(async () => {
            try {
                if (editingActivity) {
                    const updated = await updateTaskActivity({
                        id: editingActivity.id,
                        taskId,
                        title: title.trim(),
                        description: description.trim() || undefined,
                        amount: parseFloat(amount),
                        paymentDate,
                        paymentPeriod: paymentPeriod || undefined,
                        paymentStatus: "completed",
                    });

                    const newActivities = activities.map((a) =>
                        a.id === updated.id ? updated : a
                    );
                    setActivities(newActivities);
                    onActivityChange(newActivities);
                    toast.success("Payment updated");
                } else {
                    const activity = await createTaskActivity({
                        taskId,
                        memberId: member.memberId,
                        activityType: "payment",
                        title: title.trim(),
                        description: description.trim() || undefined,
                        amount: parseFloat(amount),
                        paymentDate,
                        paymentPeriod: paymentPeriod || undefined,
                        paymentStatus: "completed",
                    });

                    const newActivities = [activity, ...activities];
                    setActivities(newActivities);
                    onActivityChange(newActivities);

                    firePaymentConfetti();
                    toast.success("Payment recorded! 🎉", {
                        description: `${member.firstName} ${member.lastName} — ${formatCurrency(
                            parseFloat(amount)
                        )}`,
                    });
                }

                resetForm();
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error("Failed to save", { description: message });
            }
        });
    }

    async function handleDeleteActivity() {
        if (!deleteActivityId) return;

        startDeleteTransition(async () => {
            try {
                await deleteTaskActivity(deleteActivityId, taskId, member.memberId);

                const newActivities = activities.filter(
                    (a) => a.id !== deleteActivityId
                );
                setActivities(newActivities);
                onActivityChange(newActivities);
                toast.success("Payment deleted");
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error("Failed to delete", { description: message });
            } finally {
                setDeleteActivityId(null);
            }
        });
    }

    function handleClose() {
        if (!isSaving && !isDeleting) {
            resetForm();
            onOpenChange(false);
        }
    }

    const isPending = isSaving || isDeleting;
    const totalAmount = activities.reduce((sum, a) => sum + (a.amount ?? 0), 0);

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-lg p-0 flex flex-col gap-0"
                >
                    <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-muted/30">
                        <SheetHeader className="text-left">
                            <SheetTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-green-600" />
                                Payment Records
                            </SheetTitle>
                            <SheetDescription asChild>
                                <div className="flex items-center gap-3 mt-2">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={member.avatarUrl || ""} />
                                        <AvatarFallback className="text-xs font-medium">
                                            {initials.toUpperCase() || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {member.firstName} {member.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {member.membershipId ?? "No ID"}
                                        </p>
                                    </div>
                                </div>
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex items-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Payments:</span>
                                <Badge variant="secondary" className="text-xs">
                                    {activities.length}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Total:</span>
                                <Badge
                                    variant="default"
                                    className="text-xs bg-green-600 hover:bg-green-700"
                                >
                                    {formatCurrency(totalAmount)}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-6 py-4 space-y-4">
                            {!showForm && (
                                <Button
                                    onClick={() => {
                                        resetForm();
                                        setShowForm(true);
                                    }}
                                    className="w-full"
                                    variant="outline"
                                    disabled={isPending}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Record Payment
                                </Button>
                            )}

                            {showForm && (
                                <div className="rounded-lg border bg-card p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">
                                            {editingActivity ? "Edit Payment" : "New Payment"}
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={resetForm}
                                            disabled={isSaving}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pay-title" className="text-xs">
                                            Title *
                                        </Label>
                                        <Input
                                            id="pay-title"
                                            placeholder="e.g., Monthly Tithe"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pay-amount" className="text-xs">
                                            Amount (GH₵) *
                                        </Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                id="pay-amount"
                                                type="number"
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="h-9 pl-8"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Payment Date
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Select value={paymentMonth} onValueChange={setPaymentMonth}>
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MONTHS.map((m, i) => (
                                                        <SelectItem key={i} value={i.toString()}>
                                                            {m}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={paymentDay} onValueChange={setPaymentDay}>
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Day" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 31 }, (_, i) => (
                                                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                            {i + 1}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                placeholder="Year"
                                                value={paymentYear}
                                                onChange={(e) => setPaymentYear(e.target.value)}
                                                className="h-9 text-xs"
                                                min="2000"
                                                max="2100"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pay-period" className="text-xs">
                                            Period (optional)
                                        </Label>
                                        <Input
                                            id="pay-period"
                                            placeholder="e.g., Week 1, Month 2"
                                            value={paymentPeriod}
                                            onChange={(e) => setPaymentPeriod(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pay-desc" className="text-xs">
                                            Description (optional)
                                        </Label>
                                        <Textarea
                                            id="pay-desc"
                                            placeholder="Add notes..."
                                            rows={2}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !title.trim() || !amount}
                                            size="sm"
                                            className="flex-1"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            {editingActivity ? "Update" : "Save"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetForm}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Separator />
                            <h4 className="text-sm font-semibold text-muted-foreground">
                                Payment History
                            </h4>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <CreditCard className="h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        No payments recorded yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="rounded-lg border bg-card p-3 space-y-2"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {activity.title}
                                                    </p>
                                                    {activity.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                            {activity.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => startEdit(activity)}
                                                        disabled={isPending}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteActivityId(activity.id)}
                                                        disabled={isPending}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                {activity.amount != null && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                                    >
                                                        {formatCurrency(activity.amount)}
                                                    </Badge>
                                                )}
                                                {activity.paymentDate && (
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="h-3 w-3" />
                                                        {format(new Date(activity.paymentDate), "MMM d, yyyy")}
                                                    </span>
                                                )}
                                                {activity.paymentPeriod && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {activity.paymentPeriod}
                                                    </Badge>
                                                )}
                                                <Badge
                                                    variant={
                                                        activity.paymentStatus === "completed"
                                                            ? "default"
                                                            : activity.paymentStatus === "cancelled"
                                                                ? "destructive"
                                                                : "secondary"
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {activity.paymentStatus ?? "completed"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <AlertDialog
                open={deleteActivityId !== null}
                onOpenChange={(open) => !open && setDeleteActivityId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete payment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this payment record. This cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteActivity}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}