import Calendar from "@/components/Calendar";
import { supabase } from "@/lib/supabase";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import type { ProductWithStock } from "@/lib/types";

export const metadata = {
  title: "再販カレンダー - ガンプラ情報局",
  description: "ガンプラの発売日・再販日を月別カレンダーで確認",
};

export const revalidate = 300;

async function getProducts(): Promise<ProductWithStock[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, stock_info(*)")
      .order("release_date", { ascending: true });

    if (error || !data || data.length === 0) return SAMPLE_PRODUCTS;
    return data as ProductWithStock[];
  } catch {
    return SAMPLE_PRODUCTS;
  }
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
