import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SAMPLE_PRODUCTS } from "@/lib/sample-data";
import StockBadge from "@/components/StockBadge";
import { STORES, getStoreSearchUrl } from "@/lib/types";
import type { ProductWithStock } from "@/lib/types";

export const revalidate = 300;

async function getProduct(id: string): Promise<ProductWithStock | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, stock_info(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      // フォールバック
      return SAMPLE_PRODUCTS.find((p) => p.id === id) || null;
    }
    return data as ProductWithStock;
  } catch {
    return SAMPLE_PRODUCTS.find((p) => p.id === id) || null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline"
      >
        &larr; トップに戻る
      </Link>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="flex items-center justify-center bg-gray-100 p-8">
            {(product.image_url || product.bandai_url) ? (
              <img
                src={product.image_url || `/api/image?url=${encodeURIComponent(product.bandai_url!)}`}
                alt={product.name}
                className="max-h-80 object-contain"
                loading="lazy"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="mb-2 flex items-center gap-2">
              {product.grade && (
                <span className="rounded bg-gray-800 px-2 py-0.5 text-xs font-bold text-white">
                  {product.grade}
                </span>
              )}
              {product.series && (
                <span className="text-sm text-gray-500">{product.series}</span>
              )}
            </div>

            <h1 className="mb-4 text-xl font-bold text-gray-900">
              {product.name}
            </h1>

            {product.price && (
              <p className="mb-2 text-2xl font-bold text-blue-600">
                ¥{product.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-500">
                  {" "}
                  (税込)
                </span>
              </p>
            )}

            {product.release_date && (
              <p className="mb-6 text-sm text-gray-500">
                発売日: {product.release_date}
              </p>
            )}

            {/* Stock info */}
            <h2 className="mb-3 text-base font-bold text-gray-900">
              各ショップの在庫状況
            </h2>
            <div className="space-y-2">
              {product.stock_info.length > 0 ? (
                product.stock_info.map((stock) => {
                  const shopUrl = stock.url || getStoreSearchUrl(stock.store, product.name);
                  return (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                    >
                      <div>
                        <a
                          href={shopUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {STORES[stock.store] || stock.store}
                          <svg className="ml-1 inline-block h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        {stock.price && stock.status !== "out_of_stock" && (
                          <span className="ml-2 text-sm text-gray-600">
                            ¥{stock.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <StockBadge
                        store={stock.store}
                        status={stock.status}
                        url={stock.url}
                        price={null}
                        productName={product.name}
                      />
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  在庫情報はまだありません
                </p>
              )}
            </div>

            {product.bandai_url && (
              <a
                href={product.bandai_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-blue-600 hover:underline"
              >
                バンダイ公式ページ →
              </a>
            )}

            <p className="mt-4 text-xs text-gray-400">
              最終確認:{" "}
              {product.stock_info[0]?.checked_at
                ? new Date(product.stock_info[0].checked_at).toLocaleString("ja-JP")
                : "不明"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
