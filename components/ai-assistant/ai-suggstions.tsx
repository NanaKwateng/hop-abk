// components/ai-assistant/ai-suggestions.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AISuggestionsProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    className?: string;
}

export function AISuggestions({
    suggestions,
    onSelect,
    className,
}: AISuggestionsProps) {
    const [selected, setSelected] = useState<string | null>(null);

    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>Suggested questions</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                    <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-xs py-1.5 px-3"
                        onClick={() => {
                            setSelected(suggestion);
                            onSelect(suggestion);
                        }}
                    >
                        {suggestion}
                    </Badge>
                ))}
            </div>
        </div>
    );
}