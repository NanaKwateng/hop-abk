// components/dashboard/tasks/task-purpose-config.tsx
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    CreditCard,
    FileText,
    Shield,
    Users,
    Activity,
    Info,
    Calendar,
    DollarSign,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskPurpose } from "@/lib/types/task";
import type { UseFormReturn } from "react-hook-form";

interface TaskPurposeConfigProps {
    purpose: TaskPurpose;
    form: UseFormReturn<any>;
}

export function TaskPurposeConfig({ purpose, form }: TaskPurposeConfigProps) {
    const { register, watch, setValue } = form;

    // Payment Config
    if (purpose === "payments") {
        const trackingPeriod = watch("paymentConfig.trackingPeriod");

        return (
            <ScrollArea className="h-full">
                <div className="px-6 py-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/50">
                            <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Payment Configuration</h3>
                            <p className="text-sm text-muted-foreground">
                                Set up tracking for tithes, donations, or dues
                            </p>
                        </div>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Configure how you want to track payments for this task. You can set
                            tracking periods and expected amounts per member.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Tracking Period *
                        </Label>
                        <RadioGroup
                            value={trackingPeriod}
                            onValueChange={(v) =>
                                setValue("paymentConfig.trackingPeriod", v, {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <RadioGroupItem
                                        value="weekly"
                                        id="period-weekly"
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor="period-weekly"
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all",
                                            "hover:bg-accent hover:border-primary/40",
                                            "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                        )}
                                    >
                                        <Calendar className="h-6 w-6 text-muted-foreground" />
                                        <span className="text-sm font-medium">Weekly</span>
                                        <span className="text-xs text-muted-foreground text-center">
                                            Track payments per week
                                        </span>
                                    </Label>
                                </div>

                                <div>
                                    <RadioGroupItem
                                        value="monthly"
                                        id="period-monthly"
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor="period-monthly"
                                        className={cn(
                                            "flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all",
                                            "hover:bg-accent hover:border-primary/40",
                                            "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                        )}
                                    >
                                        <Calendar className="h-6 w-6 text-muted-foreground" />
                                        <span className="text-sm font-medium">Monthly</span>
                                        <span className="text-xs text-muted-foreground text-center">
                                            Track payments per month
                                        </span>
                                    </Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expected-amount" className="text-sm font-medium">
                            Expected Amount (GH₵){" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="expected-amount"
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="pl-9"
                                {...register("paymentConfig.expectedAmount", {
                                    valueAsNumber: true,
                                })}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Set an expected amount per {trackingPeriod === "weekly" ? "week" : "month"}{" "}
                            for progress tracking
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>What you can track:</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                            <li>Individual member payments</li>
                            <li>Payment dates and periods</li>
                            <li>Total amounts collected</li>
                            <li>Payment completion status</li>
                            <li>Export payment reports</li>
                        </ul>
                    </div>
                </div>
            </ScrollArea>
        );
    }

    // Record Config
    if (purpose === "records") {
        return (
            <ScrollArea className="h-full">
                <div className="px-6 py-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Records Configuration</h3>
                            <p className="text-sm text-muted-foreground">
                                Set up record-keeping for attendance, notes, or updates
                            </p>
                        </div>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Configure how you want to keep records for this task. You can
                            define record types and templates for consistency.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="record-type" className="text-sm font-medium">
                            Record Type{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Select
                            value={watch("recordConfig.recordType")}
                            onValueChange={(v) => setValue("recordConfig.recordType", v)}
                        >
                            <SelectTrigger id="record-type">
                                <SelectValue placeholder="Select a record type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="attendance">Attendance</SelectItem>
                                <SelectItem value="service">Service Record</SelectItem>
                                <SelectItem value="participation">Participation</SelectItem>
                                <SelectItem value="achievement">Achievement</SelectItem>
                                <SelectItem value="general">General Note</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Define the type of records you'll be keeping
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="record-template" className="text-sm font-medium">
                            Record Template{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Textarea
                            id="record-template"
                            placeholder="Enter a template for consistency&#10;Example:&#10;Date: [DATE]&#10;Activity: [ACTIVITY]&#10;Notes: [NOTES]"
                            rows={5}
                            {...register("recordConfig.template")}
                        />
                        <p className="text-xs text-muted-foreground">
                            Create a template that will be used for all records
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            <span>What you can track:</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                            <li>Attendance and participation</li>
                            <li>Service records and contributions</li>
                            <li>Notes and observations</li>
                            <li>Export to PDF or Word documents</li>
                            <li>Historical record viewing</li>
                        </ul>
                    </div>
                </div>
            </ScrollArea>
        );
    }

    // Roles Config
    if (purpose === "roles") {
        return (
            <ScrollArea className="h-full">
                <div className="px-6 py-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Role Assignment Configuration</h3>
                            <p className="text-sm text-muted-foreground">
                                Set up role assignments and responsibilities
                            </p>
                        </div>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Use this task to assign roles, positions, and responsibilities to
                            members. Each member can have multiple role assignments.
                        </AlertDescription>
                    </Alert>

                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 text-purple-600" />
                            <span>Role Assignment Features:</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                            <li>Assign role titles to members</li>
                            <li>Add detailed role descriptions</li>
                            <li>Define responsibilities and expectations</li>
                            <li>Track role assignment history</li>
                            <li>Export organizational charts</li>
                            <li>Multiple roles per member</li>
                        </ul>
                    </div>

                    <div className="rounded-lg border-2 border-dashed p-6 text-center space-y-2">
                        <Shield className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Ready to Assign Roles</p>
                            <p className="text-xs text-muted-foreground">
                                You'll be able to assign roles to members after creating this
                                task.
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        );
    }

    // Groups Config
    if (purpose === "groups") {
        return (
            <ScrollArea className="h-full">
                <div className="px-6 py-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
                            <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Group Management Configuration</h3>
                            <p className="text-sm text-muted-foreground">
                                Create and manage member groups or teams
                            </p>
                        </div>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Use this task to create groups, teams, or committees. Organize
                            members into sub-groups for better coordination.
                        </AlertDescription>
                    </Alert>

                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                            <span>Group Management Features:</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                            <li>Create sub-groups within the task</li>
                            <li>Assign members to multiple groups</li>
                            <li>Track group-specific activities</li>
                            <li>Manage group leaders and coordinators</li>
                            <li>Export group membership reports</li>
                            <li>Group communication tracking</li>
                        </ul>
                    </div>

                    <div className="rounded-lg border-2 border-dashed p-6 text-center space-y-2">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Ready to Create Groups</p>
                            <p className="text-xs text-muted-foreground">
                                You'll be able to organize members into groups after creating
                                this task.
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        );
    }

    // Monitoring Config
    if (purpose === "monitoring") {
        const checkpointInterval = watch("monitorConfig.checkpointInterval");

        return (
            <ScrollArea className="h-full">
                <div className="px-6 py-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/50">
                            <Activity className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Monitoring Configuration</h3>
                            <p className="text-sm text-muted-foreground">
                                Set up activity monitoring and checkpoints
                            </p>
                        </div>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            Configure monitoring checkpoints to track member activities,
                            attendance, or progress over time.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Checkpoint Interval{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Select
                            value={checkpointInterval}
                            onValueChange={(v) =>
                                setValue("monitorConfig.checkpointInterval", v)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            How often should monitoring checkpoints occur?
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 text-orange-600" />
                            <span>Monitoring Features:</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                            <li>Track member activities over time</li>
                            <li>Set monitoring checkpoints</li>
                            <li>Record status updates and notes</li>
                            <li>Timeline view of activities</li>
                            <li>Alert triggers for missed checkpoints</li>
                            <li>Export activity logs</li>
                        </ul>
                    </div>

                    {checkpointInterval && (
                        <div className="rounded-lg border bg-primary/5 p-4">
                            <p className="text-xs font-medium mb-1">Selected Interval</p>
                            <p className="text-sm">
                                Checkpoints will be tracked{" "}
                                <strong className="capitalize">{checkpointInterval}</strong>
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        );
    }

    // Other/Default Config
    return (
        <ScrollArea className="h-full">
            <div className="px-6 py-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-950/50">
                        <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Custom Task Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                            This is a custom task type
                        </p>
                    </div>
                </div>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        This task type doesn't require additional configuration. You can
                        proceed to create the task.
                    </AlertDescription>
                </Alert>

                <div className="rounded-lg border-2 border-dashed p-8 text-center space-y-2">
                    <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Configuration Complete</p>
                        <p className="text-xs text-muted-foreground">
                            Your custom task is ready. Click "Next" to review.
                        </p>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}