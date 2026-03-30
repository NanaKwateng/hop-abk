// components/dashboard/branches/create-branch-drawer.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { createBranch } from "@/actions/branch";
import { geocodeAddress } from "@/lib/utils/geocode";
import { branchSchema, type BranchFormInput } from "@/lib/validations/branch-schema";
import { LEADER_POSITIONS, MEMBERSHIP_SIZE_OPTIONS } from "@/lib/types/branch";
import { AvatarCropModal } from "./avatar-crop-modal";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    ArrowRight,
    ArrowLeft,
    Check,
    MapPin,
    Building2,
    UserCircle,
    Phone,
    Mail,
    Home,
    Heart,
    Calendar,
    Shield,
    Users,
    Navigation,
    Sparkles,
    Upload,
    MapPinned,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const STEPS = [
    { label: "Branch Info", icon: Building2, description: "Name & location" },
    { label: "Details", icon: Users, description: "Size & contact" },
    { label: "Leader", icon: UserCircle, description: "Leader profile" },
    { label: "Review", icon: Check, description: "Confirm & create" },
] as const;

interface CreateBranchDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateBranchDrawer({ open, onOpenChange }: CreateBranchDrawerProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Avatar state
    const [rawAvatarFile, setRawAvatarFile] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);

    // GPS state
    const [isGeocoding, setIsGeocoding] = useState(false);

    const [customSize, setCustomSize] = useState(false);

    const form = useForm<BranchFormInput>({
        resolver: zodResolver(branchSchema),
        defaultValues: {
            name: "",
            location: "",
            address: "",
            gpsAddress: "",
            membershipSize: 50,
            helpline: "",
            leaderPosition: "elder",
            leaderFullName: "",
            leaderContact: "",
            leaderEmail: "",
            leaderPlaceOfStay: "",
            leaderStatus: "single",
            spouseName: "",
            spouseContact: "",
            spouseEmail: "",
            spousePlaceOfStay: "",
        } as BranchFormInput, // Add this type assertion
    });

    const { watch, setValue, trigger, formState: { errors }, register, getValues } =
        form;

    const leaderPosition = watch("leaderPosition");
    const leaderStatus = watch("leaderStatus");
    const isPastorRev = leaderPosition === "pastor_rev";
    const isMarried = leaderStatus === "married" && !isPastorRev;

    // Avatar upload handler - open crop modal
    const handleAvatarSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image must be under 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setRawAvatarFile(reader.result as string);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
            e.target.value = "";
        },
        []
    );

    // After crop completion
    const handleCropComplete = useCallback((croppedBase64: string) => {
        setAvatarPreview(croppedBase64);
        setAvatarBase64(croppedBase64);
        setShowCropModal(false);
        toast.success("Photo cropped successfully!");
    }, []);

    // Auto-geocode GPS from address
    const handleAutoGeocode = async () => {
        const address = getValues("address") || getValues("location");
        if (!address) {
            toast.error("Please enter an address or location first");
            return;
        }

        setIsGeocoding(true);
        toast.loading("Finding GPS coordinates...", { id: "geocode" });

        try {
            const result = await geocodeAddress(address);
            if (result) {
                setValue("gpsLat", result.lat);
                setValue("gpsLng", result.lng);
                setValue("gpsAddress", result.formattedAddress);
                toast.success("GPS coordinates found!", { id: "geocode" });
            } else {
                toast.error("Could not find coordinates", { id: "geocode" });
            }
        } catch (error) {
            toast.error("Geocoding failed", { id: "geocode" });
        } finally {
            setIsGeocoding(false);
        }
    };

    async function handleNext() {
        let valid = false;
        if (step === 1) valid = await trigger(["name", "location"]);
        if (step === 2) valid = await trigger(["membershipSize"]);
        if (step === 3)
            valid = await trigger(["leaderPosition", "leaderFullName"]);
        if (step === 4) valid = true;
        if (valid) setStep((s) => Math.min(s + 1, 4));
    }

    function handleBack() {
        setStep((s) => Math.max(s - 1, 1));
    }

    async function onSubmit() {
        const data = getValues();
        setIsSubmitting(true);

        try {
            const slug = await createBranch(
                {
                    name: data.name,
                    location: data.location,
                    address: data.address || undefined,
                    gpsAddress: data.gpsAddress || undefined,
                    gpsLat: data.gpsLat,
                    gpsLng: data.gpsLng,
                    membershipSize: data.membershipSize,
                    helpline: data.helpline || undefined,
                    yearEstablished: data.yearEstablished,
                    leaderPosition: data.leaderPosition,
                    leaderFullName: data.leaderFullName,
                    leaderContact: data.leaderContact || undefined,
                    leaderEmail: data.leaderEmail || undefined,
                    leaderPlaceOfStay: data.leaderPlaceOfStay || undefined,
                    leaderStatus: data.leaderStatus,
                    spouseName: data.spouseName || undefined,
                    spouseContact: data.spouseContact || undefined,
                    spouseEmail: data.spouseEmail || undefined,
                    spousePlaceOfStay: data.spousePlaceOfStay || undefined,
                },
                avatarBase64 || undefined
            );

            // 🎉 Confetti celebration
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ["#10b981", "#3b82f6", "#8b5cf6"],
            });

            toast.success("Branch created!", {
                description: `${data.name} has been set up successfully.`,
            });

            handleClose();
            router.push(`/admin/branches/${slug}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to create branch");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleClose() {
        if (!isSubmitting) {
            form.reset();
            setStep(1);
            setRawAvatarFile(null);
            setAvatarPreview(null);
            setAvatarBase64(null);
            setCustomSize(false);
            onOpenChange(false);
        }
    }

    const positionLabel =
        LEADER_POSITIONS.find((p) => p.value === leaderPosition)?.label ?? "";

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent
                    side="left"
                    className="h-[95vh] sm:h-[90vh] p-0 flex flex-col gap-0 rounded-b-2xl w-full max-w-md"
                >
                    {/* Header + Stepper */}
                    <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-muted/30 space-y-4">
                        <SheetHeader className="text-left">
                            <SheetTitle className="text-xl flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                Create New Branch
                            </SheetTitle>
                            <SheetDescription>
                                Set up a new branch with its leader and details.
                            </SheetDescription>
                        </SheetHeader>

                        {/* Stepper */}
                        <nav
                            className="flex items-center justify-center"
                            aria-label="Branch creation steps"
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
                                                    "h-px w-6 sm:w-12 mx-1",
                                                    isComplete ? "bg-primary" : "bg-border"
                                                )}
                                            />
                                        )}
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all",
                                                    isActive &&
                                                    "bg-primary text-primary-foreground shadow-md",
                                                    isComplete && "bg-primary/20 text-primary",
                                                    !isActive &&
                                                    !isComplete &&
                                                    "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {isComplete ? (
                                                    <Check className="h-3.5 w-3.5" />
                                                ) : (
                                                    <s.icon className="h-3.5 w-3.5" />
                                                )}
                                            </div>
                                            <div className="hidden sm:block">
                                                <p
                                                    className={cn(
                                                        "text-xs font-medium leading-none",
                                                        isActive
                                                            ? "text-foreground"
                                                            : "text-muted-foreground"
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
                    <ScrollArea className="flex-1 min-h-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                                className="px-6 py-6 max-w-2xl mx-auto"
                            >
                                {/* STEP 1: Branch Info */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="b-name"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <Building2 className="h-4 w-4 text-primary" />{" "}
                                                Branch Name *
                                            </Label>
                                            <Input
                                                id="b-name"
                                                placeholder="e.g. Accra Central Branch"
                                                className="h-11"
                                                autoFocus
                                                {...register("name")}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="b-location"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <MapPin className="h-4 w-4 text-primary" />{" "}
                                                Location *
                                            </Label>
                                            <Input
                                                id="b-location"
                                                placeholder="e.g. Accra, Greater Accra"
                                                className="h-11"
                                                {...register("location")}
                                            />
                                            {errors.location && (
                                                <p className="text-sm text-destructive">
                                                    {errors.location.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="b-address"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <Home className="h-4 w-4" /> Branch Address
                                            </Label>
                                            <Textarea
                                                id="b-address"
                                                placeholder="Full postal address..."
                                                rows={2}
                                                className="resize-none"
                                                {...register("address")}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <Navigation className="h-4 w-4" /> GPS
                                                    Coordinates{" "}
                                                    <span className="text-xs text-muted-foreground">
                                                        (optional)
                                                    </span>
                                                </Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleAutoGeocode}
                                                    disabled={isGeocoding}
                                                    className="text-xs"
                                                >
                                                    {isGeocoding ? (
                                                        <>
                                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                            Finding...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPinned className="mr-1.5 h-3.5 w-3.5" />
                                                            Auto-locate
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <Input
                                                id="b-gps"
                                                placeholder="e.g. GA-123-4567 or formatted address"
                                                className="h-11"
                                                {...register("gpsAddress")}
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Provide a GPS code, Google Maps link, or click
                                                Auto-locate to find coordinates.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: Details */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Users className="h-4 w-4 text-primary" />{" "}
                                                Membership Size *
                                            </Label>
                                            {!customSize ? (
                                                <Select
                                                    value={String(getValues("membershipSize"))}
                                                    onValueChange={(val) => {
                                                        const num = parseInt(val);
                                                        if (num === -1) {
                                                            setCustomSize(true);
                                                            setValue("membershipSize", 0);
                                                        } else {
                                                            setValue("membershipSize", num, {
                                                                shouldValidate: true,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Select size" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MEMBERSHIP_SIZE_OPTIONS.map((opt) => (
                                                            <SelectItem
                                                                key={opt.value}
                                                                value={String(opt.value)}
                                                            >
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter exact number"
                                                        className="h-11"
                                                        min={1}
                                                        {...register("membershipSize", {
                                                            valueAsNumber: true,
                                                        })}
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCustomSize(false);
                                                            setValue("membershipSize", 50);
                                                        }}
                                                    >
                                                        Preset
                                                    </Button>
                                                </div>
                                            )}
                                            {errors.membershipSize && (
                                                <p className="text-sm text-destructive">
                                                    {errors.membershipSize.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="b-helpline"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <Phone className="h-4 w-4" /> Branch Helpline
                                            </Label>
                                            <Input
                                                id="b-helpline"
                                                placeholder="e.g. +233 20 123 4567"
                                                className="h-11"
                                                {...register("helpline")}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="b-year"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <Calendar className="h-4 w-4" /> Year Established
                                            </Label>
                                            <Input
                                                id="b-year"
                                                type="number"
                                                placeholder={`e.g. ${new Date().getFullYear()}`}
                                                className="h-11"
                                                min={1800}
                                                max={new Date().getFullYear()}
                                                {...register("yearEstablished", {
                                                    valueAsNumber: true,
                                                })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: Leader */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-primary" />{" "}
                                                Leader Position *
                                            </Label>
                                            <RadioGroup
                                                value={leaderPosition}
                                                onValueChange={(val) =>
                                                    setValue("leaderPosition", val as any, {
                                                        shouldValidate: true,
                                                    })
                                                }
                                                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                                            >
                                                {LEADER_POSITIONS.map((pos) => (
                                                    <div key={pos.value}>
                                                        <RadioGroupItem
                                                            value={pos.value}
                                                            id={`pos-${pos.value}`}
                                                            className="peer sr-only"
                                                        />
                                                        <Label
                                                            htmlFor={`pos-${pos.value}`}
                                                            className={cn(
                                                                "flex items-center justify-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all text-sm",
                                                                "hover:bg-accent",
                                                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                            )}
                                                        >
                                                            {pos.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        {/* Avatar Upload with Crop */}
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-full bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden">
                                                {avatarPreview ? (
                                                    <img
                                                        src={avatarPreview}
                                                        alt="Leader"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <UserCircle className="w-8 h-8 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <Label
                                                    htmlFor="leader-avatar"
                                                    className="text-sm cursor-pointer text-primary hover:underline flex items-center gap-1.5"
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                    {avatarPreview
                                                        ? "Change photo"
                                                        : "Upload photo"}
                                                </Label>
                                                <input
                                                    id="leader-avatar"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleAvatarSelect}
                                                />
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    JPG, PNG. Max 5MB. Will be cropped.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Full Name *
                                            </Label>
                                            <Input
                                                placeholder="Leader's full name"
                                                className="h-11"
                                                {...register("leaderFullName")}
                                            />
                                            {errors.leaderFullName && (
                                                <p className="text-sm text-destructive">
                                                    {errors.leaderFullName.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm flex items-center gap-1">
                                                    <Phone className="h-3.5 w-3.5" /> Contact
                                                </Label>
                                                <Input
                                                    placeholder="+233..."
                                                    className="h-10"
                                                    {...register("leaderContact")}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm flex items-center gap-1">
                                                    <Mail className="h-3.5 w-3.5" /> Email
                                                </Label>
                                                <Input
                                                    type="email"
                                                    placeholder="email@example.com"
                                                    className="h-10"
                                                    {...register("leaderEmail")}
                                                />
                                            </div>
                                        </div>

                                        {/* Conditional fields based on position */}
                                        {!isPastorRev && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label className="text-sm flex items-center gap-1">
                                                        <Home className="h-3.5 w-3.5" /> Place of
                                                        Stay
                                                    </Label>
                                                    <Input
                                                        placeholder="e.g. East Legon, Accra"
                                                        className="h-10"
                                                        {...register("leaderPlaceOfStay")}
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-sm font-medium flex items-center gap-2">
                                                        <Heart className="h-4 w-4" /> Marital Status
                                                    </Label>
                                                    <RadioGroup
                                                        value={leaderStatus}
                                                        onValueChange={(val) =>
                                                            setValue("leaderStatus", val as any)
                                                        }
                                                        className="flex gap-3"
                                                    >
                                                        {[
                                                            { value: "single", label: "Single" },
                                                            { value: "married", label: "Married" },
                                                        ].map((s) => (
                                                            <div key={s.value}>
                                                                <RadioGroupItem
                                                                    value={s.value}
                                                                    id={`status-${s.value}`}
                                                                    className="peer sr-only"
                                                                />
                                                                <Label
                                                                    htmlFor={`status-${s.value}`}
                                                                    className={cn(
                                                                        "flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 cursor-pointer text-sm transition-all",
                                                                        "hover:bg-accent",
                                                                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                                                    )}
                                                                >
                                                                    {s.label}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>

                                                {/* Spouse fields */}
                                                {isMarried && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-4 p-4 rounded-xl bg-muted/50 border overflow-hidden"
                                                    >
                                                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                            <Heart className="h-4 w-4 text-pink-500" />{" "}
                                                            Spouse Details
                                                        </p>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">
                                                                Spouse Name
                                                            </Label>
                                                            <Input
                                                                placeholder="Full name"
                                                                className="h-9"
                                                                {...register("spouseName")}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs">
                                                                    Contact
                                                                </Label>
                                                                <Input
                                                                    placeholder="+233..."
                                                                    className="h-9"
                                                                    {...register("spouseContact")}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs">Email</Label>
                                                                <Input
                                                                    type="email"
                                                                    placeholder="email@example.com"
                                                                    className="h-9"
                                                                    {...register("spouseEmail")}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">
                                                                Place of Stay
                                                            </Label>
                                                            <Input
                                                                placeholder="Location"
                                                                className="h-9"
                                                                {...register("spousePlaceOfStay")}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* STEP 4: Review */}
                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="text-center space-y-2">
                                            <Sparkles className="h-8 w-8 text-primary mx-auto" />
                                            <h3 className="text-lg font-semibold">
                                                Review & Create
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Please review the details before creating this
                                                branch.
                                            </p>
                                        </div>

                                        <div className="rounded-xl border bg-card p-5 space-y-4">
                                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                Branch
                                            </h4>
                                            <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                                                <span className="text-muted-foreground">Name</span>
                                                <span className="font-medium">
                                                    {getValues("name") || "—"}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    Location
                                                </span>
                                                <span className="font-medium">
                                                    {getValues("location") || "—"}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    Members
                                                </span>
                                                <span className="font-medium">
                                                    {getValues("membershipSize")}
                                                </span>
                                                {getValues("yearEstablished") && (
                                                    <>
                                                        <span className="text-muted-foreground">
                                                            Established
                                                        </span>
                                                        <span className="font-medium">
                                                            {getValues("yearEstablished")}
                                                        </span>
                                                    </>
                                                )}
                                                {(getValues("gpsLat") || getValues("gpsAddress")) && (
                                                    <>
                                                        <span className="text-muted-foreground">
                                                            GPS
                                                        </span>
                                                        <span className="font-medium text-xs">
                                                            {getValues("gpsLat")
                                                                ? `${getValues("gpsLat")?.toFixed(
                                                                    4
                                                                )}, ${getValues("gpsLng")?.toFixed(
                                                                    4
                                                                )}`
                                                                : getValues("gpsAddress")}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-xl border bg-card p-5 space-y-4">
                                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                Leader
                                            </h4>
                                            <div className="flex items-center gap-3">
                                                {avatarPreview ? (
                                                    <img
                                                        src={avatarPreview}
                                                        alt="Leader"
                                                        className="w-12 h-12 rounded-full object-cover border"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                        <UserCircle className="w-6 h-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">
                                                        {getValues("leaderFullName") || "—"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {positionLabel}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                {getValues("leaderContact") && (
                                                    <>
                                                        <span className="text-muted-foreground">
                                                            Contact
                                                        </span>
                                                        <span>{getValues("leaderContact")}</span>
                                                    </>
                                                )}
                                                {getValues("leaderEmail") && (
                                                    <>
                                                        <span className="text-muted-foreground">
                                                            Email
                                                        </span>
                                                        <span>{getValues("leaderEmail")}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </ScrollArea>

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
                                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                                </>
                            )}
                        </Button>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                                Step {step}/4
                            </span>
                            {step < 4 ? (
                                <Button onClick={handleNext} size="sm">
                                    Next <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={onSubmit}
                                    disabled={isSubmitting}
                                    size="sm"
                                    className="min-w-[140px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{" "}
                                            Creating…
                                        </>
                                    ) : (
                                        "Create Branch"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Avatar Crop Modal */}
            {rawAvatarFile && (
                <AvatarCropModal
                    open={showCropModal}
                    image={rawAvatarFile}
                    onClose={() => setShowCropModal(false)}
                    onComplete={handleCropComplete}
                />
            )}
        </>
    );
}