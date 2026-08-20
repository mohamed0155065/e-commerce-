"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { updateProductAction } from "@/app/admin/action";
import {
    Upload,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ImageIcon,
    X,
} from "lucide-react";
import { Product } from "@/types";

export default function EditProductModal({
    product,
    onClose,
    onSuccess,
}: {
    product: Product;
    onClose: () => void;
    onSuccess: (updated: Product) => void;
}) {
    const initialState = { success: false, message: "" };
    const [state, formAction, isPending] = useActionState(
        updateProductAction,
        initialState
    );

    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    // Once the update succeeds, hand the fresh product back to the parent and close the modal
    useEffect(() => {
        if (state?.success && state.product) {
            const timer = setTimeout(() => {
                onSuccess(state.product);
                onClose();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [state?.success]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-sm relative my-8">

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-all"
                    title="Close"
                >
                    <X size={20} />
                </button>

                <div className="mb-10 space-y-2">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                        Edit Product
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Update details for &quot;{product.Name}&quot;.
                    </p>
                </div>

                <form action={formAction} className="space-y-8">
                    {/* Hidden field to pass the product id */}
                    <input type="hidden" name="id" value={product.id} />

                    <p className="text-xs text-red-500">DEBUG ID: {String(product.id)} (type: {typeof product.id})</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Product Title
                            </label>
                            <input
                                name="name"
                                required
                                defaultValue={product.Name}
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
                                defaultValue={product.Price}
                                className="w-full p-4 rounded-xl border text-taupe-950 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Category
                            </label>
                            <select
                                name="category"
                                required
                                defaultValue={product.Category}
                                className="w-full p-4 rounded-xl border text-taupe-950 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            >
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
                            <input
                                name="stock"
                                type="number"
                                min={0}
                                defaultValue={product.Stock}
                                className="w-full p-4 rounded-xl border text-taupe-950 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={product.Status}
                                className="w-full p-4 rounded-xl border text-taupe-950 border-slate-200 bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Description
                        </label>
                        <textarea
                            name="description"
                            required
                            defaultValue={product.Description}
                            className="w-full p-4 h-32 rounded-xl border text-taupe-950 border-slate-200 resize-none focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        />
                    </div>

                    {/* Image Upload — optional on edit */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Product Image
                        </label>
                        <p className="text-xs text-slate-400 -mt-1">
                            Leave empty to keep the current image.
                        </p>

                        <div className="relative group border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-600 transition-all cursor-pointer">
                            <input
                                ref={fileRef}
                                name="image"
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setPreview(URL.createObjectURL(file));
                                }}
                            />

                            {preview ? (
                                <img src={preview} alt="New preview" className="h-40 object-contain rounded-xl" />
                            ) : product.Image ? (
                                <img src={product.Image} alt="Current" className="h-40 object-contain rounded-xl" />
                            ) : (
                                <>
                                    <ImageIcon className="w-10 h-10 text-slate-400 mb-3" />
                                    <p className="text-sm font-semibold text-slate-600">
                                        Click to upload a new image
                                    </p>
                                    <span className="text-xs text-slate-400">
                                        PNG, JPG, WEBP supported
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

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

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl border border-slate-300 text-slate-700 font-bold tracking-wide hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>

                        <button
                            disabled={isPending}
                            className="flex-1 py-4 rounded-xl bg-slate-900 text-white font-bold tracking-wide hover:bg-indigo-600 transition-all disabled:bg-slate-300 flex items-center justify-center gap-3"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}