// app/layout.tsx
/**
 * app/layout.tsx
 * ---------------------------------------------------------------------------
 * Root layout — shared by *every* route, storefront and admin alike.
 * Deliberately minimal: only truly global concerns live here (the <html>
 * shell, global CSS, page metadata, and Providers/Toaster). The storefront's
 * top nav has been moved out to app/(shop)/layout.tsx and the admin sidebar
 * lives in app/admin/dashboard/layout.tsx, so neither nav leaks into the
 * other section — previously the shop Navbar (Cart/Wishlist/Sign out) was
 * rendered here and showed up on /admin/dashboard too, which is what this
 * split fixes.
 * ---------------------------------------------------------------------------
 */
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata = {
  title: "Marketly — considered everyday goods",
  description: "A thoughtful selection of products for daily life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}