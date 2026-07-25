// components/nicknames/nickname-manage.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { NicknameAddDialog } from "./nickname-add-dialog";
import { useRemoveNicknameMutation } from "@/queries/nickname-queries";
import { Pencil, Trash2 } from "lucide-react";

interface NicknameManageProps {
    memberId: string;
    nickname: string | null;
    memberName: string;
}

export function NicknameManage({
    memberId,
    nickname,
    memberName,
}: NicknameManageProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const removeMutation = useRemoveNicknameMutation();

    const handleRemove = async () => {
        await removeMutation.mutateAsync({ memberId });
        setShowDeleteDialog(false);
        router.refresh();
    };

    if (nickname) {
        return (
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                    @{nickname}
                </Badge>
                <NicknameAddDialog
                    memberId={memberId}
                    currentNickname={nickname}
                    onSuccess={() => router.refresh()}
                    trigger={
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                    }
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>

                {/* Delete Confirmation */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove Nickname?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove the nickname &quot;{nickname}&quot; from{" "}
                                <strong>{memberName}</strong>. Members will no longer be able
                                to search for them using this nickname.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleRemove}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={removeMutation.isPending}
                            >
                                {removeMutation.isPending ? "Removing..." : "Remove Nickname"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    return (
        <NicknameAddDialog
            memberId={memberId}
            onSuccess={() => router.refresh()}
        />
    );
}