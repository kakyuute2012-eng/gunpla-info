-- ガンプラ情報局 DBスキーマ
-- Supabase (PostgreSQL) で実行

-- 商品テーブル
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade TEXT,
  series TEXT,
  price INTEGER,
  release_date DATE,
  image_url TEXT,
  bandai_url TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 在庫情報テーブル
CREATE TABLE IF NOT EXISTS stock_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_stock', 'out_of_stock', 'preorder')),
  price INTEGER,
  url TEXT,
  checked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, store)
);

-- 再販スケジュールテーブル
CREATE TABLE IF NOT EXISTS restock_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  restock_date DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_products_grade ON products(grade);
CREATE INDEX IF NOT EXISTS idx_products_release_date ON products(release_date);
CREATE INDEX IF NOT EXISTS idx_stock_info_product ON stock_info(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_info_status ON stock_info(status);
CREATE INDEX IF NOT EXISTS idx_restock_date ON restock_schedule(restock_date);

-- RLS (Row Level Security) - 読み取りは全公開
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON stock_info FOR SELECT USING (true);
CREATE POLICY "Public read access" ON restock_schedule FOR SELECT USING (true);
