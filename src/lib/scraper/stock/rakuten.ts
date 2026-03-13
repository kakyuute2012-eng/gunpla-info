import * as cheerio from "cheerio";
import { StockCheckResult, getHeaders, parsePrice, fetchWithTimeout } from "./types";

/**
 * 楽天市場 商品ページの在庫状況をチェック
 */
export async function checkRakutenStock(url: string): Promise<StockCheckResult> {
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
      ".price2", ".item-price", ".price--OX_YW",
      "[class*='price']",
    ];
    for (const sel of priceSelectors) {
      const t = $(sel).first().text().trim();
      if (t) { price = parsePrice(t); if (price) break; }
    }
    if (!price) {
      const m = html.match(/(?:販売価格|価格)[：:\s]*[¥￥]?([\d,]+)/);
      if (m) price = parsePrice(m[1]);
    }

    // 品切れ
    if (
      bodyText.includes("売り切れ") ||
      bodyText.includes("SOLD OUT") ||
      bodyText.includes("在庫切れ") ||
      bodyText.includes("品切れ")
    ) {
      return { status: "out_of_stock", price };
    }

    // 予約
    if (bodyText.includes("予約") || bodyText.includes("PRE-ORDER")) {
      return { status: "preorder", price };
    }

    // カートボタン
    if (
      $("input[value*='カゴ']").length > 0 ||
      $("button:contains('カゴ')").length > 0 ||
      bodyText.includes("買い物かごに入れる") ||
      bodyText.includes("カートに入れる")
    ) {
      return { status: "in_stock", price };
    }

    return { status: "out_of_stock", price };
  } catch (e) {
    return { status: "out_of_stock", price: null, error: e instanceof Error ? e.message : "unknown" };
  }
}
