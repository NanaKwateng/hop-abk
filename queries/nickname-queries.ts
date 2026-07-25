// queries/nickname-queries.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    searchMembersByNickname,
    searchMembersByNicknameExact,
    addNicknameToMember,
    removeNicknameFromMember,
} from "@/actions/nicknames";
import type { NicknameMember, AddNicknamePayload, RemoveNicknamePayload } from "@/lib/types/nickname";
import { toast } from "sonner";

// Query Keys
export const nicknameKeys = {
    all: ["nicknames"] as const,
    search: (query: string, limit?: number) =>
        [...nicknameKeys.all, "search", query, limit] as const,
    exact: (nickname: string) =>
        [...nicknameKeys.all, "exact", nickname] as const,
};

// Search Hook
export function useNicknameSearch(query: string, limit: number = 10) {
    return useQuery({
        queryKey: nicknameKeys.search(query, limit),
        queryFn: () => searchMembersByNickname(query, limit),
        enabled: query.length >= 2,
        staleTime: 30_000,
        placeholderData: (previousData) => previousData,
    });
}

// Exact Search Hook
export function useNicknameExactSearch(nickname: string) {
    return useQuery({
        queryKey: nicknameKeys.exact(nickname),
        queryFn: () => searchMembersByNicknameExact(nickname),
        enabled: nickname.length >= 2,
        staleTime: 60_000,
    });
}

// Add Nickname Mutation
export function useAddNicknameMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddNicknamePayload) =>
            addNicknameToMember(payload),
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: nicknameKeys.all });
            toast.success(`Nickname "${result.nickname}" added successfully!`);
        },
        onError: (error: Error) => {
            toast.error("Failed to add nickname", {
                description: error.message,
            });
        },
    });
}

// Remove Nickname Mutation
export function useRemoveNicknameMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RemoveNicknamePayload) =>
            removeNicknameFromMember(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: nicknameKeys.all });
            toast.success("Nickname removed successfully!");
        },
        onError: (error: Error) => {
            toast.error("Failed to remove nickname", {
                description: error.message,
            });
        },
    });
}