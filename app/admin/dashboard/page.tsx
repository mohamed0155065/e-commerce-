import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import AddProductForm from "@/components/admin/AddProductForm";
import SalesChart from "./Chart";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await supabaseServer();

  // 🔒 حماية الصفحة: لو مش مسجل اطرده للوجين
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // جلب الطلبات (بناءً على عمود totalPrice اللي في جدول orders)
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const totalRevenue = orders?.reduce((sum, o) => sum + (o.totalPrice || 0), 0) || 0;
  const totalOrders = orders?.length || 0;

  // داتا الرسم البياني
  const chartData = orders?.slice(0, 6).reverse().map(o => ({
    name: o.full_name?.split(' ')[0] || 'Client',
    amount: o.totalPrice
  })) || [];

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 lg:py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <h1 className="text-4xl font-black mb-10 tracking-tighter">Admin <span className="text-indigo-600">Command Center</span></h1>

        {/* فورم إضافة المنتج (اللي بتنادي على الأكشن اللي فوق) */}
        <AddProductForm />

        {/* كروت الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Total Sales</p>
            <p className="text-5xl font-black text-indigo-600 tracking-tighter">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Orders Count</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{totalOrders}</p>
          </div>
        </div>

        {chartData.length > 0 && <SalesChart data={chartData} />}
      </div>
    </div>
  );
}