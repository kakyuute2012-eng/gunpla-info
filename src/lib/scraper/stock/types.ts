export interface StockCheckResult {
  status: "in_stock" | "out_of_stock" | "preorder";
  price: number | null;
  error?: string; // CAPTCHA等でチェック失敗時
}

export type StoreSlug = "amazon" | "yodobashi" | "amiami" | "surugaya" | "bandai";

export type StockChecker = (url: string) => Promise<StockCheckResult>;

/**
 * 共通リクエストヘッダー
 */
export function getHeaders(store?: StoreSlug): HeadersInit {
  const base: HeadersInit = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
  };

  if (store === "amazon") {
    return { ...base, Cookie: "i18n-prefs=JPY" };
  }

  return base;
}

/**
 * 価格文字列からintに変換
 * "¥1,234" → 1234, "1,234円" → 1234
 */
export function parsePrice(text: string): number | null {
  const match = text.replace(/\s/g, "").match(/([\d,]+)/);
  if (!match) return null;
  const num = parseInt(match[1].replace(/,/g, ""), 10);
  return isNaN(num) || num === 0 ? null : num;
}

/**
 * タイムアウト付きfetch
 */
export async function fetchWithTimeout(
  url: string,
  headers: HeadersInit,
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}
