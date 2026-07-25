// components/nicknames/nickname-add-dialog.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { nicknameSchema, type NicknameInput } from "@/lib/validations/nickname";
import { useAddNicknameMutation } from "@/queries/nickname-queries";

interface NicknameAddDialogProps {
    memberId: string;
    currentNickname?: string | null;
    trigger?: React.ReactNode;
    onSuccess?: (nickname: string) => void;
}

export function NicknameAddDialog({
    memberId,
    currentNickname,
    trigger,
    onSuccess,
}: NicknameAddDialogProps) {
    const [open, setOpen] = useState(false);
    const addMutation = useAddNicknameMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<NicknameInput>({
        resolver: zodResolver(nicknameSchema),
        defaultValues: {
            nickname: currentNickname || "",
        },
    });

    const onSubmit = async (data: NicknameInput) => {
        try {
            await addMutation.mutateAsync({
                memberId,
                nickname: data.nickname,
            });
            setOpen(false);
            reset();
            if (onSuccess) {
                onSuccess(data.nickname);
            }
        } catch {
            // Error handled by mutation
        }
    };

    const defaultTrigger = trigger || (
        <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            {currentNickname ? "Edit Nickname" : "Add Nickname"}
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {currentNickname ? "Edit Nickname" : "Add Nickname"}
                    </DialogTitle>
                    <DialogDescription>
                        {currentNickname
                            ? `Update the nickname for this member.`
                            : `Assign a unique nickname that members can use to search for this person.`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nickname">Nickname</Label>
                            <Input
                                id="nickname"
                                placeholder="e.g., Pastor John, Sister Mary"
                                {...register("nickname")}
                                className={errors.nickname ? "border-destructive" : ""}
                            />
                            {errors.nickname && (
                                <p className="text-sm text-destructive">
                                    {errors.nickname.message}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Nicknames must be 2-50 characters and unique across all members.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={addMutation.isPending}>
                            {addMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {currentNickname ? "Update" : "Add"} Nickname
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}