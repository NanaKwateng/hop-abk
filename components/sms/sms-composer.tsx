// components/sms/sms-composer.tsx

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSMS } from "@/hooks/use-sms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Send,
    Clock,
    Users,
    User,
    Users2,
    Mail,
    Sparkles,
    Loader2,
    Check,
    AlertCircle,
    X,
    Plus,
    Save,
    Trash2,
    Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SMSRecipientSelector } from "./sms-recipient-selector";
import { SMSTemplateSelector } from "./sms-template-selector";
import { SMSScheduler } from "./sms-scheduler";
import type { SendSMSInput } from "@/lib/types/sms";
import { toast } from "sonner";

const spring = {
    type: "spring" as const,
    stiffness: 350,
    damping: 25,
    mass: 0.8,
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

export function SMSComposer() {
    const { sendMessage, isSending, useTemplates } = useSMS();
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");
    const [recipientType, setRecipientType] = useState<"all" | "group" | "individual" | "filtered">("all");
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
    const [charCount, setCharCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    const maxChars = 1600;
    const remainingChars = maxChars - charCount;
    const isOverLimit = charCount > maxChars;

    // Get templates
    const { data: templates, isLoading: templatesLoading } = useTemplates();

    // Update character count
    useEffect(() => {
        setCharCount(message.length);
    }, [message]);

    // Apply template
    const handleApplyTemplate = useCallback((template: any) => {
        setMessage(template.message);
        setSubject(template.subject || "");
        setSelectedTemplate(template.id);
        setShowTemplateSelector(false);
    }, []);

    // Handle send
    const handleSend = async () => {
        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        if (isOverLimit) {
            toast.error("Message exceeds maximum length");
            return;
        }

        const input: SendSMSInput = {
            recipientType,
            message: message.trim(),
            subject: subject.trim() || undefined,
        };

        if (recipientType === "group" && selectedGroup) {
            input.recipientGroup = selectedGroup as any;
        }

        if (recipientType === "individual" && selectedMembers.length > 0) {
            input.recipientIds = selectedMembers;
        }

        if (scheduledFor) {
            input.scheduledFor = scheduledFor.toISOString();
        }

        await sendMessage(input);
    };

    // Reset form
    const handleReset = () => {
        setMessage("");
        setSubject("");
        setRecipientType("all");
        setSelectedGroup("");
        setSelectedMembers([]);
        setSelectedTemplate(null);
        setScheduledFor(null);
        setCharCount(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="w-full max-w-4xl mx-auto"
        >
            <Card className="border border-border/50 shadow-lg overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Send className="h-5 w-5 text-primary" />
                                Send SMS Message
                            </CardTitle>
                            <CardDescription>
                                Send messages to members via SMS
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                                <Users className="h-3 w-3" />
                                {recipientType === "all" ? "All Members" :
                                    recipientType === "group" ? selectedGroup || "Group" :
                                        recipientType === "individual" ? `${selectedMembers.length} Members` :
                                            "Filtered"}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-muted-foreground"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Recipient Selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.05 }}
                    >
                        <SMSRecipientSelector
                            value={recipientType}
                            onValueChange={setRecipientType}
                            selectedGroup={selectedGroup}
                            onGroupChange={setSelectedGroup}
                            selectedMembers={selectedMembers}
                            onMembersChange={setSelectedMembers}
                        />
                    </motion.div>

                    {/* Template Selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.1 }}
                    >
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                                className="gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                {selectedTemplate ? "Change Template" : "Use Template"}
                            </Button>
                            {selectedTemplate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedTemplate(null);
                                        setMessage("");
                                        setSubject("");
                                    }}
                                    className="text-muted-foreground"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showTemplateSelector && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={spring}
                                    className="mt-2 overflow-hidden"
                                >
                                    <SMSTemplateSelector
                                        onSelect={handleApplyTemplate}
                                        selectedId={selectedTemplate}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Subject & Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.15 }}
                        className="space-y-4"
                    >
                        <div>
                            <Input
                                placeholder="Subject (optional)"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="relative">
                            <Textarea
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className={cn(
                                    "min-h-[180px] resize-none border-border/50 focus-visible:ring-1 focus-visible:ring-primary",
                                    isOverLimit && "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                            <div className={cn(
                                "absolute bottom-3 right-3 text-xs font-medium",
                                isOverLimit ? "text-destructive" : "text-muted-foreground"
                            )}>
                                {remainingChars > 0 ? `${remainingChars} characters remaining` : `Exceeds by ${Math.abs(remainingChars)} characters`}
                            </div>
                        </div>
                    </motion.div>

                    {/* Scheduler */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.2 }}
                    >
                        <SMSScheduler
                            value={scheduledFor}
                            onChange={setScheduledFor}
                        />
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.25 }}
                        className="flex items-center justify-between pt-4 border-t border-border/40"
                    >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {scheduledFor ? (
                                <span>Scheduled for {scheduledFor.toLocaleString()}</span>
                            ) : (
                                <span>Send immediately</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={isSending}
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={isSending || !message.trim() || isOverLimit}
                                className="gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        {scheduledFor ? "Schedule" : "Send Now"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}