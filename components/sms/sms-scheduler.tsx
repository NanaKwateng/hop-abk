"use client";

import { format, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SMSSchedulerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
}

export function SMSScheduler({ value, onChange }: SMSSchedulerProps) {
    const isEnabled = !!value;

    const handleToggle = (enabled: boolean) => {
        if (!enabled) {
            onChange(null);
        } else {
            const defaultDate = new Date();
            defaultDate.setHours(defaultDate.getHours() + 1);
            onChange(defaultDate);
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            const currentTime = value || new Date();
            const newDate = new Date(date);
            newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
            onChange(newDate);
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!value) return;
        const [hours, minutes] = e.target.value.split(":").map(Number);
        const newDate = new Date(value);
        newDate.setHours(hours, minutes);
        onChange(newDate);
    };

    const today = startOfDay(new Date());

    return (
        <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Switch
                        id="schedule-sms"
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                        className="data-[state=checked]:bg-primary"
                    />
                    <Label
                        htmlFor="schedule-sms"
                        className="text-xs font-semibold cursor-pointer flex items-center gap-1.5 text-foreground"
                    >
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        Schedule Delivery
                    </Label>
                </div>

                {isEnabled && (
                    <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        Automated
                    </span>
                )}
            </div>

            {isEnabled && value && (
                <div className="flex flex-wrap items-center gap-2.5 pt-3 mt-2 border-t border-black/5 dark:border-white/10">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-xs font-medium gap-1.5"
                            >
                                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                {format(value, "MMM dd, yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto p-0 rounded-3xl border-black/10 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-xl"
                            align="start"
                        >
                            <Calendar
                                mode="single"
                                selected={value}
                                onSelect={handleDateSelect}
                                initialFocus
                                disabled={(date) => date < today}
                                className="p-3"
                            />
                        </PopoverContent>
                    </Popover>

                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-2.5 h-8">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            type="time"
                            value={format(value, "HH:mm")}
                            onChange={handleTimeChange}
                            className="h-6 w-[80px] border-none bg-transparent p-0 text-xs focus-visible:ring-0"
                        />
                    </div>

                    <p className="text-[11px] text-muted-foreground font-medium ml-auto">
                        Will send: <span className="text-foreground">{format(value, "EEE, MMM d 'at' h:mm a")}</span>
                    </p>
                </div>
            )}
        </div>
    );
}