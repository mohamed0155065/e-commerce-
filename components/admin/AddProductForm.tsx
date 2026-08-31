"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { addProductAction } from "@/app/admin/action";
import {
    Upload,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ImageIcon,
} from "lucide-react";

const INITIAL_STATE = { success: false, message: "" };

/**
 * AddProductForm
 *
 * Publishes a new product via the `addProductAction` server action.
 * Handles local image preview and resets the form (including the file
 * input, which React can't control directly) after a successful submit.
 *
 * Sizing/color tokens intentionally mirror EditProductModal and the rest
 * of the admin (stone/emerald palette, compact field density) rather than
 * the oversized indigo-themed styling this form previously had — the two
 * product forms should read as the same product, not two different apps.
 */
export default function AddProductForm() {
    const [state, formAction, isPending] = useActionState(
        addProductAction,
        INITIAL_STATE
    );

    const [preview, setPreview] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    // Revoke the blob URL on unmount so we don't leak memory.
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    // On a successful publish, clear the form — including the file input,
    // which `formRef.current?.reset()` alone won't touch reliably enough
    // to also drop our in-memory preview state.
    useEffect(() => {
        if (!state?.success) return;

        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }

        formRef.current?.reset();
        if (fileRef.current) fileRef.current.value = "";
    }, [state?.success]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setPreview(URL.createObjectURL(file));
    };

    return (
        <div
            className="
                mx-auto w-full max-w-3xl
                rounded-2xl border border-stone-200 bg-white
                p-5 shadow-[0_8px_30px_rgb(28_29_26/0.04)]
                sm:p-6
            "
        >
            <div className="mb-6 space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-stone-950 sm:text-xl">
                    Publish product
                </h2>
                <p className="text-sm text-stone-500">
                    Add a new product to your store inventory.
                </p>
            </div>

            <form ref={formRef} action={formAction} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Product title">
                        <input
                            name="name"
                            required
                            disabled={isPending}
                            autoComplete="off"
                            className={inputClassName}
                        />
                    </FormField>

                    <FormField label="Price ($)">
                        <input
                            name="price"
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            disabled={isPending}
                            className={inputClassName}
                        />
                    </FormField>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField label="Category">
                        <select
                            name="category"
                            required
                            disabled={isPending}
                            defaultValue="laptop"
                            className={inputClassName}
                        >
                            <option value="laptop">Laptop</option>
                            <option value="phones">Phones</option>
                            <option value="smart_watches">Smart Watches</option>
                            <option value="headphones">Headphones</option>
                            <option value="earbuds">Earbuds</option>
                            <option value="other">Other</option>
                        </select>
                    </FormField>

                    <FormField label="Stock quantity">
                        <input
                            name="stock"
                            type="number"
                            min={0}
                            step={1}
                            defaultValue={0}
                            inputMode="numeric"
                            disabled={isPending}
                            className={inputClassName}
                        />
                    </FormField>

                    <FormField label="Status">
                        <select
                            name="status"
                            defaultValue="active"
                            disabled={isPending}
                            className={inputClassName}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </FormField>
                </div>

                <FormField label="Description">
                    <textarea
                        name="description"
                        required
                        rows={4}
                        disabled={isPending}
                        className={`${inputClassName} min-h-28 resize-y`}
                    />
                </FormField>

                <div className="space-y-1.5">
                    <label className={labelClassName}>Product image</label>

                    <div
                        className="
                            relative flex min-h-40 flex-col items-center justify-center
                            overflow-hidden rounded-xl border-2 border-dashed border-stone-300
                            bg-stone-50/50 p-5 text-center transition-colors
                            hover:border-emerald-600 hover:bg-emerald-50/30
                        "
                    >
                        <input
                            ref={fileRef}
                            name="image"
                            type="file"
                            required
                            accept="image/jpeg,image/png,image/webp"
                            disabled={isPending}
                            onChange={handleImageChange}
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                        />

                        {preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={preview}
                                alt="Selected product preview"
                                className="max-h-40 max-w-full rounded-lg object-contain"
                            />
                        ) : (
                            <>
                                <ImageIcon
                                    aria-hidden="true"
                                    className="mb-2.5 h-8 w-8 text-stone-400"
                                />
                                <p className="text-sm font-medium text-stone-600">
                                    Click to upload product image
                                </p>
                                <span className="mt-0.5 text-xs text-stone-400">
                                    JPG, PNG or WEBP
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {state?.message && (
                    <div
                        role={state.success ? "status" : "alert"}
                        aria-live="polite"
                        className={`flex items-center gap-2.5 rounded-lg p-3 text-sm font-medium ${state.success
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                    >
                        {state.success ? (
                            <CheckCircle2 size={17} className="shrink-0" aria-hidden="true" />
                        ) : (
                            <AlertCircle size={17} className="shrink-0" aria-hidden="true" />
                        )}
                        {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="
                        inline-flex w-full items-center justify-center gap-2
                        rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white
                        transition-colors hover:bg-emerald-700
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600
                        disabled:cursor-not-allowed disabled:bg-stone-300
                    "
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                            Publishing...
                        </>
                    ) : (
                        <>
                            <Upload size={16} aria-hidden="true" />
                            Publish product
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

/* ==========================================================================
   Shared field styling — kept in sync with EditProductModal's tokens so the
   "add" and "edit" product forms are visually indistinguishable apart from
   their content.
   ========================================================================== */

const labelClassName =
    "block text-[11px] font-bold uppercase tracking-wider text-stone-500";

const inputClassName = `
    w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5
    text-sm text-stone-950 outline-none transition-[border-color,box-shadow]
    placeholder:text-stone-400
    focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15
    disabled:cursor-not-allowed disabled:bg-stone-50
`;

function FormField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className={labelClassName}>{label}</label>
            {children}
        </div>
    );
}