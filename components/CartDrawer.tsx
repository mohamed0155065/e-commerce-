"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CartDrawer — Zero-Scroll Layout
//
// The drawer is split into three fixed flex sections:
//   1. <header>  — sticky top bar,   flex-shrink-0 (never compresses)
//   2. <main>    — product list,     flex-1 + overflow-hidden (fills space,
//                                    items scale to fit — NO scrollbar ever)
//   3. <footer>  — order summary,    flex-shrink-0 (never compresses)
//
// Body scroll is locked while the drawer is open so the page
// behind also never scrolls.
// ─────────────────────────────────────────────────────────────────────────────

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
    const { items, addItem, removeItem, getTotalPrice } = useCartStore();

    // Guard against SSR/hydration mismatch — only render on the client
    const [mounted, setMounted] = useState(false);

    // ── Close on Escape key ────────────────────────────────────────────────────
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        },
        [isOpen, onClose]
    );

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // ── Lock background page scroll while drawer is open ──────────────────────
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!mounted) return null;

    // ── Derived values ─────────────────────────────────────────────────────────
    const totalPrice = getTotalPrice();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const savings = Math.round(totalPrice * 0.1); // 10% promotional saving

    // ── Portal: escapes the <header> stacking context ────────────────────────
    // CartDrawer lives inside <header z-[60]> in Navbar.
    // CSS stacking contexts mean a child's z-index only competes within its
    // parent — so z-[99999] inside z-[60] still loses to anything outside it.
    // createPortal teleports the DOM nodes to document.body so the drawer
    // sits at the root stacking context and truly covers everything.
    return createPortal((
        <>
            {/* ── Backdrop ──────────────────────────────────────────────────────────
          Dims + blurs the background. pointer-events-none when hidden so it
          never accidentally blocks page interactions.                          */}
            <div
                aria-hidden="true"
                onClick={onClose}
                className={`
          fixed inset-0 z-[9999]
          bg-black/60 backdrop-blur-sm
          transition-all duration-500 ease-out
          ${isOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"}
        `}
            />

            {/* ── Drawer Panel ──────────────────────────────────────────────────────
          inset-0        → top/right/bottom/left = 0 → guaranteed full screen coverage
          style height   → 100svh as fallback then 100dvh for browsers that support it,
                           avoids the mobile browser toolbar clipping bug
          flex flex-col  → stacks the three sections vertically
          overflow-hidden → hard cap; nothing ever overflows or creates a scrollbar      */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                style={{ height: "100dvh" }}
                className={`
          fixed top-0 right-0 bottom-0 z-[99999]
          w-full sm:max-w-md
          bg-white flex flex-col overflow-hidden
          shadow-2xl
          transform transition-transform duration-500
          ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
            >

                {/* ══ SECTION 1 — Header ════════════════════════════════════════════
            flex-shrink-0 → never compresses regardless of content below       */}
                <header className="
          flex-shrink-0
          flex items-center justify-between
          px-6 py-5
          border-b border-stone-100 bg-white
        ">
                    <div className="flex items-center gap-3.5">

                        {/* Bag icon with item-count badge */}
                        <div className="relative">
                            <div className="
                w-11 h-11 rounded-2xl
                bg-stone-900 text-white
                flex items-center justify-center
                shadow-lg shadow-stone-900/20
              ">
                                <ShoppingBag size={20} aria-hidden="true" />
                            </div>

                            {/* Badge — only shown when cart is non-empty */}
                            {itemCount > 0 && (
                                <span
                                    aria-label={`${itemCount} items in cart`}
                                    className="
                    absolute -top-1.5 -right-1.5
                    w-5 h-5 rounded-full
                    bg-amber-400 text-stone-900
                    text-[10px] font-black
                    flex items-center justify-center shadow-sm
                  "
                                >
                                    {itemCount}
                                </span>
                            )}
                        </div>

                        <div>
                            <h2 className="text-[17px] font-black text-stone-900 tracking-tight leading-none">
                                Your Cart
                            </h2>
                            <p className="text-xs text-stone-400 font-medium mt-0.5 leading-none">
                                {itemCount === 0
                                    ? "No items yet"
                                    : `${itemCount} item${itemCount !== 1 ? "s" : ""} selected`}
                            </p>
                        </div>
                    </div>

                    {/* Close (×) button */}
                    <button
                        onClick={onClose}
                        aria-label="Close cart"
                        className="
              w-10 h-10 rounded-full
              flex items-center justify-center
              text-stone-400 hover:text-stone-900
              hover:bg-stone-100
              border border-transparent hover:border-stone-200
              transition-all duration-200
            "
                    >
                        <X size={20} />
                    </button>
                </header>

                {/* Free-shipping promo strip — visible only when cart has items */}
                {items.length > 0 && (
                    <div className="
            flex-shrink-0
            flex items-center justify-center gap-2
            px-6 py-2
            bg-emerald-50 border-b border-emerald-100
          ">
                        <Tag size={12} className="text-emerald-600" aria-hidden="true" />
                        <p className="text-xs font-semibold text-emerald-700 tracking-wide">
                            You qualify for <span className="font-black">Free Shipping</span> 🎉
                        </p>
                    </div>
                )}

                {/* ══ SECTION 2 — Product List (ZERO SCROLL) ═══════════════════════
            flex-1         → takes ALL remaining vertical space between header & footer
            overflow-hidden → clips content hard; items never overflow or create a scrollbar
            flex flex-col  → allows children to use flex sizing
            min-h-0        → required for nested flex children to shrink correctly in Firefox */}
                <main className="flex-1 overflow-hidden flex flex-col px-5 py-4 min-h-0">

                    {/* ── Empty State ───────────────────────────────────────────────── */}
                    {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                            <div className="
                w-20 h-20 rounded-full
                bg-stone-50 border border-stone-100
                flex items-center justify-center mb-4
              ">
                                <ShoppingBag size={32} className="text-stone-200" aria-hidden="true" />
                            </div>
                            <h3 className="text-base font-black text-stone-900 mb-1">
                                Your cart is empty
                            </h3>
                            <p className="text-xs text-stone-400 max-w-[200px] leading-relaxed mb-6">
                                Browse our collection and add something you'll love.
                            </p>
                            <button
                                onClick={onClose}
                                aria-label="Continue shopping"
                                className="
                  px-6 py-2.5 rounded-2xl
                  bg-stone-900 text-white text-sm font-bold
                  hover:bg-amber-500 hover:text-stone-900
                  transition-all duration-300 active:scale-95
                "
                            >
                                Continue Shopping
                            </button>
                        </div>

                    ) : (
                        /* ── Item List ────────────────────────────────────────────────
                            Each <li> gets flex-1 so items share the available height equally.
                            No min-height is imposed → they all shrink as more items are added.
                            Result: 1 item = tall card, 5 items = 5 compact rows — no scroll.   */
                        <ul
                            role="list"
                            aria-label="Cart items"
                            className="flex-1 flex flex-col gap-2.5 min-h-0"
                        >
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className="
                    group flex-1 min-h-0
                    flex items-center gap-3
                    px-3 rounded-2xl
                    bg-stone-50 border border-stone-100
                    hover:border-stone-200 hover:shadow-sm
                    transition-all duration-200
                  "
                                >
                                    {/* Product thumbnail
                      w-12 aspect-square → fixed size regardless of row height  */}
                                    <div className="
                    w-12 aspect-square flex-shrink-0
                    rounded-xl bg-white border border-stone-100
                    p-1.5 overflow-hidden
                    transition-transform duration-300 group-hover:scale-105
                  ">
                                        <img
                                            src={item.Image}
                                            alt={item.Name}
                                            className="w-full h-full object-contain"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Product info + controls */}
                                    <div className="flex-1 min-w-0 py-2">

                                        {/* Row 1: name + price */}
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="text-[12px] font-black text-stone-900 truncate">
                                                {item.Name}
                                            </p>
                                            <p className="text-[12px] font-black text-stone-900 flex-shrink-0">
                                                ${(item.Price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Row 2: category badge + quantity stepper */}
                                        <div className="flex items-center justify-between gap-2">

                                            {/* Category tag */}
                                            <span className="
                        text-[8px] font-bold uppercase tracking-widest
                        text-amber-600 bg-amber-50 border border-amber-100
                        px-1.5 py-0.5 rounded-full truncate
                      ">
                                                {item.Category}
                                            </span>

                                            {/* Quantity stepper: [−] count [+] */}
                                            <div
                                                role="group"
                                                aria-label={`Quantity for ${item.Name}`}
                                                className="
                          flex items-center flex-shrink-0
                          bg-white border border-stone-200
                          rounded-xl p-0.5 gap-0.5 shadow-sm
                        "
                                            >
                                                {/* Decrease or remove (trash) when quantity is 1 */}
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    aria-label={
                                                        item.quantity === 1
                                                            ? `Remove ${item.Name} from cart`
                                                            : `Decrease quantity of ${item.Name}`
                                                    }
                                                    className="
                            w-6 h-6 rounded-lg
                            flex items-center justify-center
                            text-stone-400
                            hover:bg-red-50 hover:text-red-500
                            transition-all duration-150 active:scale-90
                          "
                                                >
                                                    {item.quantity === 1 ? <Trash2 size={11} /> : <Minus size={11} />}
                                                </button>

                                                {/* Live quantity — screen readers announce on change */}
                                                <span
                                                    aria-live="polite"
                                                    aria-atomic="true"
                                                    className="text-[11px] font-black text-stone-900 w-5 text-center select-none"
                                                >
                                                    {item.quantity}
                                                </span>

                                                {/* Increase */}
                                                <button
                                                    onClick={() => addItem(item)}
                                                    aria-label={`Increase quantity of ${item.Name}`}
                                                    className="
                            w-6 h-6 rounded-lg
                            flex items-center justify-center
                            text-stone-400
                            hover:bg-stone-900 hover:text-white
                            transition-all duration-150 active:scale-90
                          "
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </main>

                {/* ══ SECTION 3 — Order Summary & Checkout CTA ═════════════════════
            flex-shrink-0 → always visible; never compressed by the item list  */}
                {items.length > 0 && (
                    <footer className="
            flex-shrink-0
            px-6 pt-4 pb-5
            border-t border-stone-100 bg-white
            space-y-3
          ">
                        {/* Price breakdown */}
                        <div className="space-y-1.5">

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-stone-500 font-medium">Subtotal</span>
                                <span className="font-bold text-stone-900">${totalPrice.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-stone-500 font-medium">You save</span>
                                <span className="font-bold text-emerald-600">−${savings.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-stone-500 font-medium">Shipping</span>
                                <span className="font-bold text-emerald-600">Free</span>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-stone-100" />

                            {/* Grand total */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-stone-900">Total</span>
                                <div className="text-right">
                                    <p className="text-xl font-black text-stone-900 tracking-tight leading-none">
                                        ${(totalPrice - savings).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-stone-400 font-medium mt-0.5">VAT included</p>
                                </div>
                            </div>
                        </div>

                        {/* Checkout button */}
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            aria-label="Proceed to checkout"
                            className="
                w-full flex items-center justify-center gap-3
                py-3.5 px-6 rounded-2xl
                bg-stone-900 text-white
                text-[14px] font-black tracking-wide
                hover:bg-amber-400 hover:text-stone-900
                active:scale-[0.98]
                transition-all duration-300
                shadow-xl shadow-stone-900/15
                group
              "
                        >
                            Proceed to Checkout
                            <ArrowRight
                                size={17}
                                aria-hidden="true"
                                className="group-hover:translate-x-1.5 transition-transform duration-300"
                            />
                        </Link>

                        {/* Trust signals */}
                        <p className="text-center text-[11px] text-stone-400 font-medium">
                            🔒 Secure checkout · 30-day returns · 24/7 support
                        </p>
                    </footer>
                )}
            </div>
        </>
    ), document.body);
};
