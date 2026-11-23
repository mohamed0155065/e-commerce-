"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  const t = useTranslations("success");
  const common = useTranslations("common");
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 55,
      origin: {
        y: 0.55,
      },
      colors: ["#3B82F6", "#06B6D4", "#111114"],
    });
  }, []);

  return (
    <main className="page-shell grid min-h-[calc(100vh-4rem)] place-items-center text-center">
      <section className="max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#172554] text-[var(--accent)]">
          <Check size={28} />
        </div>

        <p className="eyebrow mt-6">{t("title")}</p>

        <h1 className="mt-2 text-4xl font-semibold tracking-[-.06em]">
          {t("thanks")}
        </h1>

        <p className="mt-4 text-sm leading-6 text-stone-600">
          {t("description")}
        </p>

        <Link
          href="/"
          className="mt-8 inline-block bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-hover)]"
        >
          {common("continueShopping")}
        </Link>
      </section>
    </main>
  );
}