// components/dashboard/branches/edit-branch-drawer.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { updateBranch } from "@/actions/branch";
import { branchSchema, type BranchFormInput } from "@/lib/validations/branch-schema";
import { LEADER_POSITIONS, MEMBERSHIP_SIZE_OPTIONS } from "@/lib/types/branch";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Loader2, Save, Building2, MapPin, UserCircle, Phone, Mail, Home,
    Heart, Calendar, Shield, Users, Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Branch } from "@/lib/types/branch";

interface EditBranchDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branch: Branch;
}

export function EditBranchDrawer({ open, onOpenChange, branch }: EditBranchDrawerProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(branch.leaderAvatarUrl);
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
    const [customSize, setCustomSize] = useState(
        !MEMBERSHIP_SIZE_OPTIONS.some((opt) => opt.value === branch.membershipSize)
    );

    const form = useForm<BranchFormInput>({
        resolver: zodResolver(branchSchema),
        defaultValues: {
            name: branch.name,
            location: branch.location,
            address: branch.address ?? "",
            gpsAddress: branch.gpsAddress ?? "",
            gpsLat: branch.gpsLat ?? undefined,
            gpsLng: branch.gpsLng ?? undefined,
            membershipSize: branch.membershipSize,
            helpline: branch.helpline ?? "",
            yearEstablished: branch.yearEstablished ?? undefined,
            leaderPosition: branch.leaderPosition,
            leaderFullName: branch.leaderFullName,
            leaderContact: branch.leaderContact ?? "",
            leaderEmail: branch.leaderEmail ?? "",
            leaderPlaceOfStay: branch.leaderPlaceOfStay ?? "",
            leaderStatus: branch.leaderStatus ?? "single",
            spouseName: branch.spouseName ?? "",
            spouseContact: branch.spouseContact ?? "",
            spouseEmail: branch.spouseEmail ?? "",
            spousePlaceOfStay: branch.spousePlaceOfStay ?? "",
        },
    });

    const { watch, setValue, register, formState: { errors } } = form;
    const leaderPosition = watch("leaderPosition");
    const leaderStatus = watch("leaderStatus");
    const isPastorRev = leaderPosition === "pastor_rev";
    const isMarried = leaderStatus === "married" && !isPastorRev;

    const handleAvatarSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
        const reader = new FileReader();
        reader.onloadend = () => { setAvatarPreview(reader.result as string); setAvatarBase64(reader.result as string); };
        reader.readAsDataURL(file);
        e.target.value = "";
    }, []);

    async function onSubmit(data: BranchFormInput) {
        setIsSubmitting(true);
        try {
            await updateBranch({
                id: branch.id,
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
            }, avatarBase64 || undefined);

            toast.success("Branch updated!");
            onOpenChange(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={(o) => { if (!isSubmitting) onOpenChange(o); }}>
            <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col gap-0">
                <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-muted/30">
                    <SheetHeader className="text-left">
                        <SheetTitle className="text-xl flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" /> Edit Branch
                        </SheetTitle>
                        <SheetDescription>Update {branch.name}'s details.</SheetDescription>
                    </SheetHeader>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6 space-y-8 max-w-2xl mx-auto">
                        {/* Branch Info Section */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> Branch Info
                            </h3>
                            <div className="space-y-2">
                                <Label>Branch Name *</Label>
                                <Input className="h-11" {...register("name")} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Location *</Label>
                                <Input className="h-11" {...register("location")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Textarea rows={2} className="resize-none" {...register("address")} />
                            </div>
                            <div className="space-y-2">
                                <Label>GPS Address</Label>
                                <Input className="h-11" {...register("gpsAddress")} />
                            </div>
                        </section>

                        {/* Details Section */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Users className="h-4 w-4" /> Details
                            </h3>
                            <div className="space-y-2">
                                <Label>Membership Size</Label>
                                <Input type="number" min={1} className="h-11" {...register("membershipSize", { valueAsNumber: true })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Helpline</Label>
                                    <Input className="h-10" {...register("helpline")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Year Established</Label>
                                    <Input type="number" className="h-10" {...register("yearEstablished", { valueAsNumber: true })} />
                                </div>
                            </div>
                        </section>

                        {/* Leader Section */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <UserCircle className="h-4 w-4" /> Leader
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden">
                                    {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-7 h-7 text-muted-foreground" />}
                                </div>
                                <div>
                                    <Label htmlFor="edit-avatar" className="text-sm cursor-pointer text-primary hover:underline">{avatarPreview ? "Change" : "Upload"}</Label>
                                    <input id="edit-avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                                </div>
                            </div>

                            <RadioGroup value={leaderPosition} onValueChange={(v) => setValue("leaderPosition", v as any)} className="grid grid-cols-3 gap-2">
                                {LEADER_POSITIONS.map((pos) => (
                                    <div key={pos.value}>
                                        <RadioGroupItem value={pos.value} id={`edit-${pos.value}`} className="peer sr-only" />
                                        <Label htmlFor={`edit-${pos.value}`} className={cn("flex items-center justify-center rounded-xl border-2 p-2.5 cursor-pointer text-xs transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5")}>{pos.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>

                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input className="h-11" {...register("leaderFullName")} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Contact</Label><Input className="h-10" {...register("leaderContact")} /></div>
                                <div className="space-y-2"><Label>Email</Label><Input type="email" className="h-10" {...register("leaderEmail")} /></div>
                            </div>

                            {!isPastorRev && (
                                <>
                                    <div className="space-y-2"><Label>Place of Stay</Label><Input className="h-10" {...register("leaderPlaceOfStay")} /></div>
                                    <RadioGroup value={leaderStatus} onValueChange={(v) => setValue("leaderStatus", v as any)} className="flex gap-3">
                                        {["single", "married"].map((s) => (
                                            <div key={s}>
                                                <RadioGroupItem value={s} id={`edit-status-${s}`} className="peer sr-only" />
                                                <Label htmlFor={`edit-status-${s}`} className={cn("flex items-center gap-2 rounded-xl border-2 px-4 py-2 cursor-pointer text-sm transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5")}>{s.charAt(0).toUpperCase() + s.slice(1)}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>

                                    {isMarried && (
                                        <div className="space-y-4 p-4 rounded-xl bg-muted/50 border">
                                            <p className="text-sm font-medium flex items-center gap-2"><Heart className="h-4 w-4 text-pink-500" /> Spouse</p>
                                            <div className="space-y-2"><Label className="text-xs">Name</Label><Input className="h-9" {...register("spouseName")} /></div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2"><Label className="text-xs">Contact</Label><Input className="h-9" {...register("spouseContact")} /></div>
                                                <div className="space-y-2"><Label className="text-xs">Email</Label><Input className="h-9" {...register("spouseEmail")} /></div>
                                            </div>
                                            <div className="space-y-2"><Label className="text-xs">Place of Stay</Label><Input className="h-9" {...register("spousePlaceOfStay")} /></div>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    </form>
                </ScrollArea>

                <div className="shrink-0 flex items-center justify-end px-6 py-4 border-t bg-muted/30 gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting} className="min-w-[120px]">
                        {isSubmitting ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving…</> : <><Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes</>}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}