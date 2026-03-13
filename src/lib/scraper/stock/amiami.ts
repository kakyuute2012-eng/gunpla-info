import * as cheerio from "cheerio";
import {
  StockCheckResult,
  getHeaders,
  parsePrice,
  fetchWithTimeout,
} from "./types";

/**
 * あみあみ 商品ページの在庫状況をチェック
 * URL例: https://www.amiami.jp/top/detail/detail?gcode=FIGURE-XXXXX
 */
export async function checkAmiamiStock(
  url: string
): Promise<StockCheckResult> {
  try {
    // まずAPIからデータ取得を試みる
    const apiResult = await tryAmiamiApi(url);
    if (apiResult) return apiResult;

    // フォールバック: HTMLパース
    return await scrapeAmiamiPage(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return { status: "out_of_stock", price: null, error: msg };
  }
}

/**
 * あみあみのAPI(gcode)からデータ取得を試みる
 */
async function tryAmiamiApi(url: string): Promise<StockCheckResult | null> {
  // URLからgcodeを抽出
  const gcodeMatch = url.match(/gcode=([^&]+)/);
  if (!gcodeMatch) return null;

  const gcode = gcodeMatch[1];
  const apiUrl = `https://api.amiami.jp/api/v1.0/item?gcode=${gcode}`;

  try {
    const res = await fetchWithTimeout(apiUrl, {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
      "Accept-Language": "ja",
    });

    if (!res.ok) return null;

    const data = await res.json();
    const item = data?.RSuccess ? data : null;
    if (!item) return null;

    // APIレスポンスから在庫情報を取得
    // 注: APIの構造は変わる可能性がある
    const stockFlg = item.item?.stock_flg ?? item.stock_flg;
    const priceVal = item.item?.c_price_taxed ?? item.item?.price ?? item.c_price_taxed;

    const price = typeof priceVal === "number" ? priceVal : null;

    if (stockFlg === 0 || stockFlg === false) {
      return { status: "out_of_stock", price };
    }

    return { status: "in_stock", price };
  } catch {
    return null; // API失敗 → HTMLフォールバック
  }
}

/**
 * あみあみ商品ページのHTMLから在庫情報をパース
 */
async function scrapeAmiamiPage(url: string): Promise<StockCheckResult> {
  const res = await fetchWithTimeout(url, getHeaders("amiami"));
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
}

function extractPrice(
  $: cheerio.CheerioAPI,
  html: string
): number | null {
  // あみあみの価格表示
  const selectors = [
    ".selling_price .value",
    ".item-detail__price",
    ".price .selling-price",
  ];

  for (const sel of selectors) {
    const text = $(sel).first().text().trim();
    if (text) {
      const p = parsePrice(text);
      if (p && p > 100 && p < 500000) return p;
    }
  }

  // HTML内のJSON埋め込みデータから価格を探す
  const jsonMatch = html.match(/"c_price_taxed"\s*:\s*(\d+)/);
  if (jsonMatch) {
    const p = parseInt(jsonMatch[1], 10);
    if (p > 100 && p < 500000) return p;
  }

  // テキスト内から価格を検索
  const priceMatch = html.match(/(?:税込|価格)[）)：:\s]*[¥￥]?([\d,]+)\s*円/);
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
  const upperHtml = html.toUpperCase();

  // 予約判定
  if (
    bodyText.includes("予約受付中") ||
    bodyText.includes("予約受付開始") ||
    upperHtml.includes("PRE-ORDER") ||
    upperHtml.includes("PREORDER")
  ) {
    return "preorder";
  }

  // 品切れ判定
  if (
    upperHtml.includes("SOLD OUT") ||
    bodyText.includes("品切れ") ||
    bodyText.includes("販売終了") ||
    bodyText.includes("売り切れ") ||
    bodyText.includes("在庫なし") ||
    bodyText.includes("注文不可")
  ) {
    return "out_of_stock";
  }

  // カートボタン存在 → 在庫あり
  if (
    $("input[value*='カート']").length > 0 ||
    $("button:contains('カート')").length > 0 ||
    $(".btn-cart").length > 0 ||
    bodyText.includes("カートに入れる")
  ) {
    return "in_stock";
  }

  // デフォルト
  return "out_of_stock";
}
