export interface Product {
  id: string;
  name: string;
  grade: string | null;
  series: string | null;
  price: number | null;
  release_date: string | null;
  image_url: string | null;
  bandai_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockInfo {
  id: string;
  product_id: string;
  store: string;
  status: "in_stock" | "out_of_stock" | "preorder";
  price: number | null;
  url: string | null;
  checked_at: string;
}

export interface RestockSchedule {
  id: string;
  product_id: string;
  restock_date: string;
  source: string | null;
  created_at: string;
}

export interface ProductWithStock extends Product {
  stock_info: StockInfo[];
}

export interface CalendarDay {
  date: string;
  products: Product[];
}

export const GRADES = ["HG", "MG", "RG", "PG", "SD", "RE/100", "MGEX", "OTHER"] as const;
export type Grade = (typeof GRADES)[number];

export const STORES: Record<string, string> = {
  amazon: "Amazon",
  yodobashi: "ヨドバシ.com",
  amiami: "あみあみ",
  surugaya: "駿河屋",
  bandai: "プレミアムバンダイ",
};

export const STORE_COLORS: Record<string, string> = {
  amazon: "bg-yellow-500",
  yodobashi: "bg-red-600",
  amiami: "bg-blue-600",
  surugaya: "bg-green-600",
  bandai: "bg-purple-600",
};

/**
 * 商品名からEC各サイトの検索URLを生成
 * ※ 直接商品URLがDBに登録されている場合はそちらが優先される（フォールバック用）
 */
export function getStoreSearchUrl(store: string, productName: string): string {
  const q = encodeURIComponent(productName);
  switch (store) {
    case "amazon":
      return `https://www.amazon.co.jp/s?k=${q}`;
    case "yodobashi":
      return `https://www.yodobashi.com/category/81001/?word=${q}&ginput=`;
    case "amiami":
      return `https://www.amiami.jp/top/search/S/?srt=regtimed&vtype=list&s_keywords=${q}`;
    case "surugaya":
      return `https://www.suruga-ya.jp/search?category=&search_word=${q}`;
    case "bandai":
      return `https://p-bandai.jp/search/?q=${q}&category=gunpla`;
    default:
      return "#";
  }
}
