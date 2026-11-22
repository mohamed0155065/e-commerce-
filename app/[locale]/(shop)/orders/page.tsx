import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { getSessionUser, supabaseServer } from "@/lib/supabaseServer";
import { getOrdersByUser } from "@/featues/orders/services/orderService";
import MyOrdersList from "@/featues/orders/components/customer_access/customer_orders_list";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const locale = await getLocale();
  const t = await getTranslations("orders");
  const user = await getSessionUser();

  if (!user) {
    return redirect({ href: "/login?redirect=%2Forders", locale });
  }

  const supabase = await supabaseServer();
  const orders = await getOrdersByUser(supabase, user.id);

  return (
    <div className="page-shell py-8 sm:py-12">
      <p className="eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        {t("description")}
      </p>

      <MyOrdersList initialOrders={orders} userId={user.id} />
    </div>
  );
}