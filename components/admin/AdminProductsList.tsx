"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { Trash2, Edit, Loader2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/action";

export default function AdminProductsList({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [state, action, isPending] = useActionState(deleteProductAction, { success: false, message: "" });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    const result = await action({ id });
    if (result?.success) {
      setProducts((p) => p.filter((x) => x.id !== id));
      // optionally show toast
    } else {
      alert(result?.message || "Failed to delete product");
    }
  };

  return (
    <section className="bg-white rounded-xl border border-stone-200 p-6">
      <h3 className="text-lg font-semibold">Products</h3>
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
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-3 w-24">
                  <div className="h-16 w-24 relative">
                    <img src={p.Image} alt={p.Name} className="object-contain h-16 w-24" />
                  </div>
                </td>
                <td className="py-3">{p.Name}</td>
                <td className="py-3">${p.Price.toLocaleString()}</td>
                <td className="py-3">{p.Category}</td>
                <td className="py-3">{typeof p.Stock === 'number' ? p.Stock : '-'}</td>
                <td className="py-3">{p.Status}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 bg-white" title="Edit">
                      <Edit size={14} /> Edit
                    </button>
                    <button disabled={isPending} onClick={() => handleDelete(p.id)} className="px-3 py-1 border rounded-md text-sm flex items-center gap-2 bg-white text-red-600" title="Delete">
                      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
