import { z } from "zod"

export const createUserSchema = z.object({
    firstName: z.string().min(2, "First name required"),
    lastName: z.string().min(2, "Last name required"),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().min(5, "Address required"),
    avatar: z.any().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>