// src/components/dashboard/users/member-columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Member } from "@/lib/types";
import {
  POSITION_COLORS,
  GROUP_COLORS,
  POSITION_LABELS,
  GROUP_LABELS,
  GENDER_LABELS,
  OCCUPATION_LABELS,
} from "@/lib/constants";
import { DataTableColumnHeader } from "./data-table-column-header";
import {
  MoreHorizontalIcon,
  ExternalLinkIcon,
  PencilIcon,
  CopyIcon,
  TrashIcon,
} from "lucide-react";

export default function getMemberColumns(callbacks: {
  onViewMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDuplicateMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
}): ColumnDef<Member>[] {
  return [
    // ---- Select ----
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

    // ---- Membership ID ----
    {
      accessorKey: "membershipId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => {
        const id = row.getValue("membershipId") as string | null;
        return (
          <button
            onClick={() => callbacks.onViewMember(row.original)}
            className="font-mono text-sm font-medium text-primary hover:underline"
          >
            {id || "—"}
          </button>
        );
      },
      size: 130,
    },

    // ---- Member (Name + Avatar) ----
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Member" />
      ),
      cell: ({ row }) => {
        const member = row.original;
        const avatarSrc = member.avatarUrl && member.avatarUrl.length > 0
          ? member.avatarUrl
          : undefined;

        return (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => callbacks.onViewMember(member)}
          >
            <Avatar className="size-8">
              {avatarSrc ? (
                <AvatarImage
                  src={avatarSrc}
                  alt={`${member.firstName} ${member.lastName}`}
                  onError={(e) => {
                    // Hide broken image so fallback shows
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
              <AvatarFallback className="text-xs">
                {member.firstName?.[0] || ""}
                {member.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {member.firstName} {member.lastName}
              </span>
              <span className="text-xs text-muted-foreground md:hidden">
                {member.email || member.phone || ""}
              </span>
            </div>
          </div>
        );
      },
    },

    // ---- Email ----
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("email") || "—"}
        </span>
      ),
    },

    // ---- Phone ----
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {(row.getValue("phone") as string) || "—"}
        </span>
      ),
    },

    // ---- Gender (hidden by default) ----
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gender" />
      ),
      cell: ({ row }) => {
        const val = row.getValue("gender") as string | null;
        return (
          <span className="text-sm">
            {val ? GENDER_LABELS[val] || val : "—"}
          </span>
        );
      },
    },

    // ---- Location ----
    {
      accessorKey: "placeOfStay",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {(row.getValue("placeOfStay") as string) || "—"}
        </span>
      ),
    },

    // ---- House Number (hidden by default) ----
    {
      accessorKey: "houseNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="House No." />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {(row.getValue("houseNumber") as string) || "—"}
        </span>
      ),
    },

    // ---- Position ----
    {
      accessorKey: "memberPosition",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Position" />
      ),
      cell: ({ row }) => {
        const position = row.getValue("memberPosition") as string | null;
        if (!position) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <Badge
            variant="secondary"
            className={`text-xs ${POSITION_COLORS[position] || ""}`}
          >
            {POSITION_LABELS[position] || position}
          </Badge>
        );
      },
    },

    // ---- Group ----
    {
      accessorKey: "memberGroup",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Group" />
      ),
      cell: ({ row }) => {
        const group = row.getValue("memberGroup") as string | null;
        if (!group) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <Badge
            variant="outline"
            className={`text-xs ${GROUP_COLORS[group] || ""}`}
          >
            {GROUP_LABELS[group] || group}
          </Badge>
        );
      },
    },

    // ---- Occupation (hidden by default) ----
    {
      accessorKey: "occupationType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Occupation" />
      ),
      cell: ({ row }) => {
        const val = row.getValue("occupationType") as string | null;
        return (
          <span className="text-sm">
            {val ? OCCUPATION_LABELS[val] || val : "—"}
          </span>
        );
      },
    },

    // ---- Actions ----
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const member = row.original;

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
              <DropdownMenuItem
                onClick={() => callbacks.onViewMember(member)}
              >
                <ExternalLinkIcon className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => callbacks.onEditMember(member)}
              >
                <PencilIcon className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => callbacks.onDuplicateMember(member)}
              >
                <CopyIcon className="mr-2 size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => callbacks.onDeleteMember(member)}
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