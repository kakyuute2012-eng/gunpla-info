"use client";

import { useState } from "react";
import { GRADES } from "@/lib/types";
import type { ProductWithStock } from "@/lib/types";
import ProductCard from "./ProductCard";

interface SearchFormProps {
  allProducts: ProductWithStock[];
}

export default function SearchForm({ allProducts }: SearchFormProps) {
  const [keyword, setKeyword] = useState("");
  const [grade, setGrade] = useState("");
  const [stockOnly, setStockOnly] = useState(false);

  const filtered = allProducts.filter((p) => {
    if (keyword && !p.name.toLowerCase().includes(keyword.toLowerCase())) {
      return false;
    }
    if (grade && p.grade !== grade) {
      return false;
    }
    if (stockOnly && !p.stock_info.some((s) => s.status === "in_stock")) {
      return false;
    }
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Keyword */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              キーワード
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="商品名を入力..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Grade */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              グレード
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Stock filter */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => setStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              在庫ありのみ表示
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <p className="mb-4 text-sm text-gray-500">
        {filtered.length}件の商品が見つかりました
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          条件に合う商品が見つかりませんでした
        </div>
      )}
    </div>
  );
}
