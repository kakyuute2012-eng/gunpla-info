import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { ProductWithStock } from "@/lib/types";

export const revalidate = 300; // 5分キャッシュ

async function getProducts(): Promise<ProductWithStock[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, stock_info(*)")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return SAMPLE_PRODUCTS;
    }

    if (!data || data.length === 0) {
      return SAMPLE_PRODUCTS;
    }

    return data as ProductWithStock[];
  } catch {
    return SAMPLE_PRODUCTS;
  }
}

export default async function Home() {
  const products = await getProducts();
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const inStockProducts = products.filter((p) =>
    p.stock_info.some((s) => s.status === "in_stock")
  );
  const preorderProducts = products.filter(
    (p) =>
      p.stock_info.some((s) => s.status === "preorder") &&
      !p.stock_info.some((s) => s.status === "in_stock")
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <h1 className="text-2xl font-bold">ガンプラ予約・再販情報</h1>
        <p className="mt-1 text-blue-100">
          最新の在庫状況を自動チェック - {today} 更新
        </p>
      </div>

      {/* Stock alerts */}
      {inStockProducts.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">在庫速報</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inStockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Preorder */}
      {preorderProducts.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">予約受付中</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {preorderProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* All products */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-900">全商品一覧</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
