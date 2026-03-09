import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(3, 'Product name must be at least 3 characters'),
    // z.coerce هتحول الـ "120" من الفورم لـ 120 رقم أوتوماتيك
    price: z.coerce.number().positive("Price must be greater than 0"),
    description: z.string().min(20, 'Description must be at least 20 characters').trim()
});

// ✅ التصحيح: infer بحرف صغير
export type ProductInput = z.infer<typeof productSchema>;
