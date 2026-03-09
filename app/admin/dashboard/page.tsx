import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import AddProductForm from "@/components/admin/AddProductForm";
import SalesChart from "./Chart";

// Disable caching for this page to always fetch fresh data
export const dynamic = 'force-dynamic';

// Admin dashboard page
export default async function AdminDashboard() {
  const supabase = await supabaseServer();

  // Protect the page: redirect to login if the user is not logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Fetch all orders from the database, ordered by creation date descending
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  // Calculate total revenue and total number of orders
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.totalPrice || 0), 0) || 0;
  const totalOrders = orders?.length || 0;

  // Prepare data for the sales chart: take the last 6 orders
  const chartData = orders?.slice(0, 6).reverse().map(o => ({
    name: o.full_name?.split(' ')[0] || 'Client', // Use the first name of the customer
    amount: o.totalPrice
  })) || [];

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 lg:py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Page header */}
        <h1 className="text-4xl font-black mb-10 tracking-tighter">
          <span className="text-black">Admin</span>    <span className="text-indigo-600">Command Center</span>
        </h1>

        {/* Form to add a new product */}
        <AddProductForm />

        {/* Dashboard statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Total revenue card */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">
              Total Sales
            </p>
            <p className="text-5xl font-black text-indigo-600 tracking-tighter">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>

          {/* Total orders card */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">
              Orders Count
            </p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">
              {totalOrders}
            </p>
          </div>
        </div>

        {/* Render sales chart if there is data */}
        {chartData.length > 0 && <SalesChart data={chartData} />}
      </div>
    </div>
  );
}