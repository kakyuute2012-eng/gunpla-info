import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get("grade");
  const keyword = searchParams.get("keyword");
  const stockOnly = searchParams.get("stockOnly") === "true";

  try {
    let query = supabase
      .from("products")
      .select("*, stock_info(*)")
      .order("updated_at", { ascending: false });

    if (grade) {
      query = query.eq("grade", grade);
    }
    if (keyword) {
      query = query.ilike("name", `%${keyword}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      return NextResponse.json(SAMPLE_PRODUCTS);
    }

    let products = data;

    if (stockOnly) {
      products = products.filter((p: { stock_info: { status: string }[] }) =>
        p.stock_info.some((s: { status: string }) => s.status === "in_stock")
      );
    }

    return NextResponse.json(products);
  } catch {
    return NextResponse.json(SAMPLE_PRODUCTS);
  }
}
