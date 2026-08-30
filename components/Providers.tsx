"use client";

/**
 * Providers Component
 * This is a Client Component that wraps the entire application.
 * It handles:
 * 1. Global Contexts (like Toasts).
 * 2. Hydration Synchronization: Ensures the client-side UI matches the server-side HTML.
 */

import { useEffect } from "react";
import { Toaster } from "sonner";
import { markHydrated, useHydration } from "@/store/useHydration";

export default function Providers({ children }: { children: React.ReactNode }) {
    // Hydration Shield:
    // Prevents the "Hydration Mismatch" error by waiting for the client to mount
    // before rendering client-specific logic (like the shopping cart state).
    //
    // Senior note: `markHydrated()` flips ONE shared, module-level flag
    // (store/useHydration.ts) that Navbar, BottomNav, ProductCard,
    // WishlistButton and CartDrawer all read via `useHydration()`. Previously
    // each of those components ran its own identical `useState + useEffect`
    // pair, meaning N components each triggered their own extra post-mount
    // re-render. Centralizing the flag here means "hydration happened" is
    // answered once, globally, instead of N times.
    //
    // `markHydrated()` mutates an external store and notifies its
    // subscribers — it does not call this component's own setState, so it
    // does not trigger the "cascading renders" footgun the react-hooks
    // linter warns about for `useEffect(() => setState(...))`.
    useEffect(() => {
        markHydrated();
    }, []);

    const mounted = useHydration();

    return (
        <>
            {children}

            {/* Render global UI components only after the client has mounted */}
            {mounted && (
                <Toaster
                    position="top-center"
                    richColors
                    closeButton
                    theme="light"
                    toastOptions={{
                        style: { borderRadius: '1rem' },
                    }}
                />
            )}
        </>
    );
}