
import { z } from "zod";


export const checkoutSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),
    email: z.string().email("Please enter a valid email address"),
    address: z.string().min(10, "Detailed address is required (minimum 10 characters)"),
    city: z
        .string()
        .trim()
        .min(2, "City is required")
        .max(50, "City name is too long")
        .refine((val) => /^[\u0600-\u06FFA-Za-z\s\-,.]+$/.test(val), {
            message: "City contains invalid characters",
        }),
    phone: z.string().regex(/^[0-9]{11}$/, "Phone number must be exactly 11 digits"),
})

export type checkoutInput = z.infer<typeof checkoutSchema>