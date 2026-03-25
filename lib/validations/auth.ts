import * as z from "zod";

export const signUpSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
    otp: z.string().min(4, "Please enter the full 4-digit code."),
});

export type OTPInput = z.infer<typeof otpSchema>;