"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/validators/productSchema";

type ActionState = {
    success: boolean;
    message: string;
};

// 🚀 دالة تنظيف اسم الملف من الحروف الغريبة (Senior Level)
const sanitizeFileName = (fileName: string) => {
    return fileName
        .normalize("NFD")               // تفكيك الحروف (ó -> o + نبرة)
        .replace(/[\u0300-\u036f]/g, "") // مسح النبرات
        .replace(/[^a-zA-Z0-9.\-_]/g, "_") // استبدال أي رمز غريب بـ underscore
        .replace(/\s+/g, "-");          // استبدال المسافات بشرطة
};

export async function addProductAction(prevState: ActionState | null, formData: FormData) {
    try {
        const supabase = await supabaseServer();

        // 1. التحقق من الدخول
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");

        // 2. استخراج وفحص البيانات (Matching names with form)
        const rawData = {
            name: formData.get('name'),
            price: formData.get('price'),
            description: formData.get('description'),
        };

        const result = productSchema.safeParse(rawData);
        if (!result.success) {
            return { success: false, message: result.error.errors[0].message };
        }

        const validated = result.data;
        const imageFile = formData.get('image') as File;

        if (!imageFile || imageFile.size === 0) throw new Error("Image is required");

        // 3. تنظيف اسم الصورة ورفعها
        const cleanName = sanitizeFileName(imageFile.name);
        const fileName = `${Date.now()}-${cleanName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("product-images")
            .upload(fileName, imageFile);

        if (uploadErr) throw new Error(`Storage Error: ${uploadErr.message}`);

        const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(uploadData.path);

        // 4. الحفظ في الداتابيز (جدول product المفرد)
        const { error: dbError } = await supabase
            .from('product')
            .insert([{
                Name: validated.name,
                Price: validated.price,
                Description: validated.description,
                Image: publicUrl,
                Category: "General"
            }]);

        if (dbError) throw new Error(`Database Error: ${dbError.message}`);

        revalidatePath("/");
        revalidatePath("/admin/dashboard");

        return { success: true, message: "Product published successfully! 🚀" };

    } catch (error: any) {
        console.error("Full Error Object:", error);

        // 🔒 تأمين الوصول للخطأ
        if (error.errors && error.errors.length > 0) {
            return { success: false, message: error.errors[0].message };
        }

        // لو الخطأ جاي من سوبربايز مباشرة
        return {
            success: false,
            message: error.message || "حدث خطأ غير متوقع يا هندسة"
        };
    }

}