"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSMS } from "@/hooks/use-sms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Send,
    Sparkles,
    Clock,
    X,
    ArrowLeft,
    Users,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SMSRecipientSelector } from "./sms-recipient-selector";
import { SMSTemplateSelector } from "./sms-template-selector";
import { SMSScheduler } from "./sms-scheduler";
import type { SendSMSInput } from "@/lib/types/sms";
import { toast } from "sonner";

interface SMSComposerBarProps {
    onBack: () => void;
    onSent: () => void;
}

export function SMSComposerBar({ onBack, onSent }: SMSComposerBarProps) {
    const { sendMessage, isSending } = useSMS();
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");
    const [recipientType, setRecipientType] = useState<"all" | "group" | "individual">("all");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
    const [showRecipients, setShowRecipients] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const maxChars = 1600;
    const charCount = message.length;
    const remainingChars = maxChars - charCount;
    const isOverLimit = charCount > maxChars;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [message]);

    const handleApplyTemplate = useCallback((template: any) => {
        setMessage(template.message);
        setSubject(template.subject || "");
        setSelectedTemplate(template.id);
        setShowTemplates(false);
    }, []);

    const recipientLabel =
        recipientType === "all"
            ? "All Members"
            : recipientType === "group"
                ? selectedGroup || "Choose group"
                : `${selectedMembers.length} member${selectedMembers.length === 1 ? "" : "s"}`;

    const handleSend = async () => {
        if (!message.trim()) {
            toast.error("Type a message first");
            return;
        }
        if (isOverLimit) {
            toast.error("Message exceeds maximum length");
            return;
        }
        if (recipientType === "group" && !selectedGroup) {
            toast.error("Choose a group to send to");
            return;
        }
        if (recipientType === "individual" && selectedMembers.length === 0) {
            toast.error("Choose at least one member");
            return;
        }

        const input: SendSMSInput = {
            recipientType,
            message: message.trim(),
            subject: subject.trim() || undefined,
        };
        if (recipientType === "group") input.recipientGroup = selectedGroup as any;
        if (recipientType === "individual") input.recipientIds = selectedMembers;
        if (scheduledFor) input.scheduledFor = scheduledFor.toISOString();

        try {
            await sendMessage(input);
            toast.success(scheduledFor ? "Message scheduled" : "Message sent");
            onSent();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to send message");
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 bg-[#075E54] px-3 py-3 text-white">
                <Button size="icon" variant="ghost" onClick={onBack} className="text-white hover:bg-white/10 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <p className="text-sm font-semibold">New Message</p>
                    <Popover open={showRecipients} onOpenChange={setShowRecipients}>
                        <PopoverTrigger asChild>
                            <button className="flex items-center gap-1 text-xs text-white/80 hover:text-white">
                                <Users className="h-3 w-3" />
                                {recipientLabel}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-[360px] p-3">
                            <SMSRecipientSelector
                                value={recipientType}
                                onValueChange={(v) => setRecipientType(v as any)}
                                selectedGroup={selectedGroup}
                                onGroupChange={setSelectedGroup}
                                selectedMembers={selectedMembers}
                                onMembersChange={setSelectedMembers}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Body — wallpaper background like a real chat, subject field + scheduled pill live here */}
            <div className="flex-1 overflow-y-auto bg-[#ECE5DD] dark:bg-[#0b141a] p-4 space-y-3">
                <input
                    placeholder="Subject (optional)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border-none bg-white/70 dark:bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />

                {selectedTemplate && (
                    <Badge variant="secondary" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Template applied
                        <button onClick={() => { setSelectedTemplate(null); setMessage(""); setSubject(""); }}>
                            <X className="h-3 w-3 ml-1" />
                        </button>
                    </Badge>
                )}

                {scheduledFor && (
                    <button
                        onClick={() => setShowScheduler(true)}
                        className="flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/10 px-3 py-1.5 text-xs w-fit"
                    >
                        <Clock className="h-3 w-3" />
                        Scheduled {scheduledFor.toLocaleString()}
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                setScheduledFor(null);
                            }}
                            className="ml-1"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    </button>
                )}

                {/* Live preview bubble as they type — reinforces the chat metaphor */}
                {message.trim() && (
                    <div className="flex justify-end pt-2">
                        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] dark:bg-[#005c4b] px-3 py-2 shadow-sm">
                            <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* WhatsApp-style bottom input bar */}
            <div className="border-t bg-background p-2">
                <div className="flex items-end gap-2">
                    <Popover open={showTemplates} onOpenChange={setShowTemplates}>
                        <PopoverTrigger asChild>
                            <Button size="icon" variant="ghost" className="rounded-full shrink-0">
                                <Sparkles className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" side="top" className="w-[360px] p-3">
                            <SMSTemplateSelector onSelect={handleApplyTemplate} selectedId={selectedTemplate} />
                        </PopoverContent>
                    </Popover>

                    <Popover open={showScheduler} onOpenChange={setShowScheduler}>
                        <PopoverTrigger asChild>
                            <Button size="icon" variant="ghost" className="rounded-full shrink-0">
                                <Clock className={cn("h-5 w-5", scheduledFor ? "text-[#075E54]" : "text-muted-foreground")} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" side="top" className="w-[340px] p-3">
                            <SMSScheduler value={scheduledFor} onChange={setScheduledFor} />
                        </PopoverContent>
                    </Popover>

                    <div className="flex-1 relative">
                        <Textarea
                            ref={textareaRef}
                            rows={1}
                            placeholder="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className={cn(
                                "min-h-[40px] max-h-[160px] resize-none rounded-3xl border-none bg-muted/60 py-2.5 pr-4",
                                isOverLimit && "ring-1 ring-destructive"
                            )}
                        />
                        {charCount > maxChars * 0.8 && (
                            <span
                                className={cn(
                                    "absolute -top-5 right-2 text-[11px]",
                                    isOverLimit ? "text-destructive" : "text-muted-foreground"
                                )}
                            >
                                {remainingChars}
                            </span>
                        )}
                    </div>

                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={isSending || !message.trim() || isOverLimit}
                        className="rounded-full shrink-0 bg-[#075E54] hover:bg-[#075E54]/90 disabled:opacity-50"
                    >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}