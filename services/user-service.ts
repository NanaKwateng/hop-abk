// src/services/user-service.ts
// ============================================================
// API SERVICE LAYER
//
// This file is the ONLY place that talks to the backend.
// Right now it uses mock data. When you add a real API:
//   1. Replace the function bodies with fetch() calls
//   2. Everything else stays the same
//
// Example: fetchUsers currently filters mock data.
// Later:   fetchUsers calls fetch("/api/users?page=1&search=john")
//
// This pattern is called "Repository Pattern" or "Service Layer".
// It separates HOW you get data from HOW you use data.
// ============================================================

import { User, MemberFormData, MemberQueryParams, PaginatedResponse } from "@/lib/types/user-table-types";
//import { useUserStore } from "@/lib/store/user-store";

/**
 * Simulate network delay for realistic loading states.
 * Remove this when connecting to a real API.
 */
const simulateDelay = (ms: number = 500) =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch paginated, filtered, sorted users.
 *
 * CURRENT: Reads from Zustand store (mock data)
 * FUTURE:  Replace with: fetch(`/api/users?${queryString}`)
 */
// export async function fetchUsers(
//     params: MemberQueryParams
// ): Promise<PaginatedResponse<User>> {
//     // Simulate network delay (remove for real API)
//     await simulateDelay(300);

//     //const store = useUserStore.getState();

//     // Step 1: Apply search and filters
//     const filters = params.filters || [];
//     //let filtered = store.getFilteredUsers(params.search || "", filters);

//     // Step 2: Apply sorting
//     // if (params.sortField) {
//     //     filtered.sort((a, b) => {
//     //         const aVal = String(a[params.sortField!]).toLowerCase();
//     //         const bVal = String(b[params.sortField!]).toLowerCase();
//     //         const comparison = aVal.localeCompare(bVal);
//     //         return params.sortDirection === "desc" ? -comparison : comparison;
//     //     });
//     // }

//     // Step 3: Apply pagination
//     // const totalCount = filtered.length;
//     // const totalPages = Math.ceil(totalCount / params.pageSize);
//     // const start = (params.page - 1) * params.pageSize;
//     // const paginatedData = filtered.slice(start, start + params.pageSize);

//     // return {
//     //     data: paginatedData,
//     //     totalCount,
//     //     totalPages,
//     //     currentPage: params.page,
//     //     pageSize: params.pageSize,
//     // };
// }

/**
 * Fetch a single user by ID.
 *
 * FUTURE: fetch(`/api/users/${id}`)
 */
// export async function fetchUserById(id: string): Promise<User | null> {
//     await simulateDelay(200);
//     const user = useUserStore.getState().getUserById(id);
//     return user || null;
// }

/**
 * Create a new user.
 *
 * FUTURE: fetch("/api/users", { method: "POST", body: JSON.stringify(data) })
 */
// export async function createUser(data: MemberFormData): Promise<User> {
//     await simulateDelay(300);
//     return useUserStore.getState().addUser(data);
// }

/**
 * Update an existing user.
 *
 * FUTURE: fetch(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(data) })
 */
// export async function updateUserById(
//     id: string,
//     data: Partial<MemberFormData>
// ): Promise<void> {
//     await simulateDelay(300);
//     useUserStore.getState().updateUser(id, data);
// }

/**
 * Delete a user.
 *
 * FUTURE: fetch(`/api/users/${id}`, { method: "DELETE" })
 */
// export async function deleteUserById(id: string): Promise<void> {
//     await simulateDelay(200);
//     useUserStore.getState().deleteUser(id);
// }

/**
 * Delete multiple users.
 *
 * FUTURE: fetch("/api/users/bulk-delete", { method: "POST", body: JSON.stringify({ ids }) })
 */
// export async function deleteMultipleUsersById(ids: string[]): Promise<void> {
//     await simulateDelay(300);
//     useUserStore.getState().deleteMultipleUsers(ids);
// }

/**
 * Duplicate a user.
 *
 * FUTURE: fetch(`/api/users/${id}/duplicate`, { method: "POST" })
 */
// export async function duplicateUserById(id: string): Promise<User | null> {
//     await simulateDelay(300);
//     return useUserStore.getState().duplicateUser(id);
// }

/**
 * Fetch all users matching current filters (for export).
 * Returns ALL matching users, not paginated.
 *
 * FUTURE: fetch(`/api/users/export?${queryString}`)
 */
// export async function fetchUsersForExport(
//     search: string,
//     filters: { field: keyof User; value: string }[]
// ): Promise<User[]> {
//     await simulateDelay(200);
//     return useUserStore.getState().getFilteredUsers(search, filters);
// }