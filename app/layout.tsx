import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata = {
  title: "Marketly — considered everyday goods",
  description: "A thoughtful selection of products for daily life.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers><Suspense fallback={<div className="h-16 border-b border-stone-200 bg-white" />}><Navbar /></Suspense><main>{children}</main></Providers></body></html>;
}
