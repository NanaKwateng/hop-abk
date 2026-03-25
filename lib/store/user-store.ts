// // src/lib/store/user-store.ts
// // ============================================================
// // ZUSTAND STORE — The "global notebook" of the application.
// //
// // Any component can:
// //   - READ: const users = useUserStore(state => state.users)
// //   - WRITE: useUserStore.getState().addUser(newUserData)
// //
// // The store holds:
// //   - All user data
// //   - UI state (selected rows, loading states)
// //   - Actions (add, edit, delete, duplicate users)
// //
// // When TanStack Query is connected to a real API, the store
// // will focus on UI state only, and Query will handle data fetching.
// // ============================================================

// "use client";

// import { create } from "zustand";
// import { User, UserFormData } from "@/lib/types/user-table-types";
// import { mockUsers } from "@/lib/data/mock-data";

// // ---- Store Interface ----
// // Defines the SHAPE of our store: what data it holds and what actions exist

// interface UserStoreState {
//     // --- Data ---
//     users: User[];

//     // --- UI State ---
//     selectedRowIds: Set<string>;    // IDs of selected rows (for bulk actions)
//     isLoading: boolean;             // Loading state (for skeletons)

//     // --- CRUD Actions ---
//     addUser: (data: UserFormData) => User;
//     updateUser: (id: string, data: Partial<UserFormData>) => void;
//     deleteUser: (id: string) => void;
//     deleteMultipleUsers: (ids: string[]) => void;
//     duplicateUser: (id: string) => User | null;
//     getUserById: (id: string) => User | undefined;

//     // --- Selection Actions ---
//     toggleRowSelection: (id: string) => void;
//     selectAllRows: (ids: string[]) => void;
//     clearSelection: () => void;
//     isRowSelected: (id: string) => boolean;

//     // --- Utility ---
//     setLoading: (loading: boolean) => void;
//     getFilteredUsers: (
//         search: string,
//         filters: { field: keyof User; value: string }[]
//     ) => User[];
// }

// /**
//  * Create the Zustand store.
//  *
//  * `create` takes a function that receives `set` and `get`:
//  *   set → updates the store state (triggers re-renders in subscribed components)
//  *   get → reads current state without subscribing (no re-renders)
//  */
// export const useUserStore = create<UserStoreState>((set, get) => ({
//     // ---- Initial State ----
//     users: [...mockUsers], // Start with mock data
//     selectedRowIds: new Set<string>(),
//     isLoading: false,

//     // ---- CRUD Actions ----

//     /**
//      * Add a new user to the store.
//      * Generates a unique ID and timestamps automatically.
//      */
//     addUser: (data: UserFormData): User => {
//         const state = get();

//         // Find the highest existing ID number to generate the next one
//         const maxId = state.users.reduce((max, user) => {
//             const num = parseInt(user.id.replace("USR-", ""), 10);
//             return num > max ? num : max;
//         }, 0);

//         const newUser: User = {
//             ...data,
//             id: `USR-${String(maxId + 1).padStart(4, "0")}`,
//             // If no profile image provided, generate one from initials
//             profileImage:
//                 data.profileImage ||
//                 `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=0D8ABC&color=fff&size=128&bold=true`,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//         };

//         // Add new user at the BEGINNING of the array (most recent first)
//         set({ users: [newUser, ...state.users] });
//         return newUser;
//     },

//     /**
//      * Update an existing user.
//      * Only updates the fields provided in `data` (Partial means optional fields).
//      */
//     updateUser: (id: string, data: Partial<UserFormData>): void => {
//         set((state) => ({
//             users: state.users.map((user) =>
//                 user.id === id
//                     ? { ...user, ...data, updatedAt: new Date().toISOString() }
//                     : user
//             ),
//         }));
//     },

//     /**
//      * Delete a single user by ID.
//      */
//     deleteUser: (id: string): void => {
//         set((state) => ({
//             users: state.users.filter((user) => user.id !== id),
//             // Also remove from selection if selected
//             selectedRowIds: new Set(
//                 [...state.selectedRowIds].filter((rowId) => rowId !== id)
//             ),
//         }));
//     },

//     /**
//      * Delete multiple users at once (bulk delete).
//      */
//     deleteMultipleUsers: (ids: string[]): void => {
//         const idsSet = new Set(ids);
//         set((state) => ({
//             users: state.users.filter((user) => !idsSet.has(user.id)),
//             selectedRowIds: new Set(
//                 [...state.selectedRowIds].filter((rowId) => !idsSet.has(rowId))
//             ),
//         }));
//     },

//     /**
//      * Duplicate a user. Creates a copy with a new ID and modified name/email.
//      */
//     duplicateUser: (id: string): User | null => {
//         const state = get();
//         const original = state.users.find((u) => u.id === id);
//         if (!original) return null;

//         const maxId = state.users.reduce((max, user) => {
//             const num = parseInt(user.id.replace("USR-", ""), 10);
//             return num > max ? num : max;
//         }, 0);

//         const duplicate: User = {
//             ...original,
//             id: `USR-${String(maxId + 1).padStart(4, "0")}`,
//             firstName: `${original.firstName} (Copy)`,
//             email: `copy.${original.email}`,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//         };

//         set({ users: [duplicate, ...state.users] });
//         return duplicate;
//     },

//     /**
//      * Find a single user by ID.
//      * Used by the detail page to show one user's information.
//      */
//     getUserById: (id: string): User | undefined => {
//         return get().users.find((u) => u.id === id);
//     },

//     // ---- Selection Actions ----

//     /** Toggle selection state of a single row */
//     toggleRowSelection: (id: string): void => {
//         set((state) => {
//             const newSet = new Set(state.selectedRowIds);
//             if (newSet.has(id)) {
//                 newSet.delete(id);
//             } else {
//                 newSet.add(id);
//             }
//             return { selectedRowIds: newSet };
//         });
//     },

//     /** Select all provided IDs (or deselect all if all are already selected) */
//     selectAllRows: (ids: string[]): void => {
//         set((state) => {
//             const allSelected = ids.every((id) => state.selectedRowIds.has(id));
//             if (allSelected) {
//                 // Deselect all
//                 return { selectedRowIds: new Set<string>() };
//             } else {
//                 // Select all
//                 return { selectedRowIds: new Set(ids) };
//             }
//         });
//     },

//     /** Clear all selections */
//     clearSelection: (): void => {
//         set({ selectedRowIds: new Set<string>() });
//     },

//     /** Check if a specific row is selected */
//     isRowSelected: (id: string): boolean => {
//         return get().selectedRowIds.has(id);
//     },

//     // ---- Utility ----

//     setLoading: (loading: boolean): void => {
//         set({ isLoading: loading });
//     },

//     /**
//      * Filter users by search query and field-specific filters.
//      * This is used by TanStack Table for client-side filtering.
//      */
//     getFilteredUsers: (
//         search: string,
//         filters: { field: keyof User; value: string }[]
//     ): User[] => {
//         let result = [...get().users];

//         // Apply global search across ALL text fields
//         if (search.trim()) {
//             const query = search.toLowerCase().trim();
//             result = result.filter((user) => {
//                 const searchableText = [
//                     user.id,
//                     user.firstName,
//                     user.lastName,
//                     `${user.firstName} ${user.lastName}`, // Full name search
//                     user.email,
//                     user.phoneNumber,
//                     user.gender,
//                     user.placeOfStay,
//                     user.houseNumber,
//                     user.memberPosition,
//                     user.memberGroup,
//                     user.occupationalType,
//                 ]
//                     .join(" ")
//                     .toLowerCase();

//                 return searchableText.includes(query);
//             });
//         }

//         // Apply field-specific filters
//         for (const filter of filters) {
//             if (filter.value && filter.value !== "all") {
//                 result = result.filter((user) => {
//                     const fieldValue = String(user[filter.field]).toLowerCase();
//                     return fieldValue === filter.value.toLowerCase();
//                 });
//             }
//         }

//         return result;
//     },
// }));