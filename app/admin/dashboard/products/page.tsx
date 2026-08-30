// app/admin/dashboard/products/page.tsx
/**
 * app/admin/dashboard/products/page.tsx  ->  route: /admin/dashboard/products
 * ---------------------------------------------------------------------------
 * Server Component. Fetches the product catalog and renders the create form
 * (AddProductForm) above the editable list (AdminProductsList) — the two
 * client components that already handled add/edit/delete via the server
 * actions in app/admin/action.ts; only their route changed, not their logic.
 *
 * Wrapped by app/admin/dashboard/layout.tsx (auth guard + sidebar).
 * ---------------------------------------------------------------------------
 */
import { supabaseServer, getSessionUser } from "@/lib/supabaseServer";
import AddProductForm from "@/components/admin/AddProductForm";
import AdminProductsList from "@/components/admin/AdminProductsList";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getSessionUser();
  const supabase = await supabaseServer();

  const { data: products } = await supabase
    .from("product")
    .select("id, created_at, Name, Price, Description, Image, Category, Stock, Status")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Publish new products and manage the existing catalog."
        userEmail={user?.email}
      />

      <div className="mt-8">
        <AddProductForm />
      </div>

      <div className="mt-10">
        <AdminProductsList initialProducts={products ?? []} />
      </div>
    </>
  );
}