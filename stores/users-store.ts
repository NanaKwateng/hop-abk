"use client"

import { create } from "zustand"

interface User {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
    phone?: string
    membership_id?: string
}

interface UsersState {
    users: User[]
    loading: boolean
    setUsers: (users: User[]) => void
    addUser: (user: User) => void
    removeUser: (id: string) => void
}

export const useUsersStore = create<UsersState>((set) => ({
    users: [],
    loading: true,

    setUsers: (users) => set({ users, loading: false }),

    addUser: (user) =>
        set((state) => ({
            users: [user, ...state.users],
        })),

    removeUser: (id) =>
        set((state) => ({
            users: state.users.filter((u) => u.id !== id),
        })),
}))