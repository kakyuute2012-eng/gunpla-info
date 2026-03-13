import { STORES, getStoreSearchUrl } from "@/lib/types";

interface StockBadgeProps {
  store: string;
  status: "in_stock" | "out_of_stock" | "preorder";
  url: string | null;
  price: number | null;
  productName?: string;
}

const STATUS_STYLES = {
  in_stock: "bg-green-100 text-green-800 border-green-300",
  out_of_stock: "bg-gray-100 text-gray-500 border-gray-300",
  preorder: "bg-blue-100 text-blue-800 border-blue-300",
};

const STATUS_LABELS = {
  in_stock: "在庫あり",
  out_of_stock: "在庫なし",
  preorder: "予約受付中",
};

export default function StockBadge({ store, status, url, price, productName }: StockBadgeProps) {
  const storeName = STORES[store] || store;
  const label = STATUS_LABELS[status];
  const style = STATUS_STYLES[status];

  // URLが未設定の場合、商品名から検索URLを自動生成
  const linkUrl = url || (productName ? getStoreSearchUrl(store, productName) : null);

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${style}`}
    >
      <span className="font-bold">{storeName}</span>
      <span>{label}</span>
      {price && status !== "out_of_stock" && (
        <span className="text-gray-600">¥{price.toLocaleString()}</span>
      )}
      {linkUrl && status !== "out_of_stock" && (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </span>
  );

  if (linkUrl && status !== "out_of_stock") {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}
