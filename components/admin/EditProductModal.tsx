
"use client";

import {
    useActionState,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
    ImageIcon,
    Loader2,
    Upload,
    X,
} from "lucide-react";

import { updateProductAction } from "@/app/admin/action";
import { Product } from "@/types";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

type EditProductModalProps = {
    product: Product;
    onClose: () => void;
    onSuccess: (updated: Product) => void;
};

const INITIAL_STATE = {
    success: false,
    message: "",
};

/**
 * EditProductModal
 *
 * Client-side responsibilities are intentionally limited to:
 * - Form interaction
 * - Local image preview
 * - UI state
 * - Server Action submission
 *
 * Business validation and authorization MUST still happen
 * inside updateProductAction on the server.
 */
export default function EditProductModal({
    product,
    onClose,
    onSuccess,
}: EditProductModalProps) {
    const [state, formAction, isPending] = useActionState(
        updateProductAction,
        INITIAL_STATE
    );

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const fileRef = useRef<HTMLInputElement>(null);

    /**
     * Revoke the currently active object URL whenever it changes.
     *
     * This prevents blob URLs from accumulating in memory when
     * the user selects multiple images before submitting.
     */
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    /**
     * Handle successful server mutation.
     *
     * Keep the small delay only to let the user visually register
     * the success state before the modal disappears.
     */
    useEffect(() => {
        if (!state?.success || !state.product) {
            return;
        }

        const timer = window.setTimeout(() => {
            onSuccess(state.product);
            onClose();
        }, 600);

        return () => window.clearTimeout(timer);
    }, [state?.success, state?.product, onSuccess, onClose]);

    /**
     * Lock background scrolling while the modal is open.
     *
     * This is especially important on mobile where a fixed modal
     * can otherwise compete with the page underneath it.
     */
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    /**
     * Allow keyboard users to close the modal with Escape.
     *
     * Do not close while a mutation is running because the user
     * should not accidentally interrupt the submission flow.
     */
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isPending) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isPending, onClose]);

    const handleImageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        /**
         * Client validation improves UX.
         * The server MUST validate the same constraints again.
         */
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            setImageError(
                "Please select a JPG, PNG, or WEBP image."
            );

            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setImageError(
                "Image size must be smaller than 5 MB."
            );

            event.target.value = "";
            return;
        }

        setImageError(null);

        /**
         * Revoke the previous blob URL before creating a new one.
         * This avoids retaining unnecessary browser memory.
         */
        setPreviewUrl((previousUrl) => {
            if (previousUrl) {
                URL.revokeObjectURL(previousUrl);
            }

            return URL.createObjectURL(file);
        });
    };

    const handleClose = () => {
        if (isPending) {
            return;
        }

        onClose();
    };

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-start justify-center
                overflow-y-auto
                bg-black/50
                p-3
                sm:items-center sm:p-4
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            aria-describedby="edit-product-description"
        >
            <div
                className="
                    relative my-3 w-full max-w-4xl
                    rounded-2xl border border-slate-200
                    bg-white shadow-xl
                    sm:my-6 sm:rounded-[2rem]
                    lg:my-8
                "
            >
                {/* =====================================================
                    Header
                ====================================================== */}

                <div className="p-5 sm:p-7 md:p-8 lg:p-10">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isPending}
                        aria-label="Close edit product modal"
                        title="Close"
                        className="
                            absolute right-3 top-3
                            inline-flex min-h-10 min-w-10
                            items-center justify-center
                            rounded-full
                            text-slate-500
                            transition-colors
                            hover:bg-slate-100
                            hover:text-slate-900
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-indigo-600
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:right-5 sm:top-5
                        "
                    >
                        <X
                            size={20}
                            aria-hidden="true"
                        />
                    </button>

                    <div className="space-y-1.5 pr-12 sm:space-y-2">
                        <h2
                            id="edit-product-title"
                            className="
                                text-xl font-bold tracking-tight
                                text-slate-900
                                sm:text-2xl
                                md:text-3xl
                            "
                        >
                            Edit Product
                        </h2>

                        <p
                            id="edit-product-description"
                            className="
                                max-w-2xl
                                text-xs font-medium
                                leading-5 text-slate-500
                                sm:text-sm
                            "
                        >
                            Update details for &quot;
                            {product.Name}
                            &quot;.
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    Form
                ====================================================== */}

                <form
                    action={formAction}
                    className="
                        space-y-6
                        border-t border-slate-100
                        p-5
                        sm:space-y-7 sm:p-7
                        md:p-8
                        lg:p-10
                    "
                >
                    <input
                        type="hidden"
                        name="id"
                        value={product.id}
                    />

                    {/* Product title / price */}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <FormField label="Product Title">
                            <input
                                name="name"
                                required
                                defaultValue={product.Name}
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
                                defaultValue={product.Price}
                                inputMode="decimal"
                                className={inputClassName}
                            />
                        </FormField>
                    </div>

                    {/* Category / stock / status */}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <FormField label="Category">
                            <select
                                name="category"
                                required
                                defaultValue={product.Category}
                                className={inputClassName}
                            >
                                <option value="laptop">
                                    Laptop
                                </option>
                                <option value="phones">
                                    Phones
                                </option>
                                <option value="smart_watches">
                                    Smart Watches
                                </option>
                                <option value="headphones">
                                    Headphones
                                </option>
                                <option value="earbuds">
                                    Earbuds
                                </option>
                                <option value="other">
                                    Other
                                </option>
                            </select>
                        </FormField>

                        <FormField label="Stock Quantity">
                            <input
                                name="stock"
                                type="number"
                                min={0}
                                step={1}
                                defaultValue={product.Stock}
                                inputMode="numeric"
                                className={inputClassName}
                            />
                        </FormField>

                        <FormField label="Status">
                            <select
                                name="status"
                                defaultValue={product.Status}
                                className={inputClassName}
                            >
                                <option value="active">
                                    Active
                                </option>
                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>
                        </FormField>
                    </div>

                    {/* Description */}

                    <FormField label="Description">
                        <textarea
                            name="description"
                            required
                            defaultValue={product.Description}
                            rows={5}
                            className={`${inputClassName} min-h-32 resize-y`}
                        />
                    </FormField>

                    {/* =================================================
                        Image Upload
                    ================================================== */}

                    <div className="space-y-3">
                        <div>
                            <label
                                htmlFor="product-image"
                                className={labelClassName}
                            >
                                Product Image
                            </label>

                            <p className="mt-1 text-xs text-slate-400">
                                Leave empty to keep the current image.
                                Maximum 5 MB.
                            </p>
                        </div>

                        <div
                            className="
                                relative flex min-h-48
                                flex-col items-center justify-center
                                overflow-hidden
                                rounded-2xl
                                border-2 border-dashed
                                border-slate-300
                                bg-slate-50/50
                                p-5
                                text-center
                                transition-colors
                                hover:border-indigo-500
                                hover:bg-indigo-50/20
                            "
                        >
                            <input
                                ref={fileRef}
                                id="product-image"
                                name="image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={isPending}
                                onChange={handleImageChange}
                                className="
                                    absolute inset-0
                                    z-10
                                    h-full w-full
                                    cursor-pointer
                                    opacity-0
                                    disabled:cursor-not-allowed
                                "
                            />

                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="New product preview"
                                    className="
                                        max-h-48
                                        max-w-full
                                        rounded-xl
                                        object-contain
                                    "
                                />
                            ) : product.Image ? (
                                <img
                                    src={product.Image}
                                    alt={`${product.Name} current image`}
                                    loading="lazy"
                                    decoding="async"
                                    className="
                                        max-h-48
                                        max-w-full
                                        rounded-xl
                                        object-contain
                                    "
                                />
                            ) : (
                                <>
                                    <ImageIcon
                                        aria-hidden="true"
                                        className="
                                            mb-3
                                            h-9 w-9
                                            text-slate-400
                                        "
                                    />

                                    <p className="text-sm font-semibold text-slate-600">
                                        Click to upload a new image
                                    </p>

                                    <span className="mt-1 text-xs text-slate-400">
                                        JPG, PNG or WEBP · Max 5 MB
                                    </span>
                                </>
                            )}
                        </div>

                        {imageError && (
                            <p
                                className="
                                    flex items-center gap-2
                                    text-xs font-medium
                                    text-red-600
                                "
                                role="alert"
                            >
                                <AlertCircle
                                    size={15}
                                    aria-hidden="true"
                                />

                                {imageError}
                            </p>
                        )}
                    </div>

                    {/* Server Action feedback */}

                    {state?.message && (
                        <div
                            role={state.success ? "status" : "alert"}
                            aria-live="polite"
                            className={`
                                flex items-start gap-3
                                rounded-xl p-3.5
                                text-sm font-semibold
                                sm:p-4
                                ${
                                    state.success
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-red-50 text-red-700"
                                }
                            `}
                        >
                            {state.success ? (
                                <CheckCircle2
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    aria-hidden="true"
                                />
                            ) : (
                                <AlertCircle
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    aria-hidden="true"
                                />
                            )}

                            <span>{state.message}</span>
                        </div>
                    )}

                    {/* =================================================
                        Actions
                    ================================================== */}

                    <div
                        className="
                            flex flex-col-reverse gap-3
                            border-t border-slate-100
                            pt-5
                            sm:flex-row sm:justify-end
                        "
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isPending}
                            className={`
                                ${secondaryButtonClassName}
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            `}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className={`
                                ${primaryButtonClassName}
                                disabled:cursor-not-allowed
                                disabled:bg-slate-300
                            `}
                        >
                            {isPending ? (
                                <>
                                    <Loader2
                                        className="animate-spin"
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Upload
                                        size={17}
                                        aria-hidden="true"
                                    />

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

/* ==========================================================================
   Reusable local UI primitives
   ========================================================================== */

const labelClassName = `
    block
    text-[11px]
    font-bold
    uppercase
    tracking-[0.12em]
    text-slate-500
    sm:text-xs
`;

const inputClassName = `
    mt-1
    w-full
    rounded-xl
    border border-slate-200
    bg-white
    px-3.5 py-3
    text-sm
    text-slate-950
    outline-none
    transition-[border-color,box-shadow]
    placeholder:text-slate-400
    focus:border-indigo-500
    focus:ring-2
    focus:ring-indigo-500/20
    disabled:cursor-not-allowed
    disabled:bg-slate-50
    sm:px-4 sm:py-3.5
`;

const secondaryButtonClassName = `
    inline-flex
    min-h-11
    flex-1
    items-center
    justify-center
    rounded-xl
    border border-slate-300
    bg-white
    px-5
    text-sm
    font-bold
    tracking-wide
    text-slate-700
    transition-colors
    hover:bg-slate-50
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-slate-400
    sm:flex-none
`;

const primaryButtonClassName = `
    inline-flex
    min-h-11
    flex-1
    items-center
    justify-center
    gap-2.5
    rounded-xl
    bg-slate-900
    px-5
    text-sm
    font-bold
    tracking-wide
    text-white
    transition-colors
    hover:bg-indigo-600
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-indigo-500
    sm:flex-none
`;

function FormField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <label className={labelClassName}>
                {label}
            </label>

            {children}
        </div>
    );
}

