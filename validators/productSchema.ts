import { z } from 'zod';

/**
 * productSchema defines validation rules for adding/editing a product.
 */
export const productSchema = z.object({
    // Product name: must be at least 3 characters long
    name: z.string().min(3, 'Product name must be at least 3 characters'),

    // Price: coerce automatically converts string from the form to a number
    // Must be positive (> 0)
    price: z.coerce.number().positive("Price must be greater than 0"),

    // Description: must be at least 20 characters, trims extra spaces
    description: z.string().min(20, 'Description must be at least 20 characters').trim()
});

// TypeScript type inferred from the schema for type-safe form handling
export type ProductInput = z.infer<typeof productSchema>;