"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSMS } from "@/hooks/use-sms";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Check, Layers, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SMSTemplate } from "@/lib/types/sms";

interface SMSTemplateSelectorProps {
    onSelect: (template: SMSTemplate) => void;
    selectedId?: string | null;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    welcome: {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        label: "Welcome",
    },
    payment_reminder: {
        bg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        label: "Payment",
    },
    event: {
        bg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        label: "Event",
    },
    general: {
        bg: "bg-slate-500/10 dark:bg-slate-500/20 border-slate-500/20",
        text: "text-slate-600 dark:text-slate-400",
        label: "General",
    },
    custom: {
        bg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        label: "Custom",
    },
};

export function SMSTemplateSelector({
    onSelect,
    selectedId,
}: SMSTemplateSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { useTemplates } = useSMS();

    const { data: templates = [], isLoading } = useTemplates();

    const categories = useMemo(() => {
        return Array.from(new Set(templates.map((t) => t.category)));
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return templates.filter((template) => {
            const matchesSearch =
                !q ||
                template.name.toLowerCase().includes(q) ||
                template.message.toLowerCase().includes(q);
            const matchesCategory =
                !selectedCategory || template.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [templates, searchQuery, selectedCategory]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, template: SMSTemplate) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(template);
            }
        },
        [onSelect]
    );

    if (isLoading) {
        return (
            <div className="space-y-4 p-1">
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-28 rounded-full" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Bar & Category Navigation */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                        placeholder="Search templates by title or content... (Press Esc to clear)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") setSearchQuery("");
                        }}
                        className="pl-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-primary/40 text-sm backdrop-blur-md transition-all"
                        aria-label="Search templates"
                    />
                </div>

                {/* Vision OS Style Pill Filters */}
                <div
                    className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none"
                    role="tablist"
                    aria-label="Template Categories"
                >
                    <button
                        onClick={() => setSelectedCategory(null)}
                        role="tab"
                        aria-selected={!selectedCategory}
                        className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 border",
                            !selectedCategory
                                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                                : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground border-black/5 dark:border-white/10"
                        )}
                    >
                        All Templates
                    </button>
                    {categories.map((cat) => {
                        const meta = CATEGORY_STYLES[cat] || CATEGORY_STYLES.general;
                        const isActive = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                role="tab"
                                aria-selected={isActive}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 border",
                                    isActive
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                                        : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground border-black/5 dark:border-white/10"
                                )}
                            >
                                {meta.label || cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Templates Glass Container List */}
            <ScrollArea className="h-[280px] pr-2">
                {filteredTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[220px] text-center text-muted-foreground border border-dashed border-black/10 dark:border-white/10 rounded-3xl p-6 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
                        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 mb-3">
                            <Sparkles className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No templates match your filter</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Try typing a different keyword or switch to another category.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5" role="listbox" aria-label="Available templates">
                        <AnimatePresence mode="popLayout">
                            {filteredTemplates.map((template) => {
                                const isSelected = selectedId === template.id;
                                const catMeta =
                                    CATEGORY_STYLES[template.category] || CATEGORY_STYLES.general;

                                return (
                                    <motion.div
                                        key={template.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: -8 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    >
                                        <div
                                            role="option"
                                            aria-selected={isSelected}
                                            tabIndex={0}
                                            onClick={() => onSelect(template)}
                                            onKeyDown={(e) => handleKeyDown(e, template)}
                                            className={cn(
                                                "group relative p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border outline-none",
                                                "backdrop-blur-md shadow-sm hover:shadow-md",
                                                isSelected
                                                    ? "bg-primary/10 dark:bg-primary/15 border-primary/40 ring-1 ring-primary/30"
                                                    : "bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border-black/5 dark:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm text-foreground truncate">
                                                            {template.name}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0",
                                                                catMeta.bg,
                                                                catMeta.text
                                                            )}
                                                        >
                                                            {catMeta.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                                                        {template.message}
                                                    </p>
                                                    {template.subject && (
                                                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground/80">
                                                            <MessageSquare className="h-3 w-3 shrink-0 opacity-70" />
                                                            <span className="truncate font-medium">
                                                                Subj: {template.subject}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="p-1 rounded-full bg-primary text-primary-foreground shrink-0 mt-0.5"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}