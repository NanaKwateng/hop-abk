// src/components/dashboard/users/user-search-command.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    CommandDialog,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchMembers } from "@/actions/member";
import { POSITION_LABELS } from "@/lib/constants";
import type { Member } from "@/lib/types";
import { MailIcon, MapPinIcon, SearchIcon } from "lucide-react";

export function UserSearchCommand({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const router = useRouter();
    const [inputValue, setInputValue] = React.useState("");
    const [results, setResults] = React.useState<Member[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);

    const searchValue = useDebounce(inputValue, 200);

    // Fetch results from Supabase
    React.useEffect(() => {
        if (!open) return;

        const search = async () => {
            setIsSearching(true);
            try {
                const response = await fetchMembers({
                    search: searchValue,
                    page: 1,
                    pageSize: 15,
                });
                setResults(response.data);
            } catch (error) {
                console.error("Search failed:", error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        search();
    }, [searchValue, open]);

    const handleSelect = (memberId: string) => {
        onOpenChange(false);
        setInputValue("");
        router.push(`/admin/users/${memberId}`);
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <Command shouldFilter={false}>
                <CommandInput
                    placeholder="Search members by name, email, phone, location..."
                    value={inputValue}
                    onValueChange={setInputValue}
                />
                <CommandList>
                    <CommandEmpty>
                        <div className="flex flex-col items-center gap-2 py-6">
                            <SearchIcon className="size-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {isSearching
                                    ? "Searching..."
                                    : `No members found for "${searchValue}"`}
                            </p>
                        </div>
                    </CommandEmpty>

                    <CommandGroup
                        heading={
                            searchValue.trim()
                                ? `${results.length} result${results.length !== 1 ? "s" : ""}`
                                : "Recent members"
                        }
                    >
                        {results.map((member) => (
                            <CommandItem
                                key={member.id}
                                value={member.id}
                                onSelect={() => handleSelect(member.id)}
                                className="flex items-center gap-3 py-3"
                            >
                                <Avatar className="size-8">
                                    <AvatarImage
                                        src={member.avatarUrl || undefined}
                                        alt={`${member.firstName} ${member.lastName}`}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {member.firstName[0]}
                                        {member.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-1 flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {member.firstName} {member.lastName}
                                        </span>
                                        {member.membershipId && (
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {member.membershipId}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        {member.email && (
                                            <span className="flex items-center gap-1">
                                                <MailIcon className="size-3" />
                                                {member.email}
                                            </span>
                                        )}
                                        {member.placeOfStay && (
                                            <span className="flex items-center gap-1">
                                                <MapPinIcon className="size-3" />
                                                {member.placeOfStay}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {member.memberPosition && (
                                    <Badge variant="secondary" className="text-xs">
                                        {POSITION_LABELS[member.memberPosition] ||
                                            member.memberPosition}
                                    </Badge>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
        </CommandDialog>
    );
}

export function UserSearchTrigger() {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm text-muted-foreground shadow-none sm:w-64"
                onClick={() => setOpen(true)}
            >
                <SearchIcon className="mr-2 size-4" />
                Search members...
                <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <UserSearchCommand open={open} onOpenChange={setOpen} />
        </>
    );
}