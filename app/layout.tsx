/**
 * Root Layout Component
 * - Acts as the entry point for the entire application.
 * - Wraps children with Global Providers (Toast, Auth context, etc.)
 * - Implements React Suspense for the Navbar to handle client-side search params during SSR.
 */

import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import Providers from "../components/Providers";
import "./globals.css";

export const metadata = {
  title: "Marketly | Premium E-commerce Experience",
  description: "High-performance full-stack store built with Next.js 15 and Supabase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900">
        {/* 
            Providers wrap the entire app to manage client-side state 
            and global notifications (Sonner).
        */}
        <Providers>

          {/* 
              Suspense is required here because the Navbar contains the SearchBar,
              which uses 'useSearchParams()'. This prevents "CSR Bailout" errors during the build.
          */}
          <Suspense fallback={<div className="h-20 bg-white border-b border-slate-100 animate-pulse" />}>
            <Navbar />
          </Suspense>

          <main className="min-h-screen">
            {children}
          </main>

        </Providers>
      </body>
    </html>
  );
}