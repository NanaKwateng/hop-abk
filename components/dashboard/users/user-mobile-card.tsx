// src/components/dashboard/users/user-mobile-card.tsx

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Member } from "@/lib/types";
import {
    POSITION_COLORS,
    GROUP_COLORS,
    POSITION_LABELS,
    GROUP_LABELS,
} from "@/lib/constants";
import {
    MoreVerticalIcon,
    MailIcon,
    PhoneIcon,
    MapPinIcon,
    PencilIcon,
    CopyIcon,
    TrashIcon,
    ExternalLinkIcon,
} from "lucide-react";

interface UserMobileCardProps {
    member: Member;
    isSelected: boolean;
    onToggleSelect: () => void;
    onEdit: (member: Member) => void;
    onDuplicate: (member: Member) => void;
    onDelete: (member: Member) => void;
}

export function UserMobileCard({
    member,
    isSelected,
    onToggleSelect,
    onEdit,
    onDuplicate,
    onDelete,
}: UserMobileCardProps) {
    const router = useRouter();

    return (
        <Card
            className={`transition-colors ${isSelected ? "border-primary bg-primary/5" : ""
                }`}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onToggleSelect}
                        className="mt-1"
                        aria-label={`Select ${member.firstName} ${member.lastName}`}
                    />

                    <Avatar
                        className="size-12 cursor-pointer"
                        onClick={() => router.push(`/admin/users/${member.id}`)}
                    >
                        <AvatarImage
                            src={member.avatarUrl || undefined}
                            alt={`${member.firstName} ${member.lastName}`}
                        />
                        <AvatarFallback>
                            {member.firstName[0]}
                            {member.lastName[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/admin/users/${member.id}`)}
                    >
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                                {member.firstName} {member.lastName}
                            </h3>
                            {member.membershipId && (
                                <span className="font-mono text-xs text-muted-foreground">
                                    {member.membershipId}
                                </span>
                            )}
                        </div>

                        <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                            {member.email && (
                                <div className="flex items-center gap-1.5">
                                    <MailIcon className="size-3" />
                                    <span className="truncate">{member.email}</span>
                                </div>
                            )}
                            {member.phone && (
                                <div className="flex items-center gap-1.5">
                                    <PhoneIcon className="size-3" />
                                    <span>{member.phone}</span>
                                </div>
                            )}
                            {member.placeOfStay && (
                                <div className="flex items-center gap-1.5">
                                    <MapPinIcon className="size-3" />
                                    <span>{member.placeOfStay}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {member.memberPosition && (
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${POSITION_COLORS[member.memberPosition] || ""}`}
                                >
                                    {POSITION_LABELS[member.memberPosition] ||
                                        member.memberPosition}
                                </Badge>
                            )}
                            {member.memberGroup && (
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${GROUP_COLORS[member.memberGroup] || ""}`}
                                >
                                    {GROUP_LABELS[member.memberGroup] || member.memberGroup}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <MoreVerticalIcon className="size-4" />
                                <span className="sr-only">Actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    router.push(`/admin/users/${member.id}`)
                                }
                            >
                                <ExternalLinkIcon className="mr-2 size-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(member)}>
                                <PencilIcon className="mr-2 size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate(member)}>
                                <CopyIcon className="mr-2 size-4" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDelete(member)}
                            >
                                <TrashIcon className="mr-2 size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}