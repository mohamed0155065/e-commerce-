"use client";

/**
 * Providers Component
 * This is a Client Component that wraps the entire application.
 * It handles:
 * 1. Global Contexts (like Toasts).
 * 2. Hydration Synchronization: Ensures the client-side UI matches the server-side HTML.
 */

import { useState, useEffect } from "react";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    // 🔒 Hydration Shield: 
    // Prevents the "Hydration Mismatch" error by waiting for the client to mount
    // before rendering client-specific logic (like the shopping cart state).
    useEffect(() => {
        setMounted(true);
    }, []);

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