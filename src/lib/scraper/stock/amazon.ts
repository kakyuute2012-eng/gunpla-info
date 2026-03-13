import * as cheerio from "cheerio";
import {
  StockCheckResult,
  getHeaders,
  parsePrice,
  fetchWithTimeout,
} from "./types";

/**
 * Amazon.co.jp 商品ページの在庫状況をチェック
 */
export async function checkAmazonStock(
  url: string
): Promise<StockCheckResult> {
  try {
    const res = await fetchWithTimeout(url, getHeaders("amazon"));
    if (!res.ok) {
      return { status: "out_of_stock", price: null, error: `http_${res.status}` };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // CAPTCHA検出
    const title = $("title").text().toLowerCase();
    if (
      title.includes("sorry") ||
      title.includes("robot") ||
      html.includes("captcha") ||
      html.includes("automated access")
    ) {
      return { status: "out_of_stock", price: null, error: "captcha" };
    }

    // ページが商品ページかどうか確認
    const productTitle = $("#productTitle").text().trim();
    if (!productTitle) {
      return { status: "out_of_stock", price: null, error: "not_product_page" };
    }

    // 価格取得
    const price = extractPrice($);

    // 在庫状況判定
    const status = detectStatus($, html);

    return { status, price };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return { status: "out_of_stock", price: null, error: msg };
  }
}

function extractPrice($: cheerio.CheerioAPI): number | null {
  // 複数箇所から価格を試行
  const selectors = [
    ".a-price .a-offscreen",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    "#corePrice_feature_div .a-offscreen",
    ".apexPriceToPay .a-offscreen",
    "#price_inside_buybox",
  ];

  for (const sel of selectors) {
    const text = $(sel).first().text().trim();
    if (text) {
      const p = parsePrice(text);
      if (p && p > 100 && p < 500000) return p; // 妥当な価格範囲
    }
  }

  return null;
}

function detectStatus(
  $: cheerio.CheerioAPI,
  html: string
): "in_stock" | "out_of_stock" | "preorder" {
  const fullText = html.toLowerCase();
  const availText = $("#availability").text().trim();
  const availLower = availText.toLowerCase();

  // 予約判定（在庫判定より先に）
  if (
    availText.includes("予約受付中") ||
    availText.includes("まだ発売されていません") ||
    html.includes("pre-order") ||
    availText.includes("この商品の発売予定日")
  ) {
    return "preorder";
  }

  // 品切れ判定
  if (
    availText.includes("一時的に在庫切れ") ||
    availText.includes("現在在庫切れ") ||
    availText.includes("在庫切れ") ||
    availText.includes("お取り扱いできません") ||
    availLower.includes("currently unavailable")
  ) {
    return "out_of_stock";
  }

  // 在庫あり判定
  if (
    availText.includes("在庫あり") ||
    availText.includes("残り") ||
    availLower.includes("in stock") ||
    availLower.includes("left in stock")
  ) {
    // サードパーティのみチェック
    const merchantInfo = $("#merchantInfoFeature_feature_div").text();
    const buybox = $("#tabular-buybox-container").text();
    const sellerText = merchantInfo + buybox;

    if (
      sellerText.includes("Amazon.co.jp") ||
      sellerText.includes("Amazon") ||
      !sellerText // 出品者情報がない場合は在庫ありとみなす
    ) {
      return "in_stock";
    }

    // サードパーティのみ → 品切れ扱い
    return "out_of_stock";
  }

  // カートに追加ボタンの存在確認
  if (
    $("#add-to-cart-button").length > 0 ||
    fullText.includes("カートに入れる")
  ) {
    return "in_stock";
  }

  // デフォルト: 品切れ
  return "out_of_stock";
}
