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
  rakuten: "楽天市場",
  yahoo: "Yahoo!ショッピング",
  yodobashi: "ヨドバシ.com",
  biccamera: "ビックカメラ",
  joshin: "Joshin",
  yamada: "ヤマダウェブコム",
  edion: "エディオン",
  amiami: "あみあみ",
  hobbysearch: "ホビーサーチ",
  tamtam: "タムタム",
  surugaya: "駿河屋",
  dmm: "DMM.com",
  bandai: "プレミアムバンダイ",
  baton: "バトンストア",
  mokeino: "模型の王国",
};

export const STORE_COLORS: Record<string, string> = {
  amazon: "bg-yellow-500",
  rakuten: "bg-red-500",
  yahoo: "bg-red-400",
  yodobashi: "bg-red-600",
  biccamera: "bg-orange-600",
  joshin: "bg-blue-700",
  yamada: "bg-red-700",
  edion: "bg-orange-500",
  amiami: "bg-blue-600",
  hobbysearch: "bg-teal-600",
  tamtam: "bg-green-700",
  surugaya: "bg-green-600",
  dmm: "bg-gray-800",
  bandai: "bg-purple-600",
  baton: "bg-indigo-600",
  mokeino: "bg-amber-700",
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
    case "rakuten":
      return `https://search.rakuten.co.jp/search/mall/${q}/`;
    case "yahoo":
      return `https://shopping.yahoo.co.jp/search?p=${q}`;
    case "yodobashi":
      return `https://www.yodobashi.com/category/81001/?word=${q}&ginput=`;
    case "biccamera":
      return `https://www.biccamera.com/bc/category/?q=${q}`;
    case "joshin":
      return `https://joshinweb.jp/servlet/emall/search?PROD_QRY=${q}`;
    case "yamada":
      return `https://www.yamada-denkiweb.com/search/?keyword=${q}`;
    case "edion":
      return `https://www.edion.com/search/?keyword=${q}`;
    case "amiami":
      return `https://www.amiami.jp/top/search/S/?srt=regtimed&vtype=list&s_keywords=${q}`;
    case "hobbysearch":
      return `https://www.1999.co.jp/search?searchkey=${q}`;
    case "tamtam":
      return `https://www.tam-tam.co.jp/shop/default.aspx?keyword=${q}`;
    case "surugaya":
      return `https://www.suruga-ya.jp/search?category=&search_word=${q}`;
    case "dmm":
      return `https://www.dmm.com/search/?searchstr=${q}`;
    case "bandai":
      return `https://p-bandai.jp/search/?q=${q}&category=gunpla`;
    case "baton":
      return `https://baton-store.jp/search?q=${q}`;
    case "mokeino":
      return `https://www.mokeino.com/search?q=${q}`;
    default:
      return "#";
  }
}
