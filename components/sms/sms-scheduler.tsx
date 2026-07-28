// components/sms/sms-scheduler.tsx

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

interface SMSSchedulerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
}

export function SMSScheduler({ value, onChange }: SMSSchedulerProps) {
    const [isEnabled, setIsEnabled] = useState(!!value);

    const handleToggle = (enabled: boolean) => {
        setIsEnabled(enabled);
        if (!enabled) {
            onChange(null);
        } else {
            // Set default to 1 hour from now
            const defaultDate = new Date();
            defaultDate.setHours(defaultDate.getHours() + 1);
            onChange(defaultDate);
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            // Preserve the time from the current value if it exists
            const currentTime = value || new Date();
            const newDate = new Date(date);
            newDate.setHours(currentTime.getHours());
            newDate.setMinutes(currentTime.getMinutes());
            onChange(newDate);
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!value) return;
        const [hours, minutes] = e.target.value.split(":").map(Number);
        const newDate = new Date(value);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        onChange(newDate);
    };

    const clearSchedule = () => {
        onChange(null);
        setIsEnabled(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Switch
                        id="schedule-sms"
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                    />
                    <Label htmlFor="schedule-sms" className="text-sm font-medium">
                        <Clock className="inline h-4 w-4 mr-1.5 text-muted-foreground" />
                        Schedule for later
                    </Label>
                </div>
                {value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSchedule}
                        className="h-6 px-2 text-muted-foreground"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {isEnabled && value && (
                <div className="flex flex-wrap items-center gap-3 pl-6">
                    {/* Date Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <CalendarIcon className="h-4 w-4" />
                                {format(value, "MMM dd, yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={value}
                                onSelect={handleDateSelect}
                                initialFocus
                                disabled={(date) => date < new Date()}
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Time Picker */}
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="time"
                            value={format(value, "HH:mm")}
                            onChange={handleTimeChange}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <span className="text-xs text-muted-foreground">
                        {format(value, "EEEE, MMMM do 'at' h:mm a")}
                    </span>
                </div>
            )}
        </div>
    );
}