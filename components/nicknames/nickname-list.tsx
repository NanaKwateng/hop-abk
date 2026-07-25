// components/nicknames/nickname-list.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchMembersByNickname } from "@/actions/nicknames";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, User, Hash } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function NicknameList() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["nicknames-list", debouncedSearch],
        queryFn: () => searchMembersByNickname(debouncedSearch || "", 50),
        enabled: debouncedSearch.length === 0 || debouncedSearch.length >= 2,
        staleTime: 30000,
    });

    const members = data?.members || [];
    const hasResults = members.length > 0;
    const isSearching = debouncedSearch.length >= 2;

    const handleClear = () => {
        setSearchQuery("");
    };

    const handleMemberClick = (memberId: string) => {
        router.push(`/admin/users/${memberId}`);
    };

    return (
        <Card>
            <CardContent className="p-6">
                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Filter nicknames..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-10"
                    />
                    {searchQuery && (
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

                {/* Results */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : hasResults ? (
                    <div className="grid gap-3">
                        {members.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => handleMemberClick(member.id)}
                                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent w-full text-left"
                            >
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={member.avatarUrl || undefined} />
                                    <AvatarFallback>
                                        {(member.firstName?.[0] || "") + (member.lastName?.[0] || "")}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {member.firstName} {member.lastName}
                                        </span>
                                        {member.nickname && (
                                            <Badge variant="secondary" className="text-xs">
                                                @{member.nickname}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        {member.membershipId && (
                                            <span className="flex items-center gap-1">
                                                <Hash className="h-3 w-3" />
                                                {member.membershipId}
                                            </span>
                                        )}
                                        {member.memberPosition && (
                                            <span className="capitalize">{member.memberPosition}</span>
                                        )}
                                        {member.memberGroup && (
                                            <span className="capitalize">
                                                {member.memberGroup.replace(/_/g, " ")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Button variant="ghost" size="sm" className="shrink-0">
                                    <User className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                            </button>
                        ))}

                        {data?.totalCount && data.totalCount > members.length && (
                            <div className="text-center text-sm text-muted-foreground py-2">
                                Showing {members.length} of {data.totalCount} members
                            </div>
                        )}
                    </div>
                ) : isSearching ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No members found with nickname containing &ldquo;{debouncedSearch}&rdquo;
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        {members.length === 0 ? "No nicknames have been assigned yet." : "Start typing to search nicknames."}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}