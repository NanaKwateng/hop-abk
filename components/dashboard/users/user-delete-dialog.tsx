// src/components/dashboard/users/user-delete-dialog.tsx

"use client";

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
import type { Member } from "@/lib/types";

interface UserDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    member?: Member | null;
    count?: number;
    isLoading?: boolean;
}

export function UserDeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    member,
    count,
    isLoading = false,
}: UserDeleteDialogProps) {
    const isBulk = !member && count && count > 0;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isBulk
                            ? `Delete ${count} members?`
                            : "Delete this member?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isBulk ? (
                            <>
                                This will permanently delete{" "}
                                <span className="font-semibold">{count} members</span>{" "}
                                from the system. This action cannot be undone.
                            </>
                        ) : member ? (
                            <>
                                This will permanently delete{" "}
                                <span className="font-semibold">
                                    {member.firstName} {member.lastName}
                                </span>
                                {member.membershipId && ` (${member.membershipId})`} from
                                the system. This action cannot be undone.
                            </>
                        ) : (
                            "This action cannot be undone."
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Deleting..."
                            : isBulk
                                ? `Delete ${count} Members`
                                : "Delete Member"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}