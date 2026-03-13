"use client";

import { useState } from "react";
import Link from "next/link";
import { getMonthDays, formatDate, formatMonthLabel } from "@/utils/date";
import type { ProductWithStock } from "@/lib/types";

interface CalendarProps {
  products: ProductWithStock[];
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({ products }: CalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const days = getMonthDays(year, month);
  const today = formatDate(now);

  // Group products by release_date
  const productsByDate: Record<string, ProductWithStock[]> = {};
  for (const p of products) {
    if (p.release_date) {
      if (!productsByDate[p.release_date]) {
        productsByDate[p.release_date] = [];
      }
      productsByDate[p.release_date].push(p);
    }
  }

  function prevMonth() {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }

  return (
    <div>
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ← 前月
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {formatMonthLabel(year, month)}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          翌月 →
        </button>
      </div>

      {/* Vertical calendar list */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {days.map((date) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === today;
          const dayOfWeek = date.getDay();
          const dayProducts = productsByDate[dateStr] || [];
          const weekdayLabel = WEEKDAY_LABELS[dayOfWeek];

          const dayColor =
            dayOfWeek === 0
              ? "text-red-500"
              : dayOfWeek === 6
                ? "text-blue-500"
                : "text-gray-700";

          return (
            <div
              key={dateStr}
              className={`border-b border-gray-100 last:border-b-0 ${
                isToday ? "bg-blue-50" : dayProducts.length > 0 ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              {/* Date header */}
              <div className={`flex items-center gap-2 px-4 py-2 ${dayProducts.length > 0 ? "border-b border-gray-100" : ""}`}>
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    isToday
                      ? "bg-blue-600 text-white"
                      : dayColor
                  }`}
                >
                  {date.getDate()}
                </span>
                <span className={`text-sm font-medium ${isToday ? "text-blue-700" : dayColor}`}>
                  {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日（{weekdayLabel}）
                </span>
                {dayProducts.length > 0 && (
                  <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                    {dayProducts.length}件
                  </span>
                )}
              </div>

              {/* Products for this day */}
              {dayProducts.length > 0 && (
                <div className="divide-y divide-gray-50 px-4 pb-2">
                  {dayProducts.map((p) => {
                    const hasStock = p.stock_info?.some((s) => s.status === "in_stock");
                    const hasPreorder = p.stock_info?.some((s) => s.status === "preorder");

                    return (
                      <div key={p.id} className="flex items-start gap-3 py-2">
                        {/* Product image thumbnail */}
                        <Link href={`/products/${p.id}`} className="shrink-0">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="h-12 w-12 rounded border border-gray-200 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded border border-gray-200 bg-gray-100 text-[8px] text-gray-400">
                              No Img
                            </div>
                          )}
                        </Link>

                        {/* Product info */}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${p.id}`}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {p.grade && (
                              <span className="mr-1.5 inline-block rounded bg-gray-800 px-1 py-0.5 text-[10px] font-bold text-white">
                                {p.grade}
                              </span>
                            )}
                            {p.name}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {p.price && (
                              <span className="text-xs font-medium text-gray-600">
                                ¥{p.price.toLocaleString()}
                              </span>
                            )}
                            {hasStock && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                在庫あり
                              </span>
                            )}
                            {!hasStock && hasPreorder && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                予約受付中
                              </span>
                            )}
                            {/* Stock links */}
                            {p.stock_info
                              ?.filter((s) => s.status !== "out_of_stock" && s.url)
                              .map((s) => (
                                <a
                                  key={s.id}
                                  href={s.url!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 hover:underline"
                                >
                                  {s.store === "amazon" && "Amazon"}
                                  {s.store === "yodobashi" && "ヨドバシ"}
                                  {s.store === "amiami" && "あみあみ"}
                                  {s.store === "bandai" && "プレバン"}
                                  {s.store === "surugaya" && "駿河屋"}
                                  <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
