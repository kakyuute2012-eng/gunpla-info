import { NextRequest, NextResponse } from "next/server";

/**
 * バンダイ商品ページから商品画像を取得して返すプロキシ
 * /api/image?url=https://bandai-hobby.net/item/01_6783/
 *
 * CloudFront署名付きURLは期限切れになるため、
 * 毎回商品ページからfreshなURLを取得して画像を返す
 */
export async function GET(request: NextRequest) {
  const bandaiUrl = request.nextUrl.searchParams.get("url");
  if (!bandaiUrl || !bandaiUrl.includes("bandai-hobby.net")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const res = await fetch(bandaiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.9",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
    }

    const html = await res.text();

    // swiper-slide内の<a href>にある商品画像（メイン商品画像）
    const swiperMatch = html.match(/swiper-slide">\s*<a\s+href="(https:\/\/d3bk8pkqsprcvh\.cloudfront\.net\/[^"]+)"/);
    // フォールバック: 最初のCloudFront商品画像URL
    const cfMatch = html.match(/https:\/\/d3bk8pkqsprcvh\.cloudfront\.net\/hobby\/jp\/product\/[^"'\s]+/);

    const imageUrl = swiperMatch?.[1] || cfMatch?.[0];

    if (!imageUrl) {
      return NextResponse.json({ error: "No image found" }, { status: 404 });
    }

    // 画像をフェッチしてそのまま返す
    const imgRes = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://bandai-hobby.net/",
      },
    });

    if (!imgRes.ok) {
      return NextResponse.redirect(imageUrl);
    }

    const imgBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imgBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
