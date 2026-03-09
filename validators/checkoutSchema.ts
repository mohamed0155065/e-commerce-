import { z } from "zod";

/**
 * checkoutSchema defines the validation rules for the checkout form.
 */
export const checkoutSchema = z.object({
    // Full name: must be at least 3 characters long
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),

    // Email: must be a valid email format
    email: z.string().email("Please enter a valid email address"),

    // Address: detailed address is required, minimum 10 characters
    address: z.string().min(10, "Detailed address is required (minimum 10 characters)"),

    // City: must be 2-50 characters, only allows Arabic letters, Latin letters, spaces, hyphens, commas, and periods
    city: z
        .string()
        .trim() // Remove leading/trailing spaces
        .min(2, "City is required")
        .max(50, "City name is too long")
        .refine((val) => /^[\u0600-\u06FFA-Za-z\s\-,.]+$/.test(val), {
            message: "City contains invalid characters",
        }),

    // Phone: must be exactly 11 digits
    phone: z.string().regex(/^[0-9]{11}$/, "Phone number must be exactly 11 digits"),
});

// Type inference for the checkout form inputs
export type checkoutInput = z.infer<typeof checkoutSchema>;