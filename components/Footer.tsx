import Link from "next/link";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

const TRUST_BADGES = [
  { icon: Truck, title: "Free shipping", body: "On every order, no minimum." },
  { icon: RotateCcw, title: "Easy returns", body: "30 days to change your mind." },
  { icon: ShieldCheck, title: "Secure checkout", body: "Your payment details are protected." },
];

export const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="page-shell grid gap-8 py-10 sm:grid-cols-3">
        {TRUST_BADGES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e9eee9] text-[#285943]">
              <Icon size={18} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">{title}</p>
              <p className="mt-0.5 text-sm text-stone-500">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-200">
        <div className="page-shell flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-lg font-bold tracking-[-.07em] text-stone-900">
              marketly<span className="text-[#285943]">.</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-stone-500">
              A considered selection of everyday tech, picked for quality and priced fairly.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.1em] text-stone-400">Shop</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                <li><Link href="/?category=laptop" className="hover:text-stone-950">Laptops</Link></li>
                <li><Link href="/?category=phones" className="hover:text-stone-950">Phones</Link></li>
                <li><Link href="/?category=headphones" className="hover:text-stone-950">Headphones</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.1em] text-stone-400">Help</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                <li><Link href="/checkout" className="hover:text-stone-950">Checkout</Link></li>
                <li><Link href="/login" className="hover:text-stone-950">Account</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 py-5">
        <p className="page-shell text-xs text-stone-400">
          © {new Date().getFullYear()} Marketly. All rights reserved.
        </p>
      </div>
    </footer>
  );
};