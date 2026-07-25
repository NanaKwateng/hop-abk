// components/nicknames/nickname-search.tsx

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { useNicknameSearch } from "@/queries/nickname-queries";
import { NicknameSearchResult } from "./nickname-search-result";
import { cn } from "@/lib/utils";

interface NicknameSearchProps {
    placeholder?: string;
    className?: string;
    onSelect?: (memberId: string) => void;
    maxResults?: number;
}

export function NicknameSearch({
    placeholder = "Search by nickname...",
    className,
    onSelect,
    maxResults = 10,
}: NicknameSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    const { data, isLoading, isFetching } = useNicknameSearch(
        debouncedQuery,
        maxResults
    );

    const members = data?.members || [];
    const hasResults = members.length > 0;
    const showResults = isOpen && debouncedQuery.length >= 2;

    const handleSelect = useCallback(
        (memberId: string) => {
            if (onSelect) {
                onSelect(memberId);
            } else {
                router.push(`/admin/users/${memberId}`);
            }
            setQuery("");
            setIsOpen(false);
        },
        [onSelect, router]
    );

    const handleClear = () => {
        setQuery("");
        setIsOpen(false);
    };

    const handleFocus = () => {
        if (debouncedQuery.length >= 2) {
            setIsOpen(true);
        }
    };

    return (
        <div className={cn("relative w-full max-w-md", className)}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length >= 2) {
                            setIsOpen(true);
                        } else {
                            setIsOpen(false);
                        }
                    }}
                    onFocus={handleFocus}
                    className="pl-9 pr-10"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
                {(isLoading || isFetching) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && (
                <Card className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto shadow-lg">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : hasResults ? (
                        <div className="p-1">
                            {members.map((member) => (
                                <NicknameSearchResult
                                    key={member.id}
                                    member={member}
                                    onSelect={handleSelect}
                                />
                            ))}
                            {data?.totalCount && data.totalCount > members.length && (
                                <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t">
                                    {data.totalCount - members.length} more results...
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No members found with nickname &quot;{debouncedQuery}&quot;
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}