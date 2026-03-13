import Link from "next/link";
import type { ProductWithStock } from "@/lib/types";
import StockBadge from "./StockBadge";

interface ProductCardProps {
  product: ProductWithStock;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasStock = product.stock_info.some((s) => s.status === "in_stock");
  const hasPreorder = product.stock_info.some((s) => s.status === "preorder");

  // 画像URL: image_urlがあればそのまま、なければbandai_urlからプロキシ
  const imageUrl = product.image_url
    ? product.image_url
    : product.bandai_url
      ? `/api/image?url=${encodeURIComponent(product.bandai_url)}`
      : null;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-contain p-2"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {/* Status indicator */}
          {hasStock && (
            <span className="absolute right-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
              在庫あり
            </span>
          )}
          {!hasStock && hasPreorder && (
            <span className="absolute right-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
              予約可
            </span>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-2">
          {product.grade && (
            <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs font-bold text-white">
              {product.grade}
            </span>
          )}
          {product.price && (
            <span className="text-sm font-medium text-gray-700">
              ¥{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {product.release_date && (
          <p className="mt-1 text-xs text-gray-500">
            発売日: {product.release_date}
          </p>
        )}

        {/* Stock badges */}
        <div className="mt-2 flex flex-wrap gap-1">
          {product.stock_info.slice(0, 3).map((stock) => (
            <StockBadge
              key={stock.id}
              store={stock.store}
              status={stock.status}
              url={stock.url}
              price={stock.price}
              productName={product.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
