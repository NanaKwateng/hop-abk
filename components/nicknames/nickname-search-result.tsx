// components/nicknames/nickname-search-result.tsx

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NicknameMember } from "@/lib/types/nickname";

interface NicknameSearchResultProps {
    member: NicknameMember;
    onSelect: (memberId: string) => void;
    className?: string;
}

export function NicknameSearchResult({
    member,
    onSelect,
    className,
}: NicknameSearchResultProps) {
    const initials =
        (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

    return (
        <button
            onClick={() => onSelect(member.id)}
            className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent",
                className
            )}
        >
            {/* Avatar */}
            <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatarUrl || undefined} alt={member.firstName} />
                <AvatarFallback className="text-xs font-medium">
                    {initials.toUpperCase() || "?"}
                </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                        {member.firstName} {member.lastName}
                    </span>
                    {member.nickname && (
                        <Badge variant="secondary" className="text-xs">
                            @{member.nickname}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {member.membershipId && (
                        <span className="font-mono">{member.membershipId}</span>
                    )}
                    {member.memberPosition && (
                        <>
                            <span>·</span>
                            <span className="capitalize">{member.memberPosition}</span>
                        </>
                    )}
                    {member.memberGroup && (
                        <>
                            <span>·</span>
                            <span className="capitalize">
                                {member.memberGroup.replace(/_/g, " ")}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Chevron */}
            <div className="text-muted-foreground/30">→</div>
        </button>
    );
}