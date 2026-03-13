"use client";

import { useState } from "react";
import Link from "next/link";
import { getCalendarGrid, formatDate, formatMonthLabel } from "@/utils/date";
import type { Product } from "@/lib/types";

interface CalendarProps {
  products: Product[];
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({ products }: CalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const grid = getCalendarGrid(year, month);
  const today = formatDate(now);

  // Group products by release_date
  const productsByDate: Record<string, Product[]> = {};
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
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          前月
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {formatMonthLabel(year, month)}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          翌月
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {/* Header */}
        <div className="grid grid-cols-7 bg-gray-100">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`py-2 text-center text-sm font-medium ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-700"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {grid.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="min-h-[80px] border-t border-gray-100 bg-gray-50" />;
            }

            const dateStr = formatDate(date);
            const isToday = dateStr === today;
            const dayProducts = productsByDate[dateStr] || [];
            const dayOfWeek = date.getDay();

            return (
              <div
                key={dateStr}
                className={`min-h-[80px] border-t border-gray-100 p-1 ${
                  isToday ? "bg-blue-50" : ""
                }`}
              >
                <span
                  className={`inline-block rounded-full px-1.5 text-sm ${
                    isToday
                      ? "bg-blue-600 font-bold text-white"
                      : dayOfWeek === 0
                        ? "text-red-500"
                        : dayOfWeek === 6
                          ? "text-blue-500"
                          : "text-gray-700"
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayProducts.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="block truncate rounded bg-orange-100 px-1 text-[10px] text-orange-800 hover:bg-orange-200"
                    >
                      {p.grade && `[${p.grade}] `}
                      {p.name}
                    </Link>
                  ))}
                  {dayProducts.length > 3 && (
                    <span className="block text-[10px] text-gray-500">
                      +{dayProducts.length - 3}件
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
