import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase";

/**
 * 商品画像プロキシ
 * 1. Supabase Storageにキャッシュ済みならそのURLにリダイレクト
 * 2. なければバンダイから取得→Storageに保存→リダイレクト
 *
 * /api/image?url=https://bandai-hobby.net/item/01_6783/
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const bandaiUrl = request.nextUrl.searchParams.get("url");
  if (!bandaiUrl || !bandaiUrl.includes("bandai-hobby.net")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // bandai URLからファイル名を生成
  const itemMatch = bandaiUrl.match(/item\/([^/]+)/);
  const fileName = itemMatch ? `${itemMatch[1]}.jpg` : null;
  if (!fileName) {
    return NextResponse.json({ error: "Invalid item URL" }, { status: 400 });
  }

  try {
    // 1. Storageに既にあるか確認
    const { data: existing } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    if (existing?.publicUrl) {
      // ファイルが存在するか確認（HEADリクエスト）
      const checkRes = await fetch(existing.publicUrl, { method: "HEAD" });
      if (checkRes.ok) {
        return NextResponse.redirect(existing.publicUrl);
      }
    }

    // 2. バンダイから画像を取得
    const pageRes = await fetch(bandaiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!pageRes.ok) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
    }

    const html = await pageRes.text();
    const swiperMatch = html.match(
      /swiper-slide">\s*<a\s+href="(https:\/\/d3bk8pkqsprcvh\.cloudfront\.net\/[^"]+)"/
    );
    const cfMatch = html.match(
      /https:\/\/d3bk8pkqsprcvh\.cloudfront\.net\/hobby\/jp\/product\/[^"'\s]+/
    );
    const imageUrl = swiperMatch?.[1] || cfMatch?.[0];

    if (!imageUrl) {
      return NextResponse.json({ error: "No image found" }, { status: 404 });
    }

    // 署名URLの期限確認
    const expiresMatch = imageUrl.match(/Expires=(\d+)/);
    if (expiresMatch && Date.now() / 1000 > parseInt(expiresMatch[1])) {
      return NextResponse.json(
        { error: "Signed URL expired" },
        { status: 502 }
      );
    }

    // 画像をダウンロード
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json(
        { error: `Image fetch failed: ${imgRes.status}` },
        { status: 502 }
      );
    }

    const imgBuffer = await imgRes.arrayBuffer();

    // 3. Supabase Storageにアップロード
    const { error: uploadError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(fileName, imgBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      // アップロード失敗でも画像は返す
      return new NextResponse(imgBuffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=1800",
        },
      });
    }

    // 4. 公開URLを取得してDBも更新
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    if (publicUrlData?.publicUrl) {
      // DBのimage_urlを更新
      await supabaseAdmin
        .from("products")
        .update({ image_url: publicUrlData.publicUrl })
        .eq("bandai_url", bandaiUrl);

      return NextResponse.redirect(publicUrlData.publicUrl);
    }

    // フォールバック: 画像をそのまま返す
    return new NextResponse(imgBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Proxy error: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 500 }
    );
  }
}
