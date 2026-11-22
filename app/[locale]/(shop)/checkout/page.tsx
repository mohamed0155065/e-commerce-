"use client";
import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle, LockKeyhole } from "lucide-react";
import { checkoutSchema, type checkoutInput } from "@/validators/checkoutSchema";
import { useCartStore } from "@/featues/card/store/useCartStore";
import { supabase } from "@/lib/supabase";
import { useHydration } from "@/store/useHydration";
import { Link, useRouter } from "@/i18n/navigation";
import { formatUSD } from "@/i18n/formatters";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const common = useTranslations("common");
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { items, getTotalPrice, clearCart } = useCartStore();
  const hydrated = useHydration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm<checkoutInput>({ resolver: zodResolver(checkoutSchema) });
  const total = hydrated ? getTotalPrice() : 0;
  const visibleItems = hydrated ? items : [];

  const onSubmit = async (formData: checkoutInput) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const { error } = await supabase.rpc("place_order", {
        p_full_name: formData.fullName,
        p_email: formData.email,
        p_phone: formData.phone,
        p_address: formData.address,
        p_city: formData.city,
        p_items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      });

      if (error) {
        if (error.message.includes("AUTH_REQUIRED")) {
          router.push(`/login?redirect=${encodeURIComponent(searchParams.get("redirect") ?? "/checkout")}`);
          return;
        } else if (error.message.includes("INSUFFICIENT_STOCK")) {
          setSubmitError(t("outOfStockError"));
        } else if (error.message.includes("PRODUCT_NOT_FOUND")) {
          setSubmitError(t("itemUnavailable"));
        } else {
          throw error;
        }
        setIsSubmitting(false);
        return;
      }

      clearCart();
      router.push("/success");
    } catch {
      setSubmitError(t("orderError"));
      setIsSubmitting(false);
    }
  };

  if (!hydrated || !visibleItems.length) return (
    <div className="page-shell grid min-h-[calc(100vh-4rem)] place-items-center text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-.05em]">{t("emptyTitle")}</h1>
        <p className="mt-3 text-sm text-stone-500">{t("emptyDescription")}</p>
        <Link href="/" className="mt-6 inline-block bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white">{common("continueShopping")}</Link>
      </div>
    </div>
  );

  const input = (name: keyof checkoutInput) => `field ${errors[name] ? "border-red-600" : ""}`;

  return (
    <div className="page-shell py-8 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-[var(--brand)]"><ArrowLeft className="rtl-flip" size={16} /> {common("continueShopping")}</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_.75fr]">
        <section>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">{t("title")}</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 border-t border-stone-300 pt-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("name")} error={errors.fullName?.message ? t(`validation.${errors.fullName.message}`) : undefined}><input id="fullName" autoComplete="name" {...register("fullName")} className={input("fullName")} /></Field>
              <Field label={t("email")} error={errors.email?.message ? t(`validation.${errors.email.message}`) : undefined}><input id="email" type="email" autoComplete="email" {...register("email")} className={input("email")} /></Field>
              <Field label={t("phone")} error={errors.phone?.message ? t(`validation.${errors.phone.message}`) : undefined}><input id="phone" autoComplete="tel" {...register("phone")} className={input("phone")} /></Field>
              <Field label={t("city")} error={errors.city?.message ? t(`validation.${errors.city.message}`) : undefined}><input id="city" autoComplete="address-level2" {...register("city")} className={input("city")} /></Field>
            </div>
            <div className="mt-5">
              <Field label={t("address")} error={errors.address?.message ? t(`validation.${errors.address.message}`) : undefined}><textarea id="address" autoComplete="street-address" {...register("address")} className={`${input("address")} min-h-28 resize-y`} /></Field>
            </div>
            {submitError && <p role="alert" className="mt-5 flex gap-2 bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={18} />{submitError}</p>}
            <button disabled={isSubmitting} className="mt-7 flex w-full items-center justify-center gap-2 bg-[var(--brand)] px-5 py-4 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] disabled:bg-stone-300">{isSubmitting ? t("placingOrder") : t("placeOrder", { total: formatUSD(locale, total) })}</button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500"><LockKeyhole size={13} /> {t("description")}</p>
          </form>
        </section>
        <aside className="h-fit border border-stone-200 bg-white p-5 lg:sticky lg:top-20">
          <h2 className="font-semibold">{t("summary")}</h2>
          <ul className="mt-5 divide-y divide-stone-100">
            {visibleItems.map((item) => (
              <li key={item.id} className="flex gap-3 py-4 first:pt-0">
                <div className="relative h-14 w-14 shrink-0 bg-[var(--canvas)]"><Image src={item.Image} fill sizes="56px" alt="" className="object-contain p-1" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.Name}</p><p className="mt-1 text-xs text-stone-500">{common("quantity", { count: item.quantity })}</p></div>
                <p className="text-sm font-semibold">{formatUSD(locale, item.Price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-stone-200 pt-4">
            <div className="flex justify-between text-sm text-stone-600"><span>{common("delivery")}</span><span className="text-[var(--accent)]">{common("free")}</span></div>
            <div className="mt-4 flex justify-between text-lg font-semibold"><span>{common("total")}</span><span>{formatUSD(locale, total)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><label className="field-label">{label}</label>{children}{error && <p className="mt-1 text-xs text-red-700">{error}</p>}</div>;
} 