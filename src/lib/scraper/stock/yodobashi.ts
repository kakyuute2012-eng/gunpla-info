import * as cheerio from "cheerio";
import {
  StockCheckResult,
  getHeaders,
  parsePrice,
  fetchWithTimeout,
} from "./types";

/**
 * ヨドバシ.com 商品ページの在庫状況をチェック
 */
export async function checkYodobashiStock(
  url: string
): Promise<StockCheckResult> {
  try {
    const res = await fetchWithTimeout(url, getHeaders("yodobashi"));
    if (!res.ok) {
      return { status: "out_of_stock", price: null, error: `http_${res.status}` };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 価格取得
    const price = extractPrice($, html);

    // 在庫状況判定
    const status = detectStatus($, html);

    return { status, price };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return { status: "out_of_stock", price: null, error: msg };
  }
}

function extractPrice(
  $: cheerio.CheerioAPI,
  html: string
): number | null {
  // ヨドバシの価格セレクタ
  const selectors = [
    ".salesPrice",
    ".pPrice .red",
    "#js_scl_price",
    ".productPrice",
  ];

  for (const sel of selectors) {
    const text = $(sel).first().text().trim();
    if (text) {
      const p = parsePrice(text);
      if (p && p > 100 && p < 500000) return p;
    }
  }

  // HTML内の価格パターンを直接検索
  const priceMatch = html.match(/(?:販売価格|価格)[：:\s]*[¥￥]?([\d,]+)\s*円/);
  if (priceMatch) {
    return parsePrice(priceMatch[1]);
  }

  return null;
}

function detectStatus(
  $: cheerio.CheerioAPI,
  html: string
): "in_stock" | "out_of_stock" | "preorder" {
  const bodyText = $("body").text();

  // 予約判定
  if (
    bodyText.includes("予約受付中") ||
    bodyText.includes("発売日以降のお届け") ||
    bodyText.includes("予約商品")
  ) {
    return "preorder";
  }

  // 品切れ判定
  if (
    bodyText.includes("予定数の販売を終了しました") ||
    bodyText.includes("販売を終了しました") ||
    bodyText.includes("お取り扱いできません") ||
    bodyText.includes("品切れ中") ||
    bodyText.includes("在庫なし") ||
    bodyText.includes("販売休止中")
  ) {
    return "out_of_stock";
  }

  // 在庫あり判定
  if (
    bodyText.includes("在庫あり") ||
    bodyText.includes("在庫残少") ||
    bodyText.includes("カートに入れる") ||
    bodyText.includes("ショッピングカートに入れる")
  ) {
    return "in_stock";
  }

  // デフォルト
  return "out_of_stock";
}
