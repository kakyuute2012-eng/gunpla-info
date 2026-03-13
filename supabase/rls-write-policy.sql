-- cronジョブ（anon key）からの書き込みを許可するRLSポリシー
-- Supabase SQL Editor で実行

-- products テーブルへの書き込み許可
CREATE POLICY "Allow anon insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON products FOR UPDATE USING (true) WITH CHECK (true);

-- stock_info テーブルへの書き込み許可
CREATE POLICY "Allow anon insert" ON stock_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON stock_info FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete" ON stock_info FOR DELETE USING (true);

-- restock_schedule テーブルへの書き込み許可
CREATE POLICY "Allow anon insert" ON restock_schedule FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON restock_schedule FOR UPDATE USING (true) WITH CHECK (true);
