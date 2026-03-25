// src/components/users/user-dialog-form.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// ✅ FIXED: Imported the actual schema and types you provided
import {
    createMemberSchema,
    createMemberDefaults,
    type CreateMemberInput
} from "@/lib/validations/member-schema";

import {
    GENDER_OPTIONS,
    MEMBER_POSITION_OPTIONS,
    MEMBER_GROUP_OPTIONS,
    OCCUPATION_OPTIONS,
} from "@/lib/constants";

// ✅ FIXED: Using the unified Member type
import type { Member } from "@/lib/types";

// ✅ FIXED: Imported the correct member queries
import {
    useCreateMemberMutation,
    useUpdateMemberMutation,
} from "@/queries/member-queries";

import { PlusIcon } from "lucide-react";

interface UserDialogFormProps {
    mode: "add" | "edit";
    user?: Member;                      // User data for edit mode
    trigger?: React.ReactNode;          // Custom trigger button
    open?: boolean;                     // Controlled open state
    onOpenChange?: (open: boolean) => void;
}

export function UserDialogForm({
    mode,
    user,
    trigger,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: UserDialogFormProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen ?? internalOpen;
    const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

    // TanStack Query mutations
    const createMutation = useCreateMemberMutation();
    const updateMutation = useUpdateMemberMutation();

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    // ✅ FIXED: Hooked up Zod with CreateMemberInput
    const form = useForm<CreateMemberInput>({
        resolver: zodResolver(createMemberSchema),
        defaultValues: user
            ? {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",             // Fixed property name
                phoneCountry: user.phoneCountry || "GH", // Required by schema
                gender: user.gender || undefined,
                placeOfStay: user.placeOfStay || "",
                houseNumber: user.houseNumber || "",
                memberPosition: user.memberPosition || undefined,
                memberGroup: user.memberGroup || undefined,
                occupationType: user.occupationType || undefined, // Fixed property name
                avatarUrl: user.avatarUrl || "",     // Fixed property name
                addressComments: user.addressComments || "",
                roleComments: user.roleComments || "",
            }
            : createMemberDefaults,
    });

    React.useEffect(() => {
        if (open) {
            form.reset(
                user
                    ? {
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        phoneCountry: user.phoneCountry || "GH",
                        gender: user.gender || undefined,
                        placeOfStay: user.placeOfStay || "",
                        houseNumber: user.houseNumber || "",
                        memberPosition: user.memberPosition || undefined,
                        memberGroup: user.memberGroup || undefined,
                        occupationType: user.occupationType || undefined,
                        avatarUrl: user.avatarUrl || "",
                        addressComments: user.addressComments || "",
                        roleComments: user.roleComments || "",
                    }
                    : createMemberDefaults
            );
        }
    }, [open, user, form]);

    const onSubmit = async (values: CreateMemberInput) => {
        try {
            // ✅ FIXED: Match mutation payload signature { data, avatarBase64? }
            if (mode === "add") {
                await createMutation.mutateAsync({ data: values });
            } else if (mode === "edit" && user) {
                await updateMutation.mutateAsync({ id: user.id, data: values });
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Mutation failed", error);
        }
    };

    const defaultTrigger =
        mode === "add" ? (
            <Button>
                <PlusIcon className="mr-2 size-4" />
                Add New Member
            </Button>
        ) : undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {(trigger || defaultTrigger) && (
                <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            )}
            <DialogContent className="max-h-[90vh] sm:max-w-[600px]">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "add" ? "Add New Member" : `Edit Member — ${user?.membershipId || user?.id.slice(0, 8)}`}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === "add"
                                ? "Fill in the details to add a new member."
                                : "Update the member's information. Click save when done."}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="grid gap-4 py-4">
                            {/* --- Row 1: First Name & Last Name --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">
                                        First Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Enter first name"
                                        {...form.register("firstName")}
                                        className={form.formState.errors.firstName ? "border-destructive" : ""}
                                    />
                                    {form.formState.errors.firstName && (
                                        <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">
                                        Last Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Enter last name"
                                        {...form.register("lastName")}
                                        className={form.formState.errors.lastName ? "border-destructive" : ""}
                                    />
                                    {form.formState.errors.lastName && (
                                        <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* --- Row 2: Email & Phone --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        {...form.register("email")}
                                        className={form.formState.errors.email ? "border-destructive" : ""}
                                    />
                                    {form.formState.errors.email && (
                                        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        placeholder="024-XXX-XXXX"
                                        {...form.register("phone")}
                                        className={form.formState.errors.phone ? "border-destructive" : ""}
                                    />
                                    {form.formState.errors.phone && (
                                        <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* --- Row 3: Gender & Occupation --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select
                                        value={form.watch("gender")}
                                        onValueChange={(val) =>
                                            form.setValue("gender", val as CreateMemberInput["gender"], { shouldValidate: true })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GENDER_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Occupation</Label>
                                    <Select
                                        value={form.watch("occupationType")}
                                        onValueChange={(val) =>
                                            form.setValue("occupationType", val as CreateMemberInput["occupationType"], { shouldValidate: true })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {OCCUPATION_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* --- Row 4: Place of Stay & House Number --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="placeOfStay">Place of Stay</Label>
                                    <Input
                                        id="placeOfStay"
                                        placeholder="Enter location"
                                        {...form.register("placeOfStay")}
                                        className={form.formState.errors.placeOfStay ? "border-destructive" : ""}
                                    />
                                    {form.formState.errors.placeOfStay && (
                                        <p className="text-xs text-destructive">{form.formState.errors.placeOfStay.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="houseNumber">House Number</Label>
                                    <Input
                                        id="houseNumber"
                                        placeholder="e.g. Block A-123"
                                        {...form.register("houseNumber")}
                                        className={form.formState.errors.houseNumber ? "border-destructive" : ""}
                                    />
                                    {form.formState.errors.houseNumber && (
                                        <p className="text-xs text-destructive">{form.formState.errors.houseNumber.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* --- Row 5: Position & Group --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Select
                                        value={form.watch("memberPosition")}
                                        onValueChange={(val) =>
                                            form.setValue("memberPosition", val as CreateMemberInput["memberPosition"], { shouldValidate: true })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MEMBER_POSITION_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Group</Label>
                                    <Select
                                        value={form.watch("memberGroup")}
                                        onValueChange={(val) =>
                                            form.setValue("memberGroup", val as CreateMemberInput["memberGroup"], { shouldValidate: true })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MEMBER_GROUP_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* --- Row 6: Profile Image (optional) --- */}
                            <div className="space-y-2">
                                <Label htmlFor="avatarUrl">Profile Image URL (optional)</Label>
                                <Input
                                    id="avatarUrl"
                                    placeholder="https://example.com/image.jpg"
                                    {...form.register("avatarUrl")}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to auto-generate an avatar from initials.
                                </p>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? mode === "add"
                                    ? "Adding..."
                                    : "Saving..."
                                : mode === "add"
                                    ? "Add Member"
                                    : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}