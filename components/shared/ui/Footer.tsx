import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

export const Footer = () => {
  const t = useTranslations("footer");
  const c = useTranslations("common");
  const badges = [
    { icon: Truck, title: t("freeShippingTitle"), body: t("freeShippingBody") },
    { icon: RotateCcw, title: t("returnsTitle"), body: t("returnsBody") },
    { icon: ShieldCheck, title: t("secureTitle"), body: t("secureBody") },
  ];

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="page-shell grid gap-8 py-10 sm:grid-cols-3">
        {badges.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#172554] text-[var(--brand)]">
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
            <Link href="/" prefetch={false} scroll={false} className="text-lg font-bold tracking-[-.07em] text-stone-900">
              marketly<span className="text-[var(--brand)]">.</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-stone-500">
              {t("description")}
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400">{t("shop")}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                <li><Link href="/?category=laptop" prefetch={false} className="hover:text-stone-950">{t("laptops")}</Link></li>
                <li><Link href="/?category=phones" prefetch={false} className="hover:text-stone-950">{t("phones")}</Link></li>
                <li><Link href="/?category=headphones" prefetch={false} className="hover:text-stone-950">{t("headphones")}</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400">{t("help")}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                <li><Link href="/checkout" prefetch={false} scroll={false} className="hover:text-stone-950">{t("checkout")}</Link></li>
                <li><Link href="/login" prefetch={false} scroll={false} className="hover:text-stone-950">{c("account")}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 py-5">
        <p className="page-shell text-xs text-stone-400">
          © {new Date().getFullYear()} Marketly. {t("allRights")}
        </p>
      </div>
    </footer>
  );
};