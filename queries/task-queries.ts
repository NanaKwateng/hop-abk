// queries/task-queries.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getTasks,
    getTaskBySlug,
    getMemberTaskActivities,
    createTask,
    updateTask,
    deleteTask,
    addTaskMembers,
    removeTaskMembers,
    createTaskActivity,
    updateTaskActivity,
    deleteTaskActivity,
    getTasksForExport,
} from "@/actions/task";
import type {
    TaskFilters,
    CreateTaskPayload,
    CreateActivityPayload,
    UpdateActivityPayload,
} from "@/lib/types/task";
import { toast } from "sonner";

// ── Query Keys ──

export const taskKeys = {
    all: ["tasks"] as const,
    lists: () => [...taskKeys.all, "list"] as const,
    list: (filters?: TaskFilters) => [...taskKeys.lists(), filters] as const,
    details: () => [...taskKeys.all, "detail"] as const,
    detail: (slug: string) => [...taskKeys.details(), slug] as const,
    activities: () => [...taskKeys.all, "activities"] as const,
    memberActivities: (taskId: string, memberId: string) =>
        [...taskKeys.activities(), taskId, memberId] as const,
    exports: () => [...taskKeys.all, "export"] as const,
    export: (taskId: string) => [...taskKeys.exports(), taskId] as const,
};

// ── Queries ──

/**
 * Fetch all tasks with optional filters
 */
export function useTasksQuery(filters?: TaskFilters) {
    return useQuery({
        queryKey: taskKeys.list(filters),
        queryFn: () => getTasks(filters),
        placeholderData: (previousData) => previousData,
        staleTime: 30_000, // 30 seconds
    });
}

/**
 * Fetch single task by slug
 */
export function useTaskDetailQuery(slug: string) {
    return useQuery({
        queryKey: taskKeys.detail(slug),
        queryFn: () => getTaskBySlug(slug),
        enabled: !!slug,
        staleTime: 10_000, // 10 seconds
    });
}

/**
 * Fetch activities for a specific member in a task
 */
export function useMemberActivitiesQuery(taskId: string, memberId: string) {
    return useQuery({
        queryKey: taskKeys.memberActivities(taskId, memberId),
        queryFn: () => getMemberTaskActivities(taskId, memberId),
        enabled: !!taskId && !!memberId,
    });
}

/**
 * Fetch task data for export
 */
export function useTaskExportQuery(taskId: string, enabled: boolean = false) {
    return useQuery({
        queryKey: taskKeys.export(taskId),
        queryFn: () => getTasksForExport(taskId),
        enabled: enabled && !!taskId,
    });
}

// ── Mutations ──

/**
 * Create a new task
 */
// queries/task-queries.ts
// UPDATED - Better error messages

export function useCreateTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateTaskPayload) => createTask(payload),
        onSuccess: (slug, variables) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.refetchQueries({ queryKey: taskKeys.lists() });
            toast.success("Task created successfully! 🎉", {
                description: `${variables.name} with ${variables.memberIds.length} members`,
            });
        },
        onError: (error) => {
            console.error("[useCreateTaskMutation] Error:", error); // ✅ Added console log

            const message = error instanceof Error
                ? error.message
                : "Failed to create task. Please try again.";

            toast.error("Failed to create task", {
                description: message,
                duration: 5000, // ✅ Longer duration for error
            });
        },
    });
}

/**
 * Update task basic info
 */
export function useUpdateTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            updates,
        }: {
            id: string;
            updates: Parameters<typeof updateTask>[1];
        }) => updateTask(id, updates),
        onSuccess: (updatedTask) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: taskKeys.detail(updatedTask.slug),
            });
            queryClient.refetchQueries({ queryKey: taskKeys.lists() });
            toast.success("Task updated", {
                description: `${updatedTask.name} has been updated`,
            });
        },
        onError: (error) => {
            toast.error("Failed to update task", {
                description: error instanceof Error ? error.message : "An error occurred",
            });
        },
    });
}

/**
 * Delete a task
 */
export function useDeleteTaskMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.refetchQueries({ queryKey: taskKeys.lists() });
            toast.success("Task deleted", {
                description: "The task has been removed from the system",
            });
        },
        onError: (error) => {
            toast.error("Failed to delete task", {
                description: error instanceof Error ? error.message : "An error occurred",
            });
        },
    });
}

/**
 * Add members to a task
 */
export function useAddTaskMembersMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            taskId,
            memberIds,
        }: {
            taskId: string;
            memberIds: string[];
        }) => addTaskMembers(taskId, memberIds),
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.details() });
            queryClient.refetchQueries({ queryKey: taskKeys.details() });
            toast.success(`${result.added} member(s) added`, {
                description: "Members have been added to the task",
            });
        },
        onError: (error) => {
            toast.error("Failed to add members", {
                description: error instanceof Error ? error.message : "An error occurred",
            });
        },
    });
}

/**
 * Remove members from a task
 */
export function useRemoveTaskMembersMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            taskId,
            memberIds,
        }: {
            taskId: string;
            memberIds: string[];
        }) => removeTaskMembers(taskId, memberIds),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: taskKeys.details() });
            queryClient.refetchQueries({ queryKey: taskKeys.details() });
            toast.success(`${result.removed} member(s) removed`, {
                description: "Members have been removed from the task",
            });
        },
        onError: (error) => {
            toast.error("Failed to remove members", {
                description: error instanceof Error ? error.message : "An error occurred",
            });
        },
    });
}

/**
 * Create a task activity
 */
export function useCreateActivityMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateActivityPayload) => createTaskActivity(payload),
        onSuccess: (activity, variables) => {
            queryClient.invalidateQueries({
                queryKey: taskKeys.detail(variables.taskId),
            });
            queryClient.invalidateQueries({
                queryKey: taskKeys.memberActivities(
                    variables.taskId,
                    variables.memberId
                ),
            });
            queryClient.refetchQueries({
                queryKey: taskKeys.detail(variables.taskId),
            });
            toast.success("Activity created", {
                description: activity.title,
            });
        },
        onError: (error) => {
            toast.error("Failed to create activity", {
                description: error instanceof Error ? error.message : "An error occurred",
            });
        },
    });
}

/**
 * Update a task activity
 */
export function useUpdateActivityMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateActivityPayload) =>
            updateTaskActivity(payload),
        onSuccess: (activity, variables) => {
            queryClient.invalidateQueries({
                queryKey: taskKeys.detail(variables.taskId),
            });
            queryClient.refetchQueries({
                queryKey: taskKeys.detail(variables.taskId),
            });
            toast.success("Activity updated");
        },
        onError: (error) => {
            toast.error("Failed to update activity", {
                description: error instanceof Error ? error.message : "An error occurred",
            });
        },
    });
}

/**
 * Delete a task activity
 */
export function useDeleteActivityMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            activityId,
            taskId,
            memberId,
        }: {
            activityId: string;
            taskId: string;
            memberId: string;
        }) => deleteTaskActivity(activityId, taskId, memberId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: taskKeys.detail(variables.taskId),
            });
            queryClient.refetchQueries({
                queryKey: taskKeys.detail(variables.taskId),
            });
            toast.success("Activity deleted");
        },
        onError: (error) => {
            toast.error("Failed to delete activity", {
                description: error instanceof Error ? error.message : "An error occurred",
            });
        },
    });
}