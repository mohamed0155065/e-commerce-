"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { Trash2, Edit, Loader2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/action";

export default function AdminProductsList({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(
    initialProducts || []
  );

  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const result = await deleteProductAction({ id });

      if (result.success) {
        setProducts((currentProducts) =>
          currentProducts.filter(
            (product) => product.id !== id
          )
        );
      } else {
        window.alert(
          result.message || "Failed to delete product"
        );
      }
    } catch (error) {
      console.error("Delete product error:", error);

      window.alert(
        "Failed to delete product. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-stone-200 p-6">
      <h3 className="text-lg font-semibold">
        Products
      </h3>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-stone-600">
              <th className="py-3">Image</th>
              <th className="py-3">Name</th>
              <th className="py-3">Price</th>
              <th className="py-3">Category</th>
              <th className="py-3">Stock</th>
              <th className="py-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const isDeleting =
                deletingId === product.id;

              return (
                <tr
                  key={product.id}
                  className="border-t"
                >
                  <td className="py-3 w-24">
                    <div className="h-16 w-24 relative">
                      <img
                        src={product.Image}
                        alt={product.Name}
                        className="object-contain h-16 w-24"
                      />
                    </div>
                  </td>

                  <td className="py-3">
                    {product.Name}
                  </td>

                  <td className="py-3">
                    ${product.Price.toLocaleString()}
                  </td>

                  <td className="py-3">
                    {product.Category || "-"}
                  </td>

                  <td className="py-3">
                    {typeof product.Stock === "number"
                      ? product.Stock
                      : "-"}
                  </td>

                  <td className="py-3">
                    {product.Status || "-"}
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 bg-white"
                        title="Edit"
                      >
                        <Edit size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          handleDelete(product.id)
                        }
                        className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 bg-white text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        {isDeleting ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={14} />
                        )}

                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}