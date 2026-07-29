

// components/mapbox/address-search.tsx

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { searchPlaces } from "@/lib/services/mapbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface AddressSearchProps {
    onSelect: (result: {
        address: string;
        lng: number;
        lat: number;
        placeName: string;
    }) => void;
    placeholder?: string;
    className?: string;
    proximity?: [number, number];
}

export function AddressSearch({
    onSelect,
    placeholder = "Search for an address...",
    className,
    proximity = [0, 0],
}: AddressSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const debouncedQuery = useDebounce(query, 300);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Search when query changes
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const performSearch = async () => {
            setIsLoading(true);
            try {
                const results = await searchPlaces(debouncedQuery, proximity);
                setResults(results);
                setIsOpen(results.length > 0);
            } catch (error) {
                console.error("[AddressSearch] Error:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery, proximity]);

    const handleSelect = useCallback(
        (result: any) => {
            onSelect({
                address: result.placeName || result.address,
                lng: result.coordinates[0],
                lat: result.coordinates[1],
                placeName: result.placeName,
            });
            setQuery(result.placeName || result.address);
            setIsOpen(false);
            setResults([]);
            setSelectedIndex(-1);
            inputRef.current?.blur();
        },
        [onSelect]
    );

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % results.length);
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleSelect(results[selectedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
        }
    };

    return (
        <div className={cn("relative w-full", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    className="pl-9 pr-10"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <X className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <Card
                    ref={resultsRef}
                    className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto shadow-lg"
                >
                    <div className="p-1">
                        {results.map((result, index) => (
                            <button
                                key={result.id}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-md transition-colors",
                                    index === selectedIndex
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50"
                                )}
                                onClick={() => handleSelect(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="text-sm font-medium">
                                    {result.placeName || result.address}
                                </div>
                                {result.city && (
                                    <div className="text-xs text-muted-foreground">
                                        {result.city}
                                        {result.region && `, ${result.region}`}
                                        {result.country && `, ${result.country}`}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}