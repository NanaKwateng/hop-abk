// components/users/user-card.tsx
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Phone,
    Mail,
    MapPin,
    Hash,
    User,
    Users,
    Briefcase,
} from "lucide-react";
import type { Member } from "@/lib/types";

interface UserCardProps {
    user: Member;
}

export function UserCard({ user }: UserCardProps) {
    const initials =
        (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "");

    // Only use avatar if it's a real HTTP URL
    const hasValidAvatar =
        user.avatarUrl &&
        user.avatarUrl.startsWith("http") &&
        user.avatarUrl.length > 0;

    return (
        <Card className="overflow-hidden w-full">
            {/* Header with avatar */}
            <div className="flex flex-row gap-5 items-start bg-muted/30 px-6 pt-8 pb-6">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                    {hasValidAvatar ? (
                        <AvatarImage
                            src={user.avatarUrl!}
                            alt={`${user.firstName} ${user.lastName}`}
                        />
                    ) : null}
                    <AvatarFallback className="text-2xl font-semibold">
                        {initials.toUpperCase() || "?"}
                    </AvatarFallback>
                </Avatar>

                <article>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight">
                        {user.firstName} {user.lastName}
                    </h2>

                    {user.memberPosition && (
                        <Badge variant="secondary" className="mt-2 capitalize">
                            {user.memberPosition}
                        </Badge>
                    )}
                </article>
            </div>

            {/* Details */}
            <div className="space-y-3 p-6">
                {user.membershipId && (
                    <DetailRow
                        icon={<Hash className="h-4 w-4" />}
                        label="Membership ID"
                        value={user.membershipId}
                        mono
                    />
                )}

                {user.phone && (
                    <DetailRow
                        icon={<Phone className="h-4 w-4" />}
                        label="Phone"
                        value={user.phone}
                    />
                )}

                {user.email && (
                    <DetailRow
                        icon={<Mail className="h-4 w-4" />}
                        label="Email"
                        value={user.email}
                    />
                )}

                {user.placeOfStay && (
                    <DetailRow
                        icon={<MapPin className="h-4 w-4" />}
                        label="Location"
                        value={
                            user.houseNumber
                                ? `${user.placeOfStay} (${user.houseNumber})`
                                : user.placeOfStay
                        }
                    />
                )}

                {user.memberGroup && (
                    <DetailRow
                        icon={<Users className="h-4 w-4" />}
                        label="Group"
                        value={user.memberGroup
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                    />
                )}

                {user.occupationType && (
                    <DetailRow
                        icon={<Briefcase className="h-4 w-4" />}
                        label="Occupation"
                        value={user.occupationType
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                    />
                )}

                {user.gender && (
                    <DetailRow
                        icon={<User className="h-4 w-4" />}
                        label="Gender"
                        value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                    />
                )}
            </div>
        </Card>
    );
}

function DetailRow({
    icon,
    label,
    value,
    mono = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <section className="">
            <div className="items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">{icon}</div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p
                        className={`text-sm font-medium truncate ${mono ? "font-mono tracking-wider" : ""
                            }`}
                    >
                        {value}
                    </p>
                </div>
            </div>
        </section>
    );
}