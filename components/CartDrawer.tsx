"use client";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useHydration } from "@/store/useHydration";

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  /**
   * Senior-level fix: this component previously did
   *
   *   const { items, addItem, removeItem, getTotalPrice } = useCartStore();
   *
   * Calling the hook with NO selector subscribes to the entire store object.
   * CartDrawer is mounted permanently by Navbar (it's just translated
   * off-screen via CSS when closed, not unmounted), which meant every single
   * `addItem` / `removeItem` call ANYWHERE on the site — even from a product
   * card while the drawer is closed and invisible — forced this component to
   * re-render, recompute totals and re-map the cart list.
   *
   * Selecting only `items` (a stable reference unless it actually changes)
   * and grabbing the action functions individually keeps the subscription
   * narrow: Zustand's default `Object.is` check on each selected slice means
   * this component only re-renders when `items` itself changes, which is
   * exactly the data it needs to render.
   */
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const removeAllOfItem = useCartStore((state) => state.removeAllOfItem);

  const hydrated = useHydration();

  const keydown = useCallback((event: KeyboardEvent) => { if (isOpen && event.key === "Escape") onClose(); }, [isOpen, onClose]);
  useEffect(() => { document.addEventListener("keydown", keydown); return () => document.removeEventListener("keydown", keydown); }, [keydown]);
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isOpen]);

  // Derive totals from `items` with useMemo instead of calling the store's
  // getTotalPrice()/reduce on every render unconditionally — cheap here given
  // typical cart sizes, but useMemo makes the dependency explicit and skips
  // the recompute on renders that aren't caused by `items` changing (e.g. a
  // parent re-render passing a new `onClose` reference).
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.Price * item.quantity, 0),
    [items]
  );
  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  if (!hydrated) return null;
  return createPortal(
    <>
      <div onClick={onClose} className={`fixed inset-0 z-[70] bg-stone-950/35 transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-label="Shopping cart" className={`fixed right-0 top-0 z-[71] flex h-dvh w-full max-w-md flex-col bg-[#f7f7f4] shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
          <div>
            <p className="text-base font-semibold">Your cart</p>
            <p className="mt-0.5 text-xs text-stone-500">{count ? `${count} item${count === 1 ? "" : "s"}` : "No items yet"}</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center text-stone-600 hover:bg-stone-100" aria-label="Close cart"><X size={19} /></button>
        </header>
        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center px-8 text-center">
            <div>
              <ShoppingBag className="mx-auto text-stone-400" size={30} />
              <h2 className="mt-4 font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">Find something useful for the every day.</p>
              <Link onClick={onClose} href="/" className="mt-6 inline-block bg-[#285943] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d4534]">Browse products</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <ul className="space-y-5">
                {items.map((item) => (
                  <li className="flex gap-3" key={item.id}>
                    <div className="relative h-20 w-20 shrink-0 border border-stone-200 bg-white">
                      <Image src={item.Image} alt="" fill sizes="80px" className="object-contain p-2" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.Name}</p>
                      <p className="mt-1 text-sm text-stone-600">${item.Price.toLocaleString()}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex border border-stone-300">
                          <button onClick={() => removeItem(item.id)} className="grid h-7 w-7 place-items-center hover:bg-stone-100" aria-label={`Reduce ${item.Name} quantity`}><Minus size={13} /></button>
                          <span className="grid w-7 place-items-center text-xs font-semibold">{item.quantity}</span>
                          <button onClick={() => addItem(item)} className="grid h-7 w-7 place-items-center hover:bg-stone-100" aria-label={`Increase ${item.Name} quantity`}><Plus size={13} /></button>
                        </div>
                        <button onClick={() => removeAllOfItem(item.id)} className="text-stone-500 hover:text-red-700" aria-label={`Remove ${item.Name}`}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <footer className="border-t border-stone-200 bg-white p-5">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Delivery</span>
                <span className="font-medium text-[#23734d]">Free</span>
              </div>
              <div className="mt-4 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <Link onClick={onClose} href="/checkout" className="mt-5 flex items-center justify-center bg-[#285943] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#1d4534]">Continue to checkout</Link>
            </footer>
          </>
        )}
      </aside>
    </>,
    document.body
  );
};