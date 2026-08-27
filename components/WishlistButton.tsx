"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { useWishlistStore } from "@/store/useWishlistStore";

export const WishlistButton = ({ product }: { product: Product }) => {
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const wishlisted = useWishlistStore((state) =>
    state.items.some((item) => item.id === product.id)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => toggleWishlist(product)}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-stone-300 bg-white text-stone-500 transition hover:border-[#b42318] hover:text-[#b42318]"
      aria-label={
        mounted && wishlisted
          ? `Remove ${product.Name} from wishlist`
          : `Add ${product.Name} to wishlist`
      }
      aria-pressed={mounted && wishlisted}
    >
      <Heart
        size={19}
        fill={mounted && wishlisted ? "#b42318" : "none"}
        color={mounted && wishlisted ? "#b42318" : "currentColor"}
      />
    </button>
  );
};