import * as cheerio from "cheerio";
import { StockCheckResult, getHeaders, parsePrice, fetchWithTimeout } from "./types";

/**
 * 駿河屋 商品ページの在庫状況をチェック
 * URL例: https://www.suruga-ya.jp/product/detail/XXXXX
 */
export async function checkSurugayaStock(url: string): Promise<StockCheckResult> {
  try {
    const res = await fetchWithTimeout(url, getHeaders());
    if (!res.ok) {
      return { status: "out_of_stock", price: null, error: `http_${res.status}` };
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const bodyText = $("body").text();

    // 価格
    let price: number | null = null;
    const priceSelectors = [
      ".price_teika", ".mgnB5.mgnT5", ".text-red", ".price",
    ];
    for (const sel of priceSelectors) {
      const t = $(sel).first().text().trim();
      if (t) { price = parsePrice(t); if (price) break; }
    }
    if (!price) {
      const m = html.match(/[¥￥]([\d,]+)/);
      if (m) price = parsePrice(m[1]);
    }

    // 品切れ
    if (
      bodyText.includes("売り切れ") ||
      bodyText.includes("在庫切れ") ||
      bodyText.includes("品切れ") ||
      bodyText.includes("販売終了") ||
      bodyText.includes("SOLD OUT") ||
      bodyText.includes("品切れ中") ||
      bodyText.includes("ただいま品切れ")
    ) {
      return { status: "out_of_stock", price };
    }

    // 予約
    if (bodyText.includes("予約受付") || bodyText.includes("予約商品")) {
      return { status: "preorder", price };
    }

    // カートボタン
    if (
      bodyText.includes("カートに入れる") ||
      bodyText.includes("かごに入れる") ||
      $("button:contains('カート')").length > 0 ||
      $("input[value*='カート']").length > 0 ||
      $("input[value*='かご']").length > 0 ||
      $(".btn-cart").length > 0 ||
      bodyText.includes("在庫あり")
    ) {
      return { status: "in_stock", price };
    }

    return { status: "out_of_stock", price };
  } catch (e) {
    return { status: "out_of_stock", price: null, error: e instanceof Error ? e.message : "unknown" };
  }
}
