// components/dashboard/customization/customization-panel.tsx
"use client";

import { useState } from "react";
import { useCustomization } from "@/lib/context/customization-context";
import { THEME_COLORS, FONT_OPTIONS, RADIUS_OPTIONS } from "@/lib/config/theme-colors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Palette,
    RotateCcw,
    Sparkles,
    Sun,
    Moon,
    Monitor,
    Type,
    RectangleHorizontal,
    Accessibility,
    Eye,
    Check,
    Search,
    Star,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AppMode } from "@/lib/types/customization";

// ═══════════════════════════════════════════
// MODE OPTIONS
// ═══════════════════════════════════════════

const MODES: {
    id: AppMode;
    label: string;
    icon: typeof Sun;
    description: string;
}[] = [
        {
            id: "light",
            label: "Light",
            icon: Sun,
            description: "Always use light mode",
        },
        {
            id: "dark",
            label: "Dark",
            icon: Moon,
            description: "Always use dark mode",
        },
        {
            id: "auto",
            label: "Auto",
            icon: Monitor,
            description: "Switches at 6 AM / 6 PM",
        },
    ];

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

export function CustomizationPanel() {
    const {
        preferences,
        setMode,
        setThemeColor,
        setFont,
        setRadius,
        setAnimationsEnabled,
        setReducedMotion,
        resetToDefaults,
        isHydrated,
    } = useCustomization();

    const [previewCheck, setPreviewCheck] = useState(true);
    const [previewSwitch, setPreviewSwitch] = useState(true);

    function handleReset() {
        resetToDefaults();
        toast.success("All customizations reset to defaults");
    }

    if (!isHydrated) {
        return (
            <div className="p-6 md:p-8 max-w-6xl mx-auto">
                <div className="animate-pulse space-y-8">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-muted rounded" />
                        <div className="h-4 w-96 bg-muted rounded" />
                    </div>
                    <div className="grid gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-3 space-y-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-44 bg-muted rounded-lg" />
                            ))}
                        </div>
                        <div className="lg:col-span-2 h-[600px] bg-muted rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight">
                                Customize
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Personalize the look and feel of your admin dashboard.
                            Changes apply to admin pages only.
                        </p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                Reset All
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Reset all customizations?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will revert every setting to its default value.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReset}>
                                    Reset
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* ── Main grid ── */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* ══════════════════════════════════ */}
                    {/* LEFT: All settings                */}
                    {/* ══════════════════════════════════ */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* ── 1. Appearance Mode ── */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Monitor className="h-4 w-4" />
                                    Appearance Mode
                                </CardTitle>
                                <CardDescription>
                                    Choose between light, dark, or automatic mode.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    {MODES.map(({ id, label, icon: Icon, description }) => {
                                        const isActive = preferences.mode === id;
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => setMode(id)}
                                                className={cn(
                                                    "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all outline-none",
                                                    "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                    isActive
                                                        ? "border-primary bg-primary/5 shadow-sm"
                                                        : "border-border"
                                                )}
                                            >
                                                {/* Mini preview */}
                                                <div
                                                    className={cn(
                                                        "w-full aspect-[4/3] rounded-lg border overflow-hidden mb-1",
                                                        id === "light" && "bg-white",
                                                        id === "dark" && "bg-zinc-900",
                                                        id === "auto" && "bg-gradient-to-r from-white to-zinc-900"
                                                    )}
                                                >
                                                    <div className="p-2 space-y-1.5">
                                                        <div
                                                            className={cn(
                                                                "h-1.5 w-8 rounded-full",
                                                                id === "dark" ? "bg-zinc-700" : "bg-zinc-200"
                                                            )}
                                                        />
                                                        <div
                                                            className={cn(
                                                                "h-1.5 w-12 rounded-full",
                                                                id === "dark" ? "bg-zinc-800" : "bg-zinc-100"
                                                            )}
                                                        />
                                                        <div
                                                            className={cn(
                                                                "h-1.5 w-6 rounded-full",
                                                                id === "dark" ? "bg-zinc-600" : "bg-zinc-300"
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Icon className="h-3.5 w-3.5" />
                                                    <span className="text-sm font-medium">{label}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                                                    {description}
                                                </span>
                                                {isActive && (
                                                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 2. Theme Color ── */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Theme Color
                                    <Badge variant="secondary" className="text-[10px] capitalize">
                                        {preferences.themeColor}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Accent color for buttons, badges, checkboxes, switches,
                                    and interactive elements.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    {THEME_COLORS.map((color) => {
                                        const isActive = preferences.themeColor === color.id;
                                        return (
                                            <Tooltip key={color.id}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        onClick={() => setThemeColor(color.id)}
                                                        className={cn(
                                                            "relative h-10 w-10 rounded-full border-2 transition-all outline-none",
                                                            "hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                            isActive
                                                                ? "border-foreground scale-110 shadow-lg"
                                                                : "border-transparent"
                                                        )}
                                                        style={{ backgroundColor: color.swatch }}
                                                        aria-label={`Select ${color.label} theme`}
                                                    >
                                                        {isActive && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Check className="h-4 w-4 text-white drop-shadow-md" />
                                                            </div>
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>{color.label}</TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>

                                {/* Preview strip */}
                                <div className="flex gap-1.5 items-center">
                                    <span className="text-xs text-muted-foreground mr-2">
                                        Preview:
                                    </span>
                                    <div className="h-6 flex-1 rounded-md bg-primary" />
                                    <div className="h-6 w-16 rounded-md bg-accent" />
                                    <div className="h-6 w-10 rounded-md border-2 border-ring" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 3. Font ── */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Type className="h-4 w-4" />
                                    Font Family
                                </CardTitle>
                                <CardDescription>
                                    Choose a font for the admin interface.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {FONT_OPTIONS.map((font) => {
                                        const isActive = preferences.font === font.id;
                                        return (
                                            <button
                                                key={font.id}
                                                type="button"
                                                onClick={() => setFont(font.id)}
                                                className={cn(
                                                    "relative flex flex-col gap-2 rounded-lg border-2 p-4 text-left transition-all outline-none",
                                                    "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                    isActive
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border"
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold">
                                                        {font.label}
                                                    </span>
                                                    {isActive && <Check className="h-4 w-4 text-primary" />}
                                                </div>
                                                <p
                                                    className="text-xs text-muted-foreground line-clamp-1"
                                                    style={{ fontFamily: font.value }}
                                                >
                                                    {font.preview}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 4. Border Radius ── */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <RectangleHorizontal className="h-4 w-4" />
                                    Border Radius
                                </CardTitle>
                                <CardDescription>
                                    Adjust the roundness of buttons, cards, and inputs.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                                    {RADIUS_OPTIONS.map((option) => {
                                        const isActive = preferences.radius === option.value;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setRadius(option.value)}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 rounded-lg border-2 p-3 flex-1 transition-all outline-none",
                                                    "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                    isActive
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border"
                                                )}
                                            >
                                                <div
                                                    className="h-8 w-full bg-primary/20 border border-primary/30"
                                                    style={{ borderRadius: `${option.value}rem` }}
                                                />
                                                <span className="text-[11px] font-medium">
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Radius preview */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-9 px-4 bg-primary text-primary-foreground flex items-center text-xs font-medium"
                                        style={{ borderRadius: `${preferences.radius}rem` }}
                                    >
                                        Button
                                    </div>
                                    <div
                                        className="h-9 px-4 border bg-card flex items-center text-xs"
                                        style={{ borderRadius: `${preferences.radius}rem` }}
                                    >
                                        Input
                                    </div>
                                    <div
                                        className="h-6 px-2.5 bg-accent text-accent-foreground flex items-center text-[10px] font-medium"
                                        style={{ borderRadius: `${preferences.radius}rem` }}
                                    >
                                        Badge
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 5. Accessibility ── */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Accessibility className="h-4 w-4" />
                                    Accessibility
                                </CardTitle>
                                <CardDescription>
                                    Motion and animation preferences.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="anim" className="text-sm font-medium cursor-pointer">
                                            Animations
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Enable transitions and micro-animations.
                                        </p>
                                    </div>
                                    <Switch
                                        id="anim"
                                        checked={preferences.animationsEnabled}
                                        onCheckedChange={setAnimationsEnabled}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="reduce" className="text-sm font-medium cursor-pointer">
                                            Reduced Motion
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Minimize movement. Overrides animations setting.
                                        </p>
                                    </div>
                                    <Switch
                                        id="reduce"
                                        checked={preferences.reducedMotion}
                                        onCheckedChange={setReducedMotion}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ══════════════════════════════════ */}
                    {/* RIGHT: Live Preview (sticky)      */}
                    {/* ══════════════════════════════════ */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold">Live Preview</h3>
                            </div>

                            <Card className="overflow-hidden">
                                <CardHeader className="pb-3 bg-muted/30 border-b">
                                    <CardTitle className="text-sm">Component Preview</CardTitle>
                                    <CardDescription className="text-[11px]">
                                        See your changes in real time
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="p-4 space-y-5">
                                    {/* Buttons */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Buttons
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Button size="sm">Primary</Button>
                                            <Button size="sm" variant="secondary">Secondary</Button>
                                            <Button size="sm" variant="outline">Outline</Button>
                                            <Button size="sm" variant="destructive">Delete</Button>
                                            <Button size="sm" variant="ghost">Ghost</Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Badges */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Badges
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge>Default</Badge>
                                            <Badge variant="secondary">Secondary</Badge>
                                            <Badge variant="destructive">Error</Badge>
                                            <Badge variant="outline">Outline</Badge>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Input */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Input
                                        </p>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input placeholder="Search members..." className="pl-8 h-8 text-xs" />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Controls */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Controls
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="pcheck"
                                                checked={previewCheck}
                                                onCheckedChange={(v) => setPreviewCheck(v as boolean)}
                                            />
                                            <Label htmlFor="pcheck" className="text-xs cursor-pointer">
                                                Enable notifications
                                            </Label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="pswitch" className="text-xs cursor-pointer">
                                                Dark mode
                                            </Label>
                                            <Switch
                                                id="pswitch"
                                                checked={previewSwitch}
                                                onCheckedChange={setPreviewSwitch}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Progress */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Progress
                                        </p>
                                        <Progress value={68} className="h-2" />
                                        <p className="text-[10px] text-muted-foreground">68% complete</p>
                                    </div>

                                    <Separator />

                                    {/* Card mock */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Card
                                        </p>
                                        <div className="rounded-lg border p-3 space-y-3">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                                                        JD
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-xs font-medium">John Doe</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Member since 2023
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant="secondary" className="text-[9px]">
                                                    <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                                                    Active
                                                </Badge>
                                                <Badge variant="outline" className="text-[9px]">
                                                    <Star className="mr-1 h-2.5 w-2.5" />
                                                    Premium
                                                </Badge>
                                            </div>
                                            <Button size="sm" className="w-full h-7 text-xs">
                                                View Profile
                                                <ArrowRight className="ml-1.5 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Status
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                                <span className="text-[11px] font-medium">
                                                    All systems operational
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2">
                                                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                                                <span className="text-[11px] font-medium">
                                                    2 items need attention
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}