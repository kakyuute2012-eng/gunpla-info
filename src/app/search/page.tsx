import SearchForm from "@/components/SearchForm";
import { supabase } from "@/lib/supabase";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { ProductWithStock } from "@/lib/types";

export const metadata = {
  title: "商品検索 - ガンプラ情報局",
  description: "ガンプラをグレード・キーワードで検索",
};

export const revalidate = 300;

async function getProducts(): Promise<ProductWithStock[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, stock_info(*)")
      .order("updated_at", { ascending: false });

    if (error || !data || data.length === 0) return SAMPLE_PRODUCTS;
    return data as ProductWithStock[];
  } catch {
    return SAMPLE_PRODUCTS;
  }
}

export default async function SearchPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">商品検索</h1>
      <SearchForm allProducts={products} />
    </div>
  );
}
