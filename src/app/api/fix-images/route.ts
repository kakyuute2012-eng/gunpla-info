import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SUPABASE_STORAGE_HOST = "pvdshgepywjtlwskmyki.supabase.co";

/**
 * 画像修復API - 全商品の画像をSupabase Storageにアップロード
 * GET /api/fix-images?secret=xxx&limit=20
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Hobby: max 60s

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "20",
    10
  );

  try {
    // image_urlがnullまたはCloudFrontの商品を取得
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, image_url, bandai_url")
      .not("bandai_url", "is", null);

    if (error || !products) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    const needsFix = products.filter(
      (p) => !p.image_url?.includes(SUPABASE_STORAGE_HOST)
    );

    const alreadyFixed = products.length - needsFix.length;
    const batch = needsFix.slice(0, limit);

    let fixed = 0;
    let failed = 0;
    const results: { name: string; status: string }[] = [];

    for (const product of batch) {
      try {
        const imageUrl = await fetchBandaiProductImage(product.bandai_url);
        if (!imageUrl) {
          // バンダイから取得失敗 → スケジュールページの画像URLがあればそれを試す
          if (product.image_url && !product.image_url.includes("cloudfront")) {
            // バンダイサイトの直接画像URL(非CloudFront)
            const uploaded = await downloadAndUpload(
              product.image_url,
              product
            );
            if (uploaded) {
              fixed++;
              results.push({ name: product.name, status: "fixed (schedule img)" });
              continue;
            }
          }
          failed++;
          results.push({ name: product.name, status: "no image found" });
          continue;
        }

        const uploaded = await downloadAndUpload(imageUrl, product);
        if (uploaded) {
          fixed++;
          results.push({ name: product.name, status: "fixed" });
        } else {
          failed++;
          results.push({ name: product.name, status: "upload failed" });
        }

        // レートリミット回避
        await new Promise((r) => setTimeout(r, 300));
      } catch (e) {
        failed++;
        results.push({
          name: product.name,
          status: `error: ${e instanceof Error ? e.message : "unknown"}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: products.length,
      alreadyFixed,
      remaining: needsFix.length - fixed,
      fixedThisRun: fixed,
      failedThisRun: failed,
      results,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Error: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 500 }
    );
  }
}

async function downloadAndUpload(
  imageUrl: string,
  product: { id: string; name: string; bandai_url: string }
): Promise<boolean> {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) return false;

  const imgBuffer = await imgRes.arrayBuffer();
  if (imgBuffer.byteLength < 1000) return false; // 小さすぎる画像はスキップ

  const itemMatch = product.bandai_url.match(/item\/([^/]+)/);
  const fileName = itemMatch ? `${itemMatch[1]}.jpg` : `${product.id}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(fileName, imgBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error(`Upload failed for ${product.name}:`, uploadError.message);
    return false;
  }

  const { data: pubUrl } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  if (pubUrl?.publicUrl) {
    await supabaseAdmin
      .from("products")
      .update({ image_url: pubUrl.publicUrl })
      .eq("id", product.id);
    return true;
  }

  return false;
}

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

    // swiper-slideのa hrefから高解像度画像
    const swiperMatch = html.match(
      /swiper-slide">\s*<a\s+href="(https:\/\/d3bk8pkqsprcvh\.cloudfront\.net\/[^"]+)"/
    );
    // CloudFront URL (任意のパス)
    const cfMatch = html.match(
      /https:\/\/d3bk8pkqsprcvh\.cloudfront\.net\/[^"'\s<>]+\.(jpg|jpeg|png|webp)/i
    );
    // OGP画像
    const ogMatch = html.match(
      /property="og:image"\s+content="([^"]+)"/
    );

    const imageUrl = swiperMatch?.[1] || cfMatch?.[0] || ogMatch?.[1] || null;

    if (!imageUrl) return null;

    // 署名URL期限チェック
    const expiresMatch = imageUrl.match(/Expires=(\d+)/);
    if (expiresMatch && Date.now() / 1000 > parseInt(expiresMatch[1])) {
      return null; // 期限切れ
    }

    return imageUrl;
  } catch {
    return null;
  }
}
