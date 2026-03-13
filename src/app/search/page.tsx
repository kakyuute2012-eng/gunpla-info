import SearchForm from "@/components/SearchForm";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

export const metadata = {
  title: "商品検索 - ガンプラ情報局",
  description: "ガンプラをグレード・キーワードで検索",
};

async function getProducts() {
  // TODO: Supabase接続後はDBから取得
  return SAMPLE_PRODUCTS;
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
