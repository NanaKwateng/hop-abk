// components/admin-settings/account-settings-page.tsx
"use client";

import { useState, useTransition } from "react";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    BadgeCheck, Save, Loader2, KeyRound, Link2, Mail,
    ShieldCheck, AlertCircle, CheckCircle2,
} from "lucide-react";
import {
    updateAdminProfile,
    changeAdminEmail,
    linkMemberProfile,
} from "@/actions/admin-settings";
import { toast } from "sonner";
import type { AdminProfile } from "@/lib/types/admin-settings";
import { UserDropdown } from "../auth/UserMenu";

interface AccountSettingsPageProps {
    profile: AdminProfile;
}

export function AccountSettingsPage({ profile }: AccountSettingsPageProps) {
    const [isPending, startTransition] = useTransition();

    // ── Profile form ──
    const [firstName, setFirstName] = useState(profile.firstName ?? "");
    const [lastName, setLastName] = useState(profile.lastName ?? "");

    // ── Email change ──
    const [newEmail, setNewEmail] = useState("");
    const [emailSuccess, setEmailSuccess] = useState(false);

    // ── Member linking ──
    const [membershipId, setMembershipId] = useState("");
    const [linkResult, setLinkResult] = useState<{
        success: boolean;
        error?: string;
    } | null>(null);

    const initials = (firstName?.[0] ?? "") + (lastName?.[0] ?? "");

    // ── Save profile ──
    function handleSaveProfile() {
        startTransition(async () => {
            try {
                await updateAdminProfile({ firstName, lastName });
                toast.success("Profile updated.");
            } catch (error: any) {
                toast.error(error.message);
            }
        });
    }

    // ── Change email ──
    function handleChangeEmail() {
        if (!newEmail.trim()) return;

        startTransition(async () => {
            try {
                await changeAdminEmail(newEmail);
                setEmailSuccess(true);
                toast.success("Confirmation email sent to your new address.");
            } catch (error: any) {
                toast.error(error.message);
            }
        });
    }

    // ── Link member ──
    function handleLinkMember() {
        if (!membershipId.trim()) return;

        startTransition(async () => {
            try {
                const result = await linkMemberProfile(membershipId);
                setLinkResult(result);

                if (result.success) {
                    toast.success("Profile linked to member record!");
                } else {
                    toast.error(result.error ?? "Linking failed.");
                }
            } catch (error: any) {
                toast.error(error.message);
            }
        });
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <UserDropdown />
                <h1 className="text-2xl font-bold tracking-tight">
                    Account Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your profile, email, and member linkage.
                </p>
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* PROFILE SECTION                         */}
            {/* ═══════════════════════════════════════ */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="relative">
                            <Avatar className="h-12 w-12">
                                {profile.avatarUrl ? (
                                    <AvatarImage src={profile.avatarUrl} />
                                ) : null}
                                <AvatarFallback className="font-bold">
                                    {initials.toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background">
                                <BadgeCheck className="h-4 w-4 text-blue-500" />
                            </div>
                        </div>
                        <div>
                            <span>Your Profile</span>
                            {profile.isPrimaryAdmin && (
                                <Badge variant="default" className="ml-2 text-[10px] h-5">
                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                    Primary Admin
                                </Badge>
                            )}
                        </div>
                    </CardTitle>
                    <CardDescription>
                        {profile.email}
                        {profile.membershipId && (
                            <span className="ml-2 font-mono">
                                · {profile.membershipId}
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button onClick={handleSaveProfile} disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

            {/* ═══════════════════════════════════════ */}
            {/* EMAIL CHANGE                            */}
            {/* ═══════════════════════════════════════ */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Change Email
                    </CardTitle>
                    <CardDescription>
                        Update your login email for security. A
                        confirmation link will be sent to the new address.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Current Email</Label>
                        <Input value={profile.email} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-email">New Email</Label>
                        <Input
                            id="new-email"
                            type="email"
                            placeholder="newemail@example.com"
                            value={newEmail}
                            onChange={(e) => {
                                setNewEmail(e.target.value);
                                setEmailSuccess(false);
                            }}
                        />
                    </div>

                    {emailSuccess && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription>
                                Confirmation email sent. Check your new
                                inbox and click the link to confirm.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        variant="outline"
                        onClick={handleChangeEmail}
                        disabled={isPending || !newEmail.trim()}
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Mail className="mr-2 h-4 w-4" />
                        )}
                        Send Confirmation
                    </Button>
                </CardFooter>
            </Card>

            {/* ═══════════════════════════════════════ */}
            {/* MEMBER LINKING                          */}
            {/* ═══════════════════════════════════════ */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Link Member Record
                    </CardTitle>
                    <CardDescription>
                        Enter your Membership ID to sync your admin profile
                        with your member record. Your admin email must match
                        the member&apos;s email.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="link-mid">Membership ID</Label>
                        <div className="flex gap-2">
                            <Input
                                id="link-mid"
                                placeholder="MEM-001"
                                value={membershipId}
                                onChange={(e) => {
                                    setMembershipId(e.target.value);
                                    setLinkResult(null);
                                }}
                                className="font-mono"
                            />
                            <Button
                                onClick={handleLinkMember}
                                disabled={isPending || !membershipId.trim()}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <KeyRound className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {linkResult?.success && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription>
                                Profile synced with member record successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    {linkResult && !linkResult.success && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{linkResult.error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}