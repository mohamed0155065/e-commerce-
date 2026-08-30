
"use client";

import React, { useState } from "react";
import { Edit, Loader2, Trash2 } from "lucide-react";

import { Product } from "@/types";
import { deleteProductAction } from "@/app/admin/action";
import EditProductModal from "./EditProductModal";

interface AdminProductsListProps {
  initialProducts: Product[];
}

export default function AdminProductsList({
  initialProducts,
}: AdminProductsListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const result = await deleteProductAction({ id });

      if (!result.success) {
        window.alert(result.message || "Failed to delete product");
        return;
      }

      // Update only the affected collection instead of refetching
      // the entire product list after a successful mutation.
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error("Delete product error:", error);

      window.alert("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSuccess = (updatedProduct: Product) => {
    // Replace only the updated entity.
    // This avoids an unnecessary API request for the complete list.
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );

    setEditingProduct(null);
  };

  return (
    <section
      aria-labelledby="products-heading"
      className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 lg:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3
            id="products-heading"
            className="text-base font-semibold text-stone-900 sm:text-lg"
          >
            Products
          </h3>

          <p className="mt-1 text-xs text-stone-500 sm:text-sm">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyProductsState />
      ) : (
        <>
          {/* ============================================================
              MOBILE
              Card-based layout is much more usable than a wide table.
          ============================================================ */}
          <div className="mt-5 space-y-3 md:hidden">
            {products.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                isDeleting={deletingId === product.id}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>

          {/* ============================================================
              TABLET / DESKTOP
              Keep the semantic table for larger viewports.
          ============================================================ */}
          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-stone-200 text-xs font-medium uppercase tracking-wide text-stone-500">
                  <th scope="col" className="px-3 py-3">
                    Image
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Price
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Stock
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {products.map((product) => (
                  <DesktopProductRow
                    key={product.id}
                    product={product}
                    isDeleting={deletingId === product.id}
                    onEdit={() => setEditingProduct(product)}
                    onDelete={() => handleDelete(product.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal is mounted only when actually needed. */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop Row                                                                 */
/* -------------------------------------------------------------------------- */

interface ProductItemProps {
  product: Product;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function DesktopProductRow({
  product,
  isDeleting,
  onEdit,
  onDelete,
}: ProductItemProps) {
  return (
    <tr className="group transition-colors hover:bg-stone-50/70">
      <td className="px-3 py-3">
        <ProductImage product={product} size="desktop" />
      </td>

      <td className="max-w-[220px] px-3 py-3">
        <p
          className="truncate text-sm font-medium text-stone-900"
          title={product.Name}
        >
          {product.Name}
        </p>
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-stone-900">
        ${product.Price.toLocaleString()}
      </td>

      <td className="max-w-[150px] px-3 py-3">
        <span className="block truncate text-sm text-stone-600">
          {product.Category || "-"}
        </span>
      </td>

      <td className="px-3 py-3 text-sm text-stone-600">
        {typeof product.Stock === "number" ? product.Stock : "-"}
      </td>

      <td className="px-3 py-3">
        <ProductStatus status={product.Status} />
      </td>

      <td className="px-3 py-3">
        <ProductActions
          isDeleting={isDeleting}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile Card                                                                 */
/* -------------------------------------------------------------------------- */

function MobileProductCard({
  product,
  isDeleting,
  onEdit,
  onDelete,
}: ProductItemProps) {
  return (
    <article className="rounded-xl border border-stone-200 p-3.5">
      <div className="flex gap-3">
        <ProductImage product={product} size="mobile" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4
                className="truncate text-sm font-semibold text-stone-900"
                title={product.Name}
              >
                {product.Name}
              </h4>

              <p className="mt-1 text-sm font-medium text-stone-700">
                ${product.Price.toLocaleString()}
              </p>
            </div>

            <ProductStatus status={product.Status} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <ProductMeta
              label="Category"
              value={product.Category || "-"}
            />

            <ProductMeta
              label="Stock"
              value={
                typeof product.Stock === "number"
                  ? String(product.Stock)
                  : "-"
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-stone-100 pt-3">
        <ProductActions
          isDeleting={isDeleting}
          onEdit={onEdit}
          onDelete={onDelete}
          fullWidth
        />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                   */
/* -------------------------------------------------------------------------- */

function ProductImage({
  product,
  size,
}: {
  product: Product;
  size: "mobile" | "desktop";
}) {
  const dimensions =
    size === "mobile"
      ? "h-20 w-20 rounded-lg"
      : "h-14 w-20 rounded-md";

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-stone-100 bg-stone-50 ${dimensions}`}
    >
      <img
        src={product.Image}
        alt={product.Name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function ProductStatus({
  status,
}: {
  status: Product["Status"];
}) {
  if (!status) {
    return <span className="text-sm text-stone-400">-</span>;
  }

  const normalizedStatus = String(status).toLowerCase();

  const isActive =
    normalizedStatus === "active" ||
    normalizedStatus === "available" ||
    normalizedStatus === "in stock";

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[11px] font-medium",
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-stone-100 text-stone-600",
      ].join(" ")}
    >
      {String(status)}
    </span>
  );
}

function ProductMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-stone-400">{label}</p>
      <p className="mt-0.5 truncate font-medium text-stone-700">
        {value}
      </p>
    </div>
  );
}

function ProductActions({
  isDeleting,
  onEdit,
  onDelete,
  fullWidth = false,
}: {
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <button
        type="button"
        onClick={onEdit}
        disabled={isDeleting}
        className={[
          "inline-flex min-h-9 items-center justify-center gap-1.5",
          "rounded-md border border-stone-200 bg-white px-3",
          "text-xs font-medium text-stone-700",
          "transition-colors hover:bg-stone-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          fullWidth ? "flex-1" : "",
        ].join(" ")}
        aria-label={`Edit ${onEdit ? "product" : ""}`}
      >
        <Edit aria-hidden="true" size={14} />
        Edit
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className={[
          "inline-flex min-h-9 items-center justify-center gap-1.5",
          "rounded-md border border-red-100 bg-white px-3",
          "text-xs font-medium text-red-600",
          "transition-colors hover:bg-red-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          fullWidth ? "flex-1" : "",
        ].join(" ")}
        aria-label="Delete product"
      >
        {isDeleting ? (
          <Loader2
            aria-hidden="true"
            size={14}
            className="animate-spin"
          />
        ) : (
          <Trash2 aria-hidden="true" size={14} />
        )}

        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}

function EmptyProductsState() {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-stone-200 px-4 py-10 text-center">
      <p className="text-sm font-medium text-stone-700">
        No products found
      </p>

      <p className="mt-1 text-xs text-stone-500">
        Products will appear here once they are added.
      </p>
    </div>
  );
}

