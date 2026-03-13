-- ガンプラ情報局 初期データ投入
-- Supabase SQL Editor で実行

-- 既存サンプルデータをクリア
DELETE FROM stock_info;
DELETE FROM restock_schedule;
DELETE FROM products;

-- 商品データ投入
INSERT INTO products (name, grade, series, price, release_date, image_url, bandai_url) VALUES
  ('PG UNLEASHED 1/60 νガンダム', 'PG', '機動戦士ガンダム 逆襲のシャア', 66000, '2026-01-31', NULL, 'https://bandai-hobby.net/item/01_6783/'),
  ('MG 1/100 フルアーマーZZガンダム Ver.Ka', 'MG', '機動戦士ガンダムΖΖ', 12540, '2026-02-21', NULL, 'https://bandai-hobby.net/item/01_6875/'),
  ('MGSD デスティニーガンダム', 'MG', '機動戦士ガンダムSEED DESTINY', 4950, '2026-02-21', NULL, 'https://bandai-hobby.net/item/01_6881/'),
  ('HG 1/144 グスタフ・カール００型', 'HG', '機動戦士ガンダム 閃光のハサウェイ', 3850, '2026-02-01', NULL, 'https://bandai-hobby.net/item/01_6873/'),
  ('HG 1/144 ストライクフリーダムガンダム弐式＆光の翼エフェクトセット', 'HG', '機動戦士ガンダムSEED FREEDOM', 4620, '2026-03-01', NULL, 'https://bandai-hobby.net/item/01_7079/'),
  ('MGSD ガンダムエアリアル', 'MG', '機動戦士ガンダム 水星の魔女', 4290, '2025-08-23', NULL, 'https://bandai-hobby.net/item/01_5962/'),
  ('RG 1/144 G-3ガンダム Ver.2.0', 'RG', '機動戦士ガンダム MSV', 4180, '2025-09-01', NULL, 'https://bandai-hobby.net/item/01_6854/'),
  ('RG 1/144 ガンダムアストレイ レッドドラゴン', 'RG', '機動戦士ガンダムSEED DESTINY ASTRAY R', 4950, '2026-02-01', NULL, 'https://bandai-hobby.net/item/01_7047/'),
  ('MG 1/100 ガンダムサンドロックEW（アーマディロリザード装備）', 'MG', '新機動戦記ガンダムW Endless Waltz', 7150, '2026-03-01', NULL, 'https://bandai-hobby.net/item/01_7074/'),
  ('ENTRY GRADE 1/144 RX-78-2 ガンダム', 'HG', '機動戦士ガンダム', 990, '2025-07-01', NULL, 'https://bandai-hobby.net/item/01_4960/'),
  ('HG 1/144 ガンダムエアリアル', 'HG', '機動戦士ガンダム 水星の魔女', 1430, '2022-10-01', NULL, 'https://bandai-hobby.net/item/01_4762/'),
  ('RG 1/144 Hi-νガンダム', 'RG', '機動戦士ガンダム 逆襲のシャア ベルトーチカ・チルドレン', 4950, '2021-12-01', NULL, 'https://bandai-hobby.net/item/01_3524/');

-- 在庫情報を投入（検索URLフォールバック用 - 実際のURLはスクレイパーで更新）
-- Amazon
INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amazon', 'in_stock', 59800, 'https://www.amazon.co.jp/s?k=PG+UNLEASHED+%CE%BD%E3%82%AC%E3%83%B3%E3%83%80%E3%83%A0'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6783/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amazon', 'in_stock', 9980, 'https://www.amazon.co.jp/s?k=MG+%E3%83%95%E3%83%AB%E3%82%A2%E3%83%BC%E3%83%9E%E3%83%BCZZG+Ver.Ka'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6875/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amazon', 'in_stock', 3960, 'https://www.amazon.co.jp/s?k=MGSD+%E3%83%87%E3%82%B9%E3%83%86%E3%82%A3%E3%83%8B%E3%83%BC%E3%82%AC%E3%83%B3%E3%83%80%E3%83%A0'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6881/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amazon', 'in_stock', 2770, 'https://www.amazon.co.jp/s?k=HG+%E3%82%B0%E3%82%B9%E3%82%BF%E3%83%95%E3%82%AB%E3%83%BC%E3%83%AB00%E5%9E%8B'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6873/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amazon', 'preorder', 3700, 'https://www.amazon.co.jp/s?k=HG+%E3%82%B9%E3%83%88%E3%83%A9%E3%82%A4%E3%82%AF%E3%83%95%E3%83%AA%E3%83%BC%E3%83%80%E3%83%A0%E5%BC%90%E5%BC%8F'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7079/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amazon', 'in_stock', 3430, 'https://www.amazon.co.jp/s?k=MGSD+%E3%82%AC%E3%83%B3%E3%83%80%E3%83%A0%E3%82%A8%E3%82%A2%E3%83%AA%E3%82%A2%E3%83%AB'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_5962/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amazon', 'out_of_stock', NULL, 'https://www.amazon.co.jp/s?k=RG+Hi-%CE%BD%E3%82%AC%E3%83%B3%E3%83%80%E3%83%A0'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_3524/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amazon', 'in_stock', 780, 'https://www.amazon.co.jp/s?k=ENTRY+GRADE+RX-78-2+%E3%82%AC%E3%83%B3%E3%83%80%E3%83%A0'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4960/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amazon', 'in_stock', 1150, 'https://www.amazon.co.jp/s?k=HG+%E3%82%AC%E3%83%B3%E3%83%80%E3%83%A0%E3%82%A8%E3%82%A2%E3%83%AA%E3%82%A2%E3%83%AB+1%2F144'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4762/';

-- ヨドバシ
INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'yodobashi', 'in_stock', 66000, 'https://www.yodobashi.com/category/81001/?word=PG+UNLEASHED+νガンダム'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6783/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'yodobashi', 'in_stock', 12540, 'https://www.yodobashi.com/category/81001/?word=MG+フルアーマーZZガンダム+Ver.Ka'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6875/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'yodobashi', 'in_stock', 1430, 'https://www.yodobashi.com/category/81001/?word=HG+ガンダムエアリアル'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4762/';

-- あみあみ
INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amiami', 'in_stock', 3465, 'https://www.amiami.jp/top/search/S/?srt=regtimed&vtype=list&s_keywords=MGSD+ガンダムエアリアル'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_5962/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amiami', 'in_stock', 3990, 'https://www.amiami.jp/top/search/S/?srt=regtimed&vtype=list&s_keywords=MGSD+デスティニーガンダム'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6881/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'amiami', 'in_stock', 1150, 'https://www.amiami.jp/top/search/S/?srt=regtimed&vtype=list&s_keywords=HG+ガンダムエアリアル'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4762/';

-- 駿河屋
INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'surugaya', 'in_stock', 3500, 'https://www.suruga-ya.jp/search?category=&search_word=RG+G-3ガンダム'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6854/';

INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'surugaya', 'in_stock', 4200, 'https://www.suruga-ya.jp/search?category=&search_word=RG+ガンダムアストレイ+レッドドラゴン'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7047/';

-- プレミアムバンダイ
INSERT INTO stock_info (product_id, store, status, price, url)
SELECT id, 'bandai', 'out_of_stock', 4950, 'https://p-bandai.jp/search/?q=RG+ガンダムアストレイ+レッドドラゴン'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7047/';

-- 再販スケジュール
INSERT INTO restock_schedule (product_id, restock_date, source)
SELECT id, '2026-04-01', 'バンダイ公式'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_3524/';

INSERT INTO restock_schedule (product_id, restock_date, source)
SELECT id, '2026-04-15', 'バンダイ公式'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4762/';

INSERT INTO restock_schedule (product_id, restock_date, source)
SELECT id, '2026-05-01', 'バンダイ公式'
FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6854/';
