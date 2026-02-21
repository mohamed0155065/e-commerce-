import { getProducts } from '@/services/productService';
import { ProductCard } from '@/components/ProductCard';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8 text-center uppercase tracking-widest text-orange-600">
        Marketly
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-500 text-lg italic">
            لا توجد منتجات.. تأكد من إضافة بيانات في جدول products داخل Supabase
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}