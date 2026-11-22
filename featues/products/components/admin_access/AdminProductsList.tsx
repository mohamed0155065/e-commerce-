
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Edit, Loader2, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatUSD } from "@/i18n/formatters";

import { Product } from "../../types/products.types";
import { deleteProductAction } from "../../actions/product_actions";
import EditProductModal from "../admin_access/EditProductModal";

interface AdminProductsListProps {
  initialProducts: Product[];
}

export default function AdminProductsList({
  initialProducts,
}: AdminProductsListProps) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const pendingDeleteProduct =
    pendingDeleteId === null
      ? null
      : products.find((product) => product.id === pendingDeleteId) ?? null;

  useEffect(() => {
    if (!alertMessage) return;

    const timer = window.setTimeout(() => {
      setAlertMessage(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [alertMessage]);

  const handleDelete = async (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    const id = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      setDeletingId(id);

      const result = await deleteProductAction({ id });

      if (!result.success) {
        setAlertMessage({
          type: "error",
          text: t("deleteFailed"),
        });
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );

      setAlertMessage({
        type: "success",
        text: t("deleteSuccess"),
      });
    } catch (error) {
      console.error("Delete product error:", error);

      setAlertMessage({
        type: "error",
        text: t("deleteFailed"),
      });
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
            {t("products")}
          </h3>

          <p className="mt-1 text-xs text-stone-500 sm:text-sm">
            {t("productsCount", { count: products.length })}
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
            <table className="w-full min-w-190 text-start">
              <thead>
                <tr className="border-b border-stone-200 text-xs font-medium uppercase tracking-wide text-stone-500">
                  <th scope="col" className="px-3 py-3">
                    {t("image")}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t("name")}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t("price")}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t("category")}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t("stock")}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t("status")}
                  </th>
                  <th scope="col" className="px-3 py-3">
                    {t("actions")}
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

      {pendingDeleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl shadow-black/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {t("confirmAction")}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-red-700">
                  {t("deleteProduct")}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                aria-label={t("closeDialog")}
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-stone-600">
              {t("deleteConfirm", { name: pendingDeleteProduct.Name })}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                {common("cancel")}
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === pendingDeleteId}
                className="rounded-full bg-[#B91C1C] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {deletingId === pendingDeleteId ? t("deleting") : common("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="fixed end-4 top-4 z-[60] w-full max-w-sm rounded-xl border border-stone-200 bg-white p-4 shadow-xl shadow-black/10">
          <div className="flex items-start gap-3">
            <div
              className={[
                "mt-0.5 h-2.5 w-2.5 rounded-full",
                alertMessage.type === "success"
                  ? "bg-emerald-500"
                  : "bg-red-500",
              ].join(" ")}
            />

            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">
                {alertMessage.type === "success" ? t("success") : t("error")}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {alertMessage.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAlertMessage(null)}
              className="rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              aria-label={t("dismissAlert")}
            >
              <X size={14} />
            </button>
          </div>
        </div>
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
  const locale = useLocale();
  const categories = useTranslations("home");
  return (
    <tr className="group transition-colors hover:bg-stone-50/70">
      <td className="px-3 py-3">
        <ProductImage product={product} size="desktop" />
      </td>

      <td className="max-w-55 px-3 py-3">
        <p
          className="truncate text-sm font-medium text-stone-900"
          title={product.Name}
        >
          {product.Name}
        </p>
      </td>

      <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-stone-900">
        {formatUSD(locale, product.Price)}
      </td>

      <td className="max-w-37.5 px-3 py-3">
        <span className="block truncate text-sm text-stone-600">
          {product.Category && categories.has(`categories.${product.Category}`)
            ? categories(`categories.${product.Category}`)
            : product.Category?.replaceAll("_", " ") || "-"}
        </span>
      </td>

      <td className="px-3 py-3 text-sm text-stone-600">
        {typeof product.Stock === "number" ? new Intl.NumberFormat(locale).format(product.Stock) : "-"}
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
  const locale = useLocale();
  const categories = useTranslations("home");
  const t = useTranslations("admin");
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
                {formatUSD(locale, product.Price)}
              </p>
            </div>

            <ProductStatus status={product.Status} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <ProductMeta
              label={t("category")}
              value={product.Category && categories.has(`categories.${product.Category}`)
                ? categories(`categories.${product.Category}`)
                : product.Category?.replaceAll("_", " ") || "-"}
            />

            <ProductMeta
              label={t("stock")}
              value={
                typeof product.Stock === "number"
                  ? new Intl.NumberFormat(locale).format(product.Stock)
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

  const imageWidth = size === "mobile" ? 80 : 80;
  const imageHeight = size === "mobile" ? 80 : 56;

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-stone-100 bg-stone-50 ${dimensions}`}
    >
      <Image
        src={product.Image}
        alt={product.Name}
        width={imageWidth}
        height={imageHeight}
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
  const t = useTranslations("admin");
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
      {normalizedStatus === "active"
        ? t("active")
        : normalizedStatus === "inactive"
          ? t("inactive")
          : String(status)}
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
  const t = useTranslations("admin");
  return (
    <div
      className={`flex items-center gap-2 ${fullWidth ? "w-full" : ""
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
        aria-label={t("edit")}
      >
        <Edit aria-hidden="true" size={14} />
        {t("edit")}
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
        aria-label={t("deleteProduct")}
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

        {isDeleting ? t("deleting") : t("deleteProduct")}
      </button>
    </div>
  );
}

function EmptyProductsState() {
  const t = useTranslations("admin");
  return (
    <div className="mt-5 rounded-xl border border-dashed border-stone-200 px-4 py-10 text-center">
      <p className="text-sm font-medium text-stone-700">
        {t("noProducts")}
      </p>

      <p className="mt-1 text-xs text-stone-500">
        {t("emptyProductsHelp")}
      </p>
    </div>
  );
}

