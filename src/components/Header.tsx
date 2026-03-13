"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            ガンプラ情報局
          </Link>

          {/* Desktop nav */}
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              新着情報
            </Link>
            <Link
              href="/calendar"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              再販カレンダー
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              商品検索
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="border-t border-gray-200 pb-4 md:hidden">
            <Link
              href="/"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              新着情報
            </Link>
            <Link
              href="/calendar"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              再販カレンダー
            </Link>
            <Link
              href="/search"
              className="block py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              onClick={() => setMenuOpen(false)}
            >
              商品検索
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
