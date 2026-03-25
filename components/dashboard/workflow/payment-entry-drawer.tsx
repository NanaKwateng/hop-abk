// components/dashboard/workflow/payment-entry-drawer.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
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
    Check,
} from "lucide-react";
import {
    createWorkflowEntry,
    updateWorkflowEntry,
    deleteWorkflowEntry,
    getMemberWorkflowEntries,
} from "@/actions/workflow";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type {
    WorkflowMember,
    WorkflowEntry,
} from "@/lib/types/workflow";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

interface PaymentEntryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workflowId: string;
    member: WorkflowMember;
    onEntryChange: (entries: WorkflowEntry[]) => void;
}

export function PaymentEntryDrawer({
    open,
    onOpenChange,
    workflowId,
    member,
    onEntryChange,
}: PaymentEntryDrawerProps) {
    const [isPending, startTransition] = useTransition();
    const [entries, setEntries] = useState<WorkflowEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingEntry, setEditingEntry] = useState<WorkflowEntry | null>(null);
    const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [amountToPay, setAmountToPay] = useState("");
    const [paymentMonth, setPaymentMonth] = useState("");
    const [paymentDay, setPaymentDay] = useState("");
    const [paymentYear, setPaymentYear] = useState(
        new Date().getFullYear().toString()
    );

    const initials =
        (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

    // Load member entries on open
    useEffect(() => {
        if (open && member) {
            setIsLoading(true);
            getMemberWorkflowEntries(workflowId, member.memberId)
                .then((data) => {
                    setEntries(data);
                })
                .catch((err) => {
                    toast.error("Failed to load entries");
                    console.error(err);
                })
                .finally(() => setIsLoading(false));
        }
    }, [open, member, workflowId]);

    function resetForm() {
        setTitle("");
        setDescription("");
        setAmount("");
        setAmountToPay("");
        setPaymentMonth("");
        setPaymentDay("");
        setPaymentYear(new Date().getFullYear().toString());
        setEditingEntry(null);
        setShowForm(false);
    }

    function startEdit(entry: WorkflowEntry) {
        setEditingEntry(entry);
        setTitle(entry.title);
        setDescription(entry.description ?? "");
        setAmount(entry.amount?.toString() ?? "");
        setAmountToPay("");

        if (entry.paymentDate) {
            const d = new Date(entry.paymentDate);
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
        return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    async function handleSave() {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        const paymentDate = buildPaymentDate();

        startTransition(async () => {
            try {
                if (editingEntry) {
                    const updated = await updateWorkflowEntry({
                        id: editingEntry.id,
                        workflowId,
                        title: title.trim(),
                        description: description.trim() || undefined,
                        amount: amount ? parseFloat(amount) : undefined,
                        paymentDate,
                        status: editingEntry.status,
                    });

                    setEntries((prev) =>
                        prev.map((e) => (e.id === updated.id ? updated : e))
                    );
                    toast.success("Payment updated");
                } else {
                    const entry = await createWorkflowEntry({
                        workflowId,
                        memberId: member.memberId,
                        title: title.trim(),
                        description: description.trim() || undefined,
                        amount: amount ? parseFloat(amount) : undefined,
                        entryType: "payment",
                        paymentDate,
                        status: "pending",
                    });

                    setEntries((prev) => [entry, ...prev]);
                    toast.success("Payment recorded");
                }

                onEntryChange(entries);
                resetForm();
            } catch (error: any) {
                toast.error("Failed to save", { description: error.message });
            }
        });
    }

    async function handleDeleteEntry() {
        if (!deleteEntryId) return;

        startTransition(async () => {
            try {
                await deleteWorkflowEntry(deleteEntryId, workflowId);
                setEntries((prev) => prev.filter((e) => e.id !== deleteEntryId));
                onEntryChange(entries.filter((e) => e.id !== deleteEntryId));
                toast.success("Entry deleted");
            } catch (error: any) {
                toast.error("Failed to delete", { description: error.message });
            } finally {
                setDeleteEntryId(null);
            }
        });
    }

    function handleClose() {
        if (!isPending) {
            resetForm();
            onOpenChange(false);
        }
    }

    const totalAmount = entries.reduce(
        (sum, e) => sum + (e.amount ?? 0),
        0
    );

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-lg p-0 flex flex-col gap-0"
                >
                    {/* Header */}
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

                        {/* Stats bar */}
                        <div className="flex items-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Entries:</span>
                                <Badge variant="secondary" className="text-xs">
                                    {entries.length}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Total:</span>
                                <Badge
                                    variant="default"
                                    className="text-xs bg-green-600 hover:bg-green-700"
                                >
                                    GH₵ {totalAmount.toFixed(2)}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-6 py-4 space-y-4">
                            {/* Add payment button */}
                            {!showForm && (
                                <Button
                                    onClick={() => {
                                        resetForm();
                                        setShowForm(true);
                                    }}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Payment
                                </Button>
                            )}

                            {/* Payment form */}
                            {showForm && (
                                <div className="rounded-lg border bg-card p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">
                                            {editingEntry ? "Edit Payment" : "New Payment"}
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={resetForm}
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
                                        <Label htmlFor="pay-desc" className="text-xs">
                                            Description
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

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="pay-amount" className="text-xs">
                                                Amount (GH₵)
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
                                            <Label htmlFor="pay-to-pay" className="text-xs">
                                                Amount to Pay (GH₵)
                                            </Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                <Input
                                                    id="pay-to-pay"
                                                    type="number"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                    value={amountToPay}
                                                    onChange={(e) => setAmountToPay(e.target.value)}
                                                    className="h-9 pl-8"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date selection */}
                                    <div className="space-y-2">
                                        <Label className="text-xs flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Payment Date
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Select
                                                value={paymentMonth}
                                                onValueChange={setPaymentMonth}
                                            >
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

                                            <Select
                                                value={paymentDay}
                                                onValueChange={setPaymentDay}
                                            >
                                                <SelectTrigger className="h-9 text-xs">
                                                    <SelectValue placeholder="Day" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 31 }, (_, i) => (
                                                        <SelectItem
                                                            key={i + 1}
                                                            value={(i + 1).toString()}
                                                        >
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

                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isPending || !title.trim()}
                                            size="sm"
                                            className="flex-1"
                                        >
                                            {isPending ? (
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            {editingEntry ? "Update" : "Save"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetForm}
                                            disabled={isPending}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Entries list */}
                            <Separator />
                            <h4 className="text-sm font-semibold text-muted-foreground">
                                Payment History
                            </h4>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : entries.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <CreditCard className="h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        No payments recorded yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {entries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="rounded-lg border bg-card p-3 space-y-2"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {entry.title}
                                                    </p>
                                                    {entry.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                            {entry.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => startEdit(entry)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteEntryId(entry.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                {entry.amount != null && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                                    >
                                                        GH₵ {entry.amount.toFixed(2)}
                                                    </Badge>
                                                )}
                                                {entry.paymentDate && (
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="h-3 w-3" />
                                                        {format(
                                                            new Date(entry.paymentDate),
                                                            "MMM d, yyyy"
                                                        )}
                                                    </span>
                                                )}
                                                <Badge
                                                    variant={
                                                        entry.status === "completed"
                                                            ? "default"
                                                            : entry.status === "cancelled"
                                                                ? "destructive"
                                                                : "secondary"
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {entry.status}
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

            {/* Delete dialog */}
            <AlertDialog
                open={deleteEntryId !== null}
                onOpenChange={(open) => !open && setDeleteEntryId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete payment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this payment record. This
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteEntry}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}