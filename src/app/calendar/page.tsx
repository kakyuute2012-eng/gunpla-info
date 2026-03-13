import Calendar from "@/components/Calendar";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

export const metadata = {
  title: "再販カレンダー - ガンプラ情報局",
  description: "ガンプラの発売日・再販日を月別カレンダーで確認",
};

async function getProducts() {
  // TODO: Supabase接続後はDBから取得
  return SAMPLE_PRODUCTS;
}

export default async function CalendarPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        再販カレンダー
      </h1>
      <Calendar products={products} />
    </div>
  );
}
