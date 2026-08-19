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
    description: z.string().min(20, 'Description must be at least 20 characters').trim(),

    // Category: required, must be one of the stable slugs used in DB
    category: z.enum(["laptop", "phones", "smart_watches", "headphones", "earbuds", "other"]),

    // Stock: optional numeric field (defaults to 0 if not provided)
    stock: z.coerce.number().int().nonnegative().optional(),

    // Status: whether product is active or inactive
    status: z.enum(["active", "inactive"]).optional(),
});


// TypeScript type inferred from the schema for type-safe form handling
export type ProductInput = z.infer<typeof productSchema>;