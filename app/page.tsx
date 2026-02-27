import { productService } from '@/services/productService';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  // 1️⃣ نقرأ كلمة البحث من الـ URL
  const query = searchParams.query;

  // 2️⃣ نجيب المنتجات على حسب البحث
  const products = await productService.getAll(query);

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6 text-center uppercase tracking-widest text-orange-600">
        Marketly
      </h1>

      {/* 3️⃣ Search Bar */}
      <div className="mb-10 flex justify-center">
        <SearchBar />
      </div>

      {/* 4️⃣ عرض النتائج */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-500 text-lg italic">
            {query
              ? `لا توجد منتجات تطابق "${query}"`
              : null}
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