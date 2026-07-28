// components/sms/sms-template-selector.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSMS } from "@/hooks/use-sms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Plus, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SMSTemplate } from "@/lib/types/sms";

interface SMSTemplateSelectorProps {
    onSelect: (template: SMSTemplate) => void;
    selectedId?: string | null;
}

const spring = {
    type: "spring" as const,
    stiffness: 350,
    damping: 25,
};

const CATEGORY_COLORS: Record<string, string> = {
    welcome: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    payment_reminder: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    event: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    general: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
    custom: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const CATEGORY_LABELS: Record<string, string> = {
    welcome: "Welcome",
    payment_reminder: "Payment Reminder",
    event: "Event",
    general: "General",
    custom: "Custom",
};

export function SMSTemplateSelector({
    onSelect,
    selectedId,
}: SMSTemplateSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { useTemplates } = useSMS();

    const { data: templates, isLoading } = useTemplates();

    const filteredTemplates = templates?.filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }) || [];

    const categories = templates
        ? Array.from(new Set(templates.map((t) => t.category)))
        : [];

    if (isLoading) {
        return (
            <div className="space-y-3">
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className={cn(!selectedCategory && "bg-primary/10")}
                >
                    All
                </Button>
                {categories.map((category) => (
                    <Button
                        key={category}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                            selectedCategory === category && "bg-primary/10"
                        )}
                    >
                        {CATEGORY_LABELS[category] || category}
                    </Button>
                ))}
            </div>

            {/* Templates List */}
            <ScrollArea className="h-[250px]">
                {filteredTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 text-muted-foreground">
                        <Sparkles className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No templates found</p>
                        <p className="text-xs">Create a new template to get started</p>
                    </div>
                ) : (
                    <div className="space-y-2 pr-2">
                        {filteredTemplates.map((template) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={spring}
                            >
                                <Card
                                    className={cn(
                                        "p-3 cursor-pointer transition-all hover:border-primary/50",
                                        selectedId === template.id && "border-primary bg-primary/5"
                                    )}
                                    onClick={() => onSelect(template)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm truncate">
                                                    {template.name}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "text-xs shrink-0",
                                                        CATEGORY_COLORS[template.category]
                                                    )}
                                                >
                                                    {CATEGORY_LABELS[template.category] || template.category}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                {template.message.slice(0, 100)}
                                                {template.message.length > 100 ? "..." : ""}
                                            </p>
                                            {template.subject && (
                                                <p className="text-xs text-muted-foreground/70 mt-0.5">
                                                    Subject: {template.subject}
                                                </p>
                                            )}
                                        </div>
                                        {selectedId === template.id && (
                                            <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}