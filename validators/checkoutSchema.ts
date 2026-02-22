import { checkoutSchema } from './checkoutSchema';
import { z } from "zod";
import React from 'react'

export const checkoutSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters long"),
    email: z.string().email("Please enter a valid email address"),
    address: z.string().min(10, "Detailed address is required (minimum 10 characters)"),
    phone: z.string().regex(/^[0-9]{11}$/, "Phone number must be exactly 11 digits"),
})

export type checkoutInput = z.infer<typeof checkoutSchema>