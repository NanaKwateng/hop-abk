// src/components/dashboard/users/member-sheet.tsx

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PhoneInput } from "@/components/dashboard/users/phone-input";
import { SheetFileUpload } from "@/components/dashboard/users/sheet-file-upload";
import { blobUrlToBase64 } from "@/lib/utils/blob-to-base64";
import { generateMembershipId } from "@/lib/utils/generate-member-id";
import {
    createMemberSchema,
    addExistingMemberSchema,
    createMemberDefaults,
    addExistingDefaults,
    type CreateMemberInput,
    type AddExistingMemberInput,
} from "@/lib/validations/member-schema";
import {
    GENDER_OPTIONS,
    MEMBER_POSITION_OPTIONS,
    MEMBER_GROUP_OPTIONS,
    OCCUPATION_OPTIONS,
} from "@/lib/constants";
import {
    useCreateMemberMutation,
    useUpdateMemberMutation,
} from "@/queries/member-queries";
import type { Member, MemberFormData } from "@/lib/types";
import {
    CalendarIcon,
    UserPlusIcon,
    UserCheckIcon,
    Loader2Icon,
    Sparkles,
    RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type AddMode = "new" | "existing";

interface MemberSheetProps {
    mode: "add" | "edit";
    member?: Member;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// REMOVED: duplicate `export type CreateMemberInput = z.infer<typeof createMemberSchema>;`
// It's already imported from the schema file above.

export function MemberSheet({
    mode,
    member,
    open,
    onOpenChange,
}: MemberSheetProps) {
    const [addMode, setAddMode] = React.useState<AddMode>("new");
    const [showModeSelector, setShowModeSelector] = React.useState(
        mode === "add"
    );

    // ---- Avatar state (shared between both forms) ----
    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(
        null
    );
    const [avatarChanged, setAvatarChanged] = React.useState(false);
    const [avatarRemoved, setAvatarRemoved] = React.useState(false);

    const createMutation = useCreateMemberMutation();
    const updateMutation = useUpdateMemberMutation();
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    // ---- Full form (Create New / Edit) ----
    const fullForm = useForm<CreateMemberInput>({
        resolver: zodResolver(createMemberSchema),
        defaultValues: createMemberDefaults,
        mode: "onTouched",
    });

    // ---- Minimal form (Add Existing) ----
    const existingForm = useForm<AddExistingMemberInput>({
        resolver: zodResolver(addExistingMemberSchema),
        defaultValues: addExistingDefaults,
        mode: "onTouched",
    });

    // Reset everything when sheet opens
    React.useEffect(() => {
        if (open) {
            setShowModeSelector(mode === "add");
            setAddMode("new");
            setAvatarChanged(false);
            setAvatarRemoved(false);

            if (mode === "edit" && member) {
                fullForm.reset({
                    firstName: member.firstName,
                    lastName: member.lastName,
                    gender: member.gender || undefined,
                    phone: member.phone || "",
                    phoneCountry: member.phoneCountry || "GH",
                    placeOfStay: member.placeOfStay || "",
                    houseNumber: member.houseNumber || "",
                    memberPosition: member.memberPosition || undefined,
                    addressComments: member.addressComments || "",
                    memberGroup: member.memberGroup || undefined,
                    occupationType: member.occupationType || undefined,
                    roleComments: member.roleComments || "",
                    email: member.email || "",
                    avatarUrl: member.avatarUrl || "",
                    membershipId: member.membershipId || "",
                    registrationDate: "",
                });
                setAvatarPreview(member.avatarUrl || null);
            } else {
                fullForm.reset(createMemberDefaults);
                existingForm.reset(addExistingDefaults);
                setAvatarPreview(null);
            }
        }
    }, [open, mode, member, fullForm, existingForm]);

    // ---- Avatar handlers ----
    const handleAvatarAccept = (croppedBlobUrl: string) => {
        setAvatarPreview(croppedBlobUrl);
        setAvatarChanged(true);
        setAvatarRemoved(false);
    };

    const handleAvatarClear = () => {
        setAvatarPreview(null);
        setAvatarChanged(true);
        setAvatarRemoved(true);
    };

    // ---- Member ID handlers (full form) ----
    const handleGenerateId = React.useCallback(() => {
        const id = generateMembershipId();
        fullForm.setValue("membershipId", id, { shouldValidate: true });
    }, [fullForm]);

    const handleResetId = React.useCallback(() => {
        fullForm.setValue("membershipId", "", { shouldValidate: false });
    }, [fullForm]);

    // ---- Member ID handlers (existing form) ----
    const handleGenerateIdExisting = React.useCallback(() => {
        const id = generateMembershipId();
        existingForm.setValue("membershipId", id, { shouldValidate: true });
    }, [existingForm]);

    const handleResetIdExisting = React.useCallback(() => {
        existingForm.setValue("membershipId", "", {
            shouldValidate: false,
        });
    }, [existingForm]);

    // ---- Helper: convert avatar blob to base64 for server ----
    const getAvatarBase64 = async (): Promise<string | undefined> => {
        if (
            avatarChanged &&
            !avatarRemoved &&
            avatarPreview &&
            avatarPreview.startsWith("blob:")
        ) {
            return await blobUrlToBase64(avatarPreview);
        }
        return undefined;
    };

    // ---- Submit: Full form (Create New / Edit) ----
    const handleFullSubmit = async (values: CreateMemberInput) => {
        try {
            const avatarBase64 = await getAvatarBase64();

            const formData: MemberFormData = {
                firstName: values.firstName,
                lastName: values.lastName,
                gender: values.gender,
                phone: values.phone || undefined,
                phoneCountry: values.phoneCountry,
                placeOfStay: values.placeOfStay || undefined,
                houseNumber: values.houseNumber || undefined,
                memberPosition: values.memberPosition,
                addressComments: values.addressComments || undefined,
                memberGroup: values.memberGroup,
                occupationType: values.occupationType,
                roleComments: values.roleComments || undefined,
                email: values.email || undefined,
                membershipId: values.membershipId || undefined,
                registrationDate: values.registrationDate || undefined,
            };

            // Handle avatar removal explicitly
            if (avatarRemoved) {
                formData.avatarUrl = "";
            }

            if (mode === "add") {
                await createMutation.mutateAsync({
                    data: formData,
                    avatarBase64,
                });
            } else if (mode === "edit" && member) {
                await updateMutation.mutateAsync({
                    id: member.id,
                    data: formData,
                    avatarBase64,
                });
            }

            // Clean up blob URL
            if (avatarPreview && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }

            onOpenChange(false);
        } catch {
            // Error handled by mutation onError — keeps sheet open
        }
    };

    // ---- Submit: Existing member form ----
    const handleExistingSubmit = async (values: AddExistingMemberInput) => {
        try {
            const avatarBase64 = await getAvatarBase64();

            const formData: MemberFormData = {
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone || undefined,
                phoneCountry: values.phoneCountry,
                memberPosition: values.memberPosition,
                memberGroup: values.memberGroup,
                membershipId: values.membershipId || undefined,
            };

            await createMutation.mutateAsync({
                data: formData,
                avatarBase64,
            });

            // Clean up blob URL
            if (avatarPreview && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }

            onOpenChange(false);
        } catch {
            // Error handled by mutation onError
        }
    };

    // ---- Mode selector ----
    const handleModeSelect = (selectedMode: AddMode) => {
        setAddMode(selectedMode);
        setShowModeSelector(false);
        // Reset avatar when switching modes
        setAvatarPreview(null);
        setAvatarChanged(false);
        setAvatarRemoved(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:w-[50vw] sm:max-w-[50vw] px-3"
            >
                <SheetHeader className="px-6 pt-6 pb-4">
                    <SheetTitle>
                        {mode === "edit"
                            ? "Edit Member"
                            : showModeSelector
                                ? "Add Member"
                                : addMode === "new"
                                    ? "Register New Member"
                                    : "Add Existing Member"}
                    </SheetTitle>
                    <SheetDescription>
                        {mode === "edit"
                            ? `Update ${member?.firstName} ${member?.lastName}'s information.`
                            : showModeSelector
                                ? "Choose how you want to add a member."
                                : addMode === "new"
                                    ? "Fill in all details for a completely new member."
                                    : "Quick-add a member who already attends but isn't registered."}
                    </SheetDescription>
                </SheetHeader>

                <Separator />

                <ScrollArea className="h-[calc(100vh-10rem)] px-6">
                    {/* ======== MODE SELECTOR (Add only) ======== */}
                    {mode === "add" && showModeSelector && (
                        <div className="grid gap-4 py-8">
                            <button
                                type="button"
                                onClick={() => handleModeSelect("new")}
                                className="flex items-start gap-4 rounded-lg border-2 p-6 text-left transition-colors hover:border-primary hover:bg-primary/5"
                            >
                                <div className="rounded-full bg-primary/10 p-3">
                                    <UserPlusIcon className="size-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Create New Member</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Register a completely new member with full details
                                        including personal info, address, roles, and photo.
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleModeSelect("existing")}
                                className="flex items-start gap-4 rounded-lg border-2 p-6 text-left transition-colors hover:border-primary hover:bg-primary/5"
                            >
                                <div className="rounded-full bg-primary/10 p-3">
                                    <UserCheckIcon className="size-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Add Existing Member</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Quick-register someone who already attends the church
                                        but hasn&apos;t been added to the system yet.
                                    </p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* ======== FULL FORM (Create New / Edit) ======== */}
                    {(mode === "edit" ||
                        (mode === "add" &&
                            !showModeSelector &&
                            addMode === "new")) && (
                            <form
                                onSubmit={fullForm.handleSubmit(handleFullSubmit)}
                                className="space-y-6 py-6"
                            >
                                {/* Registration Date — ADD mode only */}
                                {mode === "add" && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Registration Date</Label>
                                            <DatePickerField
                                                value={fullForm.watch("registrationDate")}
                                                onChange={(date) =>
                                                    fullForm.setValue("registrationDate", date, {
                                                        shouldValidate: true,
                                                    })
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Select the date this member is being registered.
                                            </p>
                                        </div>
                                        <Separator />
                                    </>
                                )}

                                {/* Profile Photo */}
                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold">
                                        Profile Photo
                                    </legend>
                                    <SheetFileUpload
                                        currentPreview={avatarPreview}
                                        onAccept={handleAvatarAccept}
                                        onClear={handleAvatarClear}
                                    />
                                </fieldset>

                                <Separator />

                                {/* Personal Information */}
                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold">
                                        Personal Information
                                    </legend>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            label="First Name"
                                            required
                                            error={
                                                fullForm.formState.errors.firstName?.message
                                            }
                                        >
                                            <Input
                                                placeholder="Brian"
                                                {...fullForm.register("firstName")}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Last Name"
                                            required
                                            error={
                                                fullForm.formState.errors.lastName?.message
                                            }
                                        >
                                            <Input
                                                placeholder="Richardson"
                                                {...fullForm.register("lastName")}
                                            />
                                        </FormField>
                                    </div>

                                    <FormField
                                        label="Email"
                                        error={fullForm.formState.errors.email?.message}
                                    >
                                        <Input
                                            type="email"
                                            placeholder="member@example.com"
                                            {...fullForm.register("email")}
                                        />
                                    </FormField>

                                    <FormField
                                        label="Phone"
                                        error={fullForm.formState.errors.phone?.message}
                                    >
                                        <PhoneInput
                                            value={fullForm.watch("phone") || ""}
                                            country={fullForm.watch("phoneCountry") || "GH"}
                                            onValueChange={(val) =>
                                                fullForm.setValue("phone", val, {
                                                    shouldValidate: true,
                                                })
                                            }
                                            onCountryChange={(c) =>
                                                fullForm.setValue("phoneCountry", c)
                                            }
                                            error={fullForm.formState.errors.phone?.message}
                                        />
                                    </FormField>

                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <RadioGroup
                                            value={fullForm.watch("gender")}
                                            onValueChange={(val) =>
                                                fullForm.setValue(
                                                    "gender",
                                                    val as "male" | "female",
                                                    { shouldValidate: true }
                                                )
                                            }
                                            className="flex gap-6"
                                        >
                                            {GENDER_OPTIONS.map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <RadioGroupItem
                                                        value={opt.value}
                                                        id={`gender-${opt.value}`}
                                                    />
                                                    <Label htmlFor={`gender-${opt.value}`}>
                                                        {opt.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                </fieldset>

                                <Separator />

                                {/* Address */}
                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold">
                                        Address Details
                                    </legend>

                                    <FormField
                                        label="Place of Stay"
                                        error={
                                            fullForm.formState.errors.placeOfStay?.message
                                        }
                                    >
                                        <Input
                                            placeholder="Abuakwa 06"
                                            {...fullForm.register("placeOfStay")}
                                        />
                                    </FormField>

                                    <FormField
                                        label="House Number"
                                        error={
                                            fullForm.formState.errors.houseNumber?.message
                                        }
                                    >
                                        <Input
                                            placeholder="A7 000 000"
                                            {...fullForm.register("houseNumber")}
                                        />
                                    </FormField>

                                    <FormField label="Address Comments">
                                        <Textarea
                                            placeholder="Additional address notes..."
                                            className="resize-none"
                                            {...fullForm.register("addressComments")}
                                        />
                                    </FormField>
                                </fieldset>

                                <Separator />

                                {/* Roles */}
                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold">
                                        Roles &amp; Groups
                                    </legend>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Position</Label>
                                            <Select
                                                value={fullForm.watch("memberPosition")}
                                                onValueChange={(val) =>
                                                    fullForm.setValue(
                                                        "memberPosition",
                                                        val as CreateMemberInput["memberPosition"],
                                                        { shouldValidate: true }
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MEMBER_POSITION_OPTIONS.map((opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Group</Label>
                                            <Select
                                                value={fullForm.watch("memberGroup")}
                                                onValueChange={(val) =>
                                                    fullForm.setValue(
                                                        "memberGroup",
                                                        val as CreateMemberInput["memberGroup"],
                                                        { shouldValidate: true }
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MEMBER_GROUP_OPTIONS.map((opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Occupation</Label>
                                        <Select
                                            value={fullForm.watch("occupationType")}
                                            onValueChange={(val) =>
                                                fullForm.setValue(
                                                    "occupationType",
                                                    val as CreateMemberInput["occupationType"],
                                                    { shouldValidate: true }
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select occupation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {OCCUPATION_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <FormField label="Role Comments">
                                        <Textarea
                                            placeholder="Additional role or duty notes..."
                                            className="resize-none"
                                            {...fullForm.register("roleComments")}
                                        />
                                    </FormField>
                                </fieldset>

                                <Separator />

                                {/* Membership ID with Generate */}
                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold">
                                        Membership Identification
                                    </legend>
                                    <p className="text-xs text-muted-foreground">
                                        Generate a unique ID or enter one manually. Format:{" "}
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                                            HOP-ABK-001
                                        </code>
                                    </p>

                                    <FormField
                                        label="Membership ID"
                                        error={
                                            fullForm.formState.errors.membershipId?.message
                                        }
                                    >
                                        <Input
                                            placeholder="HOP-ABK-001"
                                            className="font-mono uppercase tracking-wider"
                                            {...fullForm.register("membershipId")}
                                            onChange={(e) => {
                                                const upper = e.target.value.toUpperCase();
                                                fullForm.setValue("membershipId", upper, {
                                                    shouldValidate: true,
                                                });
                                            }}
                                            value={fullForm.watch("membershipId") || ""}
                                        />
                                    </FormField>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResetId}
                                            disabled={!fullForm.watch("membershipId")}
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Reset
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleGenerateId}
                                        >
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate
                                        </Button>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Format: <strong>CHURCH-BRANCH-NUMBER</strong>.
                                        Example: HOP-ABK-001 = House of Prayer, Abuakwa
                                        branch, member #001.
                                    </p>
                                </fieldset>

                                {/* Submit */}
                                <div className="flex justify-end gap-3 pt-4 pb-8">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2Icon className="mr-2 size-4 animate-spin" />
                                                {mode === "add"
                                                    ? "Registering..."
                                                    : "Saving..."}
                                            </>
                                        ) : mode === "add" ? (
                                            "Register Member"
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}

                    {/* ======== EXISTING MEMBER FORM (Add only) ======== */}
                    {mode === "add" &&
                        !showModeSelector &&
                        addMode === "existing" && (
                            <form
                                onSubmit={existingForm.handleSubmit(handleExistingSubmit)}
                                className="space-y-6 py-6"
                            >
                                {/* Profile Photo — also available for existing members */}
                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold">
                                        Profile Photo
                                    </legend>
                                    <SheetFileUpload
                                        currentPreview={avatarPreview}
                                        onAccept={handleAvatarAccept}
                                        onClear={handleAvatarClear}
                                    />
                                </fieldset>

                                <Separator />

                                {/* Basic Information */}
                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold">
                                        Basic Information
                                    </legend>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            label="First Name"
                                            required
                                            error={
                                                existingForm.formState.errors.firstName
                                                    ?.message
                                            }
                                        >
                                            <Input
                                                placeholder="Brian"
                                                {...existingForm.register("firstName")}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Last Name"
                                            required
                                            error={
                                                existingForm.formState.errors.lastName
                                                    ?.message
                                            }
                                        >
                                            <Input
                                                placeholder="Richardson"
                                                {...existingForm.register("lastName")}
                                            />
                                        </FormField>
                                    </div>

                                    <FormField
                                        label="Phone"
                                        error={
                                            existingForm.formState.errors.phone?.message
                                        }
                                    >
                                        <PhoneInput
                                            value={existingForm.watch("phone") || ""}
                                            country={
                                                existingForm.watch("phoneCountry") || "GH"
                                            }
                                            onValueChange={(val) =>
                                                existingForm.setValue("phone", val, {
                                                    shouldValidate: true,
                                                })
                                            }
                                            onCountryChange={(c) =>
                                                existingForm.setValue("phoneCountry", c)
                                            }
                                            error={
                                                existingForm.formState.errors.phone?.message
                                            }
                                        />
                                    </FormField>
                                </fieldset>

                                <Separator />

                                {/* Church Details */}
                                <fieldset className="space-y-4">
                                    <legend className="text-sm font-semibold">
                                        Church Details
                                    </legend>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Position</Label>
                                            <Select
                                                value={existingForm.watch("memberPosition")}
                                                onValueChange={(val) =>
                                                    existingForm.setValue(
                                                        "memberPosition",
                                                        val as AddExistingMemberInput["memberPosition"],
                                                        { shouldValidate: true }
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MEMBER_POSITION_OPTIONS.map((opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Group</Label>
                                            <Select
                                                value={existingForm.watch("memberGroup")}
                                                onValueChange={(val) =>
                                                    existingForm.setValue(
                                                        "memberGroup",
                                                        val as AddExistingMemberInput["memberGroup"],
                                                        { shouldValidate: true }
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select group" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MEMBER_GROUP_OPTIONS.map((opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Membership ID with Generate */}
                                    <FormField
                                        label="Membership ID"
                                        error={
                                            existingForm.formState.errors.membershipId
                                                ?.message
                                        }
                                    >
                                        <Input
                                            placeholder="HOP-ABK-001"
                                            className="font-mono uppercase tracking-wider"
                                            {...existingForm.register("membershipId")}
                                            onChange={(e) => {
                                                const upper = e.target.value.toUpperCase();
                                                existingForm.setValue("membershipId", upper, {
                                                    shouldValidate: true,
                                                });
                                            }}
                                            value={
                                                existingForm.watch("membershipId") || ""
                                            }
                                        />
                                    </FormField>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResetIdExisting}
                                            disabled={
                                                !existingForm.watch("membershipId")
                                            }
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Reset
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleGenerateIdExisting}
                                        >
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate
                                        </Button>
                                    </div>
                                </fieldset>

                                {/* Submit */}
                                <div className="flex justify-end gap-3 pt-4 pb-8">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowModeSelector(true)}
                                        disabled={isSubmitting}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2Icon className="mr-2 size-4 animate-spin" />
                                                Registering...
                                            </>
                                        ) : (
                                            "Register Member"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

// ---- Helper Components ----

function FormField({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label>
                {label}
                {required && <span className="text-destructive"> *</span>}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function DatePickerField({
    value,
    onChange,
}: {
    value?: string;
    onChange: (date: string) => void;
}) {
    const [open, setOpen] = React.useState(false);
    const selectedDate = value ? new Date(value) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 size-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                        if (date) {
                            onChange(date.toISOString());
                            setOpen(false);
                        }
                    }}
                    initialFocus
                    disabled={(date) => date > new Date()}
                />
            </PopoverContent>
        </Popover>
    );
}