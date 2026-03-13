import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get("grade");
  const keyword = searchParams.get("keyword");
  const stockOnly = searchParams.get("stockOnly") === "true";

  // TODO: Supabase接続後はDBから取得
  let products = SAMPLE_PRODUCTS;

  if (grade) {
    products = products.filter((p) => p.grade === grade);
  }
  if (keyword) {
    products = products.filter((p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  if (stockOnly) {
    products = products.filter((p) =>
      p.stock_info.some((s) => s.status === "in_stock")
    );
  }

  return NextResponse.json(products);
}
