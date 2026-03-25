// src/queries/member-queries.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchMembers,
    fetchMemberById,
    createMember,
    updateMember,
    deleteMember,
    deleteMultipleMembers,
    duplicateMember,
    fetchMembersForExport,
} from "@/actions/member";
import type {
    MemberFormData,
    MemberQueryParams,
    FilterConfig,
} from "@/lib/types";
import { toast } from "sonner";

// ---- Query Keys ----

export const memberKeys = {
    all: ["members"] as const,
    lists: () => [...memberKeys.all, "list"] as const,
    list: (params: MemberQueryParams) =>
        [...memberKeys.lists(), params] as const,
    details: () => [...memberKeys.all, "detail"] as const,
    detail: (id: string) => [...memberKeys.details(), id] as const,
    exports: () => [...memberKeys.all, "export"] as const,
};

// ---- Queries ----

export function useMembersQuery(params: MemberQueryParams) {
    return useQuery({
        queryKey: memberKeys.list(params),
        queryFn: () => fetchMembers(params),
        placeholderData: (previousData) => previousData,
        staleTime: 30_000,
    });
}

export function useMemberDetailQuery(id: string) {
    return useQuery({
        queryKey: memberKeys.detail(id),
        queryFn: () => fetchMemberById(id),
        enabled: !!id,
    });
}

// ---- Mutations ----

export function useCreateMemberMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            data,
            avatarBase64,
        }: {
            data: MemberFormData;
            avatarBase64?: string;
        }) => createMember(data, avatarBase64),
        onSuccess: (newMember) => {
            // Invalidate AND refetch all member lists
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.refetchQueries({ queryKey: memberKeys.lists() });
            toast.success("New member added", {
                description: `${newMember.firstName} ${newMember.lastName} has been registered.`,
            });
        },
        onError: (error) => {
            toast.error("Failed to add member", {
                description:
                    error instanceof Error ? error.message : "An error occurred.",
            });
        },
    });
}

export function useUpdateMemberMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
            avatarBase64,
        }: {
            id: string;
            data: Partial<MemberFormData>;
            avatarBase64?: string;
        }) => updateMember(id, data, avatarBase64),
        onSuccess: (updatedMember, variables) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: memberKeys.detail(variables.id),
            });
            queryClient.refetchQueries({ queryKey: memberKeys.lists() });
            queryClient.refetchQueries({
                queryKey: memberKeys.detail(variables.id),
            });
            toast.success("Member updated", {
                description: `${updatedMember.firstName} ${updatedMember.lastName}'s information has been updated.`,
            });
        },
        onError: (error) => {
            toast.error("Failed to update member", {
                description:
                    error instanceof Error ? error.message : "An error occurred.",
            });
        },
    });
}

export function useDeleteMemberMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteMember(id),
        onSuccess: (_data, deletedId) => {
            // Remove the specific member from cache immediately
            queryClient.removeQueries({
                queryKey: memberKeys.detail(deletedId),
            });

            // Invalidate all list queries so they refetch
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });

            // Force immediate refetch of all lists
            queryClient.refetchQueries({ queryKey: memberKeys.lists() });

            toast.success("Member deleted", {
                description: "The member has been removed from the system.",
            });
        },
        onError: (error) => {
            toast.error("Failed to delete member", {
                description:
                    error instanceof Error ? error.message : "An error occurred.",
            });
        },
    });
}

export function useBulkDeleteMembersMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => deleteMultipleMembers(ids),
        onSuccess: (_, ids) => {
            // Remove each deleted member from detail cache
            ids.forEach((id) => {
                queryClient.removeQueries({
                    queryKey: memberKeys.detail(id),
                });
            });

            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.refetchQueries({ queryKey: memberKeys.lists() });

            toast.success(`${ids.length} members deleted`, {
                description: "Selected members have been removed from the system.",
            });
        },
        onError: (error) => {
            toast.error("Failed to delete members", {
                description:
                    error instanceof Error ? error.message : "An error occurred.",
            });
        },
    });
}

export function useDuplicateMemberMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => duplicateMember(id),
        onSuccess: (newMember) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.refetchQueries({ queryKey: memberKeys.lists() });
            if (newMember) {
                toast.success("Member duplicated", {
                    description: `${newMember.firstName} has been created as a copy.`,
                });
            }
        },
        onError: (error) => {
            toast.error("Failed to duplicate member", {
                description:
                    error instanceof Error ? error.message : "An error occurred.",
            });
        },
    });
}

export function useExportMembersQuery(
    search: string,
    filters: FilterConfig[],
    enabled: boolean = false
) {
    return useQuery({
        queryKey: [...memberKeys.exports(), search, filters],
        queryFn: () => fetchMembersForExport(search, filters),
        enabled,
    });
}