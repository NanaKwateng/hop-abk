// src/components/users/user-columns.tsx
// ============================================================
// TanStack Table column definitions.
// 
// Each column defines:
//   - What data to show (accessorKey)
//   - How to render the header (with sorting)
//   - How to render each cell (with formatting/badges/avatars)
//   - Whether the column can be sorted, filtered, hidden
// ============================================================

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/lib/types/user-table-types";
import { POSITION_COLORS, GROUP_COLORS } from "@/lib/constants";
import { DataTableColumnHeader } from "./data-table-column-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Define all columns for the user table.
 * 
 * `onViewUser`, `onEditUser`, `onDuplicateUser`, `onDeleteUser`
 * are callbacks passed from the parent component.
 * This keeps column definitions pure — they don't manage state.
 */
export function getUserColumns(callbacks: {
    onViewUser: (user: User) => void;
    onEditUser: (user: User) => void;
    onDuplicateUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
}): ColumnDef<User>[] {
    return [
        // ---- Selection Checkbox Column ----
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },

        // ---- User ID Column ----
        {
            accessorKey: "id",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="ID" />
            ),
            cell: ({ row }) => (
                <Button
                    onClick={() => callbacks.onViewUser(row.original)}
                    className="font-mono text-sm font-medium text-primary hover:underline"
                >
                    {row.getValue("id")}
                </Button>
            ),
            size: 110,
        },

        // ---- Member Name + Avatar Column ----
        {
            accessorKey: "first_name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Member" />
            ),
            cell: ({ row }) => {
                const member = row.original;
                const initials =
                    (member.firstName?.[0] ?? "") + (member.lastName?.[0] ?? "");

                const avatarSrc =
                    member.avatarUrl &&
                        member.avatarUrl.startsWith("http")
                        ? member.avatarUrl
                        : undefined;

                return (
                    <Link
                        href={`/admin/users/${member.id}`}
                        className="flex items-center gap-3 group"
                    >
                        <Avatar className="h-8 w-8">
                            {avatarSrc ? (
                                <AvatarImage
                                    src={avatarSrc}
                                    alt={`${member.firstName} ${member.lastName}`}
                                />
                            ) : null}
                            <AvatarFallback className="text-xs">
                                {initials.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium group-hover:underline">
                                {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {member.email ?? "No email"}
                            </p>
                        </div>
                    </Link>
                );
            },
        },

        // ---- Email Column ----
        {
            accessorKey: "email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.getValue("email")}
                </span>
            ),
        },

        // ---- Phone Column ----
        {
            accessorKey: "phoneNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Phone" />
            ),
            cell: ({ row }) => (
                <span className="text-sm">{row.getValue("phoneNumber")}</span>
            ),
        },

        // ---- Gender Column (hidden by default) ----
        {
            accessorKey: "gender",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Gender" />
            ),
            cell: ({ row }) => <span className="text-sm">{row.getValue("gender")}</span>,
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },

        // ---- Location Column ----
        {
            accessorKey: "placeOfStay",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Location" />
            ),
            cell: ({ row }) => (
                <span className="text-sm">{row.getValue("placeOfStay")}</span>
            ),
        },

        // ---- Position Column ----
        {
            accessorKey: "memberPosition",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Position" />
            ),
            cell: ({ row }) => {
                const position = row.getValue("memberPosition") as string;
                return (
                    <Badge
                        variant="secondary"
                        className={`text-xs ${POSITION_COLORS[position] || ""}`}
                    >
                        {position}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },

        // ---- Group Column ----
        {
            accessorKey: "memberGroup",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Group" />
            ),
            cell: ({ row }) => {
                const group = row.getValue("memberGroup") as string;
                return (
                    <Badge
                        variant="outline"
                        className={`text-xs ${GROUP_COLORS[group] || ""}`}
                    >
                        {group}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },

        // ---- Occupation Column (hidden by default) ----
        {
            accessorKey: "occupationalType",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Occupation" />
            ),
            cell: ({ row }) => (
                <span className="text-sm">{row.getValue("occupationalType")}</span>
            ),
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },

        // ---- Actions Column ----
        {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => {
                const user = row.original;

                // Import is inline to avoid circular dependencies
                const {
                    DropdownMenu,
                    DropdownMenuContent,
                    DropdownMenuItem,
                    DropdownMenuLabel,
                    DropdownMenuSeparator,
                    DropdownMenuTrigger,
                } = require("@/components/ui/dropdown-menu");
                const { Button } = require("@/components/ui/button");
                const {
                    MoreHorizontalIcon,
                    ExternalLinkIcon,
                    PencilIcon,
                    CopyIcon,
                    TrashIcon,
                } = require("lucide-react");

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                            >
                                <MoreHorizontalIcon className="size-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => callbacks.onViewUser(user)}>
                                <ExternalLinkIcon className="mr-2 size-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => callbacks.onEditUser(user)}>
                                <PencilIcon className="mr-2 size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => callbacks.onDuplicateUser(user)}
                            >
                                <CopyIcon className="mr-2 size-4" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => callbacks.onDeleteUser(user)}
                            >
                                <TrashIcon className="mr-2 size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
            enableHiding: false,
            size: 50,
        },
    ];
}