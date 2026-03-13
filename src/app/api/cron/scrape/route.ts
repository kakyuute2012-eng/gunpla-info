import { NextRequest, NextResponse } from "next/server";
import { scrapeBandaiProducts } from "@/lib/scraper/bandai";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel Cron Jobs sends this header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. バンダイからスクレイピング
    const bandaiProducts = await scrapeBandaiProducts();
    console.log(`Scraped ${bandaiProducts.length} products from Bandai`);

    // 2. DBに保存 (upsert)
    let upserted = 0;
    for (const product of bandaiProducts) {
      const { error } = await supabase.from("products").upsert(
        {
          name: product.name,
          grade: product.grade,
          price: product.price,
          release_date: product.release_date,
          image_url: product.image_url,
          bandai_url: product.bandai_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "bandai_url" }
      );

      if (!error) upserted++;
    }

    return NextResponse.json({
      success: true,
      scraped: bandaiProducts.length,
      upserted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron scrape error:", error);
    return NextResponse.json(
      { error: "Scraping failed" },
      { status: 500 }
    );
  }
}
