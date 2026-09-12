import { redirect } from "next/navigation";

import { getSessionUser, supabaseServer } from "@/lib/supabaseServer";
import { getOrdersByUser } from "@/featues/orders/services/orderService";
import MyOrdersList from "@/featues/orders/components/customer_access/customer_orders_list";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const supabase = await supabaseServer();
  const orders = await getOrdersByUser(supabase, user.id);

  return (
    <div className="page-shell py-8 sm:py-12">
      <p className="eyebrow">Account</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.055em] sm:text-4xl">
        My orders
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        Track every order you&apos;ve placed and its current status.
      </p>

      <MyOrdersList initialOrders={orders} userId={user.id} />
    </div>
  );
}