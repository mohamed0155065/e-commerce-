"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { addProductAction } from "@/app/admin/action";
import {
    Upload,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ImageIcon,
} from "lucide-react";
import Image from "next/image";
/**
 * AddProductForm Component
 * - Provides a form to add a new product to the store
 * - Handles image preview, form submission, and feedback messages
 * - Integrates with server action `addProductAction`
 */
export default function AddProductForm() {
    // Initial state for action feedback
    const initialState = { success: false, message: "" };

    // useActionState: [state, formAction, isPending]
    const [state, formAction, isPending] = useActionState(
        addProductAction,
        initialState
    );

    // Preview URL for uploaded image
    const [preview, setPreview] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    // Reset the form and file input on successful submission
    useEffect(() => {
        if (state?.success) {
            // clear preview and revoke URL
            if (preview) {
                URL.revokeObjectURL(preview);
                setPreview(null);
            }
            // Reset native form (clears file inputs too)
            formRef.current?.reset();
            if (fileRef.current) fileRef.current.value = "";
        }
    }, [state?.success]);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-sm">

            {/* Header */}
            <div className="mb-10 space-y-2">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                    Publish Product
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                    Add a new product to your store inventory.
                </p>
            </div>

            <form ref={formRef} action={formAction} className="space-y-8">

                {/* Product Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Product Title
                        </label>
                        <input
                            name="name"
                            required
                            className="w-full p-4 rounded-xl border text-taupe-950 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Price ($)
                        </label>
                        <input
                            name="price"
                            required
                            type="number"
                            step="0.01"
                            className="w-full p-4 rounded-xl border text-taupe-950 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Category / Stock / Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Category
                        </label>
                        <select name="category" required className="w-full p-4 rounded-xl border text-taupe-950 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all">
                            <option value="laptop">Laptop</option>
                            <option value="phones">Phones</option>
                            <option value="smart_watches">Smart Watches</option>
                            <option value="headphones">Headphones</option>
                            <option value="earbuds">Earbuds</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Stock quantity
                        </label>
                        <input name="stock" type="number" defaultValue={0} min={0} className="w-full p-4 rounded-xl border text-taupe-950 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Status
                        </label>
                        <select name="status" className="w-full p-4 rounded-xl border text-taupe-950 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Description
                    </label>
                    <textarea
                        name="description"
                        required
                        className="w-full p-4 h-32 rounded-xl border text-taupe-950 border-slate-200 resize-none focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Product Image
                    </label>

                    <div className="relative group border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-600 transition-all cursor-pointer">
                        <input
                            ref={fileRef}
                            name="image"
                            type="file"
                            required
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setPreview(URL.createObjectURL(file));
                            }}
                        />

                        {preview ? (
                            // next/image cannot render object URLs in server components directly, but this is a client component
                            <img src={preview} alt="Preview" className="h-40 object-contain rounded-xl" />
                        ) : (
                            <>
                                <ImageIcon className="w-10 h-10 text-slate-400 mb-3" />
                                <p className="text-sm font-semibold text-slate-600">
                                    Click to upload product image
                                </p>
                                <span className="text-xs text-slate-400">
                                    PNG, JPG, WEBP supported
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Feedback Message */}
                {state?.message && (
                    <div
                        className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${state.success
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                            }`}
                    >
                        {state.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {state.message}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    disabled={isPending}
                    className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold tracking-wide hover:bg-indigo-600 transition-all disabled:bg-slate-300 flex items-center justify-center gap-3"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Publishing...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            Publish Product
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
