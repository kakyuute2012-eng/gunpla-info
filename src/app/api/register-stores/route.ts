import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStoreSearchUrl } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * 全商品×全店舗の stock_info レコードを一括登録
 * GET /api/register-stores?secret=xxx
 *
 * 既にレコードがある(product_id, store)の組み合わせはスキップ
 * URLは各ストアの検索URLを自動生成（後から実URLに更新可）
 */
export async function GET(request: NextRequest) {
  const secretParam = request.nextUrl.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    secretParam !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 登録対象のストア一覧（bandai以外の全店舗）
  const STORES_TO_REGISTER = [
    "amazon", "rakuten", "yahoo",
    "yodobashi", "biccamera", "joshin", "yamada", "edion",
    "amiami", "hobbysearch", "tamtam",
    "surugaya", "dmm",
    "baton", "mokeino",
  ];

  try {
    // 1. 全商品取得
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, name");

    if (prodError || !products || products.length === 0) {
      return NextResponse.json({ error: "No products found", detail: prodError }, { status: 500 });
    }

    // 2. 既存のstock_infoレコードを取得
    const { data: existing, error: stockError } = await supabase
      .from("stock_info")
      .select("product_id, store");

    if (stockError) {
      return NextResponse.json({ error: "Failed to fetch stock_info", detail: stockError }, { status: 500 });
    }

    // 既存の組み合わせをSetで管理
    const existingKeys = new Set(
      (existing || []).map((row) => `${row.product_id}__${row.store}`)
    );

    // 3. 新規レコードを生成
    const newRecords: {
      product_id: string;
      store: string;
      status: string;
      price: number | null;
      url: string;
    }[] = [];

    for (const product of products) {
      for (const store of STORES_TO_REGISTER) {
        const key = `${product.id}__${store}`;
        if (existingKeys.has(key)) continue;

        const searchUrl = getStoreSearchUrl(store, product.name);
        if (searchUrl === "#") continue;

        newRecords.push({
          product_id: product.id,
          store,
          status: "out_of_stock",
          price: null,
          url: searchUrl,
        });
      }
    }

    if (newRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All store records already exist",
        products: products.length,
        stores: STORES_TO_REGISTER.length,
        inserted: 0,
      });
    }

    // 4. バッチ挿入（Supabaseの制限を考慮して100件ずつ）
    let inserted = 0;
    const errors: string[] = [];
    const BATCH_SIZE = 100;

    for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
      const batch = newRecords.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabaseAdmin
        .from("stock_info")
        .insert(batch);

      if (insertError) {
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE)}: ${insertError.message}`);
      } else {
        inserted += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      products: products.length,
      stores: STORES_TO_REGISTER.length,
      inserted,
      skipped: (products.length * STORES_TO_REGISTER.length) - newRecords.length - (newRecords.length - inserted),
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Register stores error:", error);
    return NextResponse.json(
      { error: "Failed to register stores" },
      { status: 500 }
    );
  }
}
