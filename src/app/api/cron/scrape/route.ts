import { NextRequest, NextResponse } from "next/server";
import { scrapeBandaiProducts } from "@/lib/scraper/bandai";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SUPABASE_STORAGE_HOST = "pvdshgepywjtlwskmyki.supabase.co";

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
      // 既存のimage_urlがSupabase Storageのものならそれを保持
      const { data: existing } = await supabase
        .from("products")
        .select("image_url")
        .eq("bandai_url", product.bandai_url)
        .single();

      const existingImageUrl = existing?.image_url ?? null;
      const existingIsStorage =
        existingImageUrl?.includes(SUPABASE_STORAGE_HOST) ?? false;

      const { error } = await supabase.from("products").upsert(
        {
          name: product.name,
          grade: product.grade,
          series: product.series,
          price: product.price,
          release_date: product.release_date,
          // Supabase Storage画像がある場合はそれを保持
          image_url: existingIsStorage
            ? existingImageUrl
            : product.image_url,
          bandai_url: product.bandai_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "bandai_url" }
      );

      if (error) {
        console.error(`Upsert error for ${product.name}:`, error.message);
      } else {
        upserted++;
      }
    }

    // 3. 画像がないまたはCloudFront URLの商品のimage_urlを修復
    const imagesFixed = await fixMissingImages();

    return NextResponse.json({
      success: true,
      scraped: bandaiProducts.length,
      upserted,
      imagesFixed,
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

/**
 * Supabase Storageに画像がない商品を修復
 * - バンダイ商品ページから画像を取得
 * - Supabase Storageにアップロード
 * - DBのimage_urlを更新
 */
async function fixMissingImages(): Promise<number> {
  // image_urlがnullまたはCloudFront(期限切れの可能性)の商品を取得
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, image_url, bandai_url")
    .not("bandai_url", "is", null);

  if (error || !products) {
    console.error("Failed to fetch products for image fix:", error?.message);
    return 0;
  }

  // Supabase Storageに画像がない商品をフィルタ
  const needsFix = products.filter(
    (p) => !p.image_url?.includes(SUPABASE_STORAGE_HOST)
  );

  if (needsFix.length === 0) return 0;

  console.log(`${needsFix.length} products need image fix`);

  let fixed = 0;
  // 一度に最大10件処理（タイムアウト対策）
  const batch = needsFix.slice(0, 10);

  for (const product of batch) {
    try {
      const imageUrl = await fetchBandaiProductImage(product.bandai_url);
      if (!imageUrl) {
        console.log(`No image found for: ${product.name}`);
        continue;
      }

      // 画像をダウンロード
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) continue;
      const imgBuffer = await imgRes.arrayBuffer();

      // ファイル名を生成
      const itemMatch = product.bandai_url.match(/item\/([^/]+)/);
      const fileName = itemMatch ? `${itemMatch[1]}.jpg` : `${product.id}.jpg`;

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabaseAdmin.storage
        .from("product-images")
        .upload(fileName, imgBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload failed for ${product.name}:`, uploadError.message);
        continue;
      }

      // 公開URL取得 & DB更新
      const { data: pubUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      if (pubUrl?.publicUrl) {
        await supabaseAdmin
          .from("products")
          .update({ image_url: pubUrl.publicUrl })
          .eq("id", product.id);

        console.log(`Fixed image for: ${product.name}`);
        fixed++;
      }

      // レートリミット回避
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      console.error(`Image fix error for ${product.name}:`, e);
    }
  }

  return fixed;
}

/**
 * バンダイ商品ページから画像URLを取得
 */
async function fetchBandaiProductImage(
  bandaiUrl: string
): Promise<string | null> {
  try {
    const res = await fetch(bandaiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const html = await res.text();

    // swiper-slideのa hrefからCloudFront画像を探す
    const swiperMatch = html.match(
      /swiper-slide">\s*<a\s+href="(https:\/\/d3bk8pkqsprcvh\.cloudfront\.net\/[^"]+)"/
    );
    // 通常のCloudFront URL
    const cfMatch = html.match(
      /https:\/\/d3bk8pkqsprcvh\.cloudfront\.net\/hobby\/jp\/product\/[^"'\s]+/
    );
    // OGP画像
    const ogMatch = html.match(
      /property="og:image"\s+content="([^"]+)"/
    );

    const imageUrl = swiperMatch?.[1] || cfMatch?.[0] || ogMatch?.[1] || null;

    if (!imageUrl) return null;

    // 署名URLの期限確認
    const expiresMatch = imageUrl.match(/Expires=(\d+)/);
    if (expiresMatch && Date.now() / 1000 > parseInt(expiresMatch[1])) {
      // 期限切れ → スケジュールページのサムネイルから取得を試みる
      return null;
    }

    return imageUrl;
  } catch {
    return null;
  }
}
