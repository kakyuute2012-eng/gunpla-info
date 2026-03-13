-- 在庫情報のURLを実際の商品ページURLに更新
-- Supabase SQL Editor で実行

-- MG 1/100 フルアーマーZZガンダム Ver.Ka
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B0FNQ2Y726'
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6875/');

UPDATE stock_info SET url = 'https://www.yodobashi.com/product/100000001006237046/'
WHERE store = 'yodobashi' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6875/');

-- PG UNLEASHED 1/60 νガンダム
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B0F9KF5Q1C'
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6783/');

UPDATE stock_info SET url = 'https://www.yodobashi.com/product/100000001009159021/'
WHERE store = 'yodobashi' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6783/');

-- MGSD デスティニーガンダム
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B0FNQKFK9K'
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6881/');

-- HG 1/144 ガンダムエアリアル
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B0B71XBLQZ'
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4762/');

UPDATE stock_info SET url = 'https://www.yodobashi.com/product/100000001007235423/'
WHERE store = 'yodobashi' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4762/');

-- MGSD ガンダムエアリアル
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B0DXDVBCL1'
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_5962/');

-- ENTRY GRADE 1/144 RX-78-2 ガンダム
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B08VF8GV61'
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4960/');

-- RG 1/144 Hi-νガンダム
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B092RKC6GX'
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_3524/');

-- HG 1/144 グスタフ・カール００型
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B0FNQ54KXW'
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6873/');

-- RG 1/144 ガンダムアストレイ レッドドラゴン
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B0G44V4W7S'
WHERE store = 'amazon' AND product_id IN (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7047/');

-- RG 1/144 G-3ガンダム Ver.2.0
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B0FLD8Q89V'
WHERE store = 'amazon' AND product_id IN (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6854/');

-- HG 1/144 ストライクフリーダムガンダム弐式 (プレバン限定)
UPDATE stock_info SET url = 'https://p-bandai.jp/item/item-1000244538/', store = 'bandai'
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7079/');

-- MG 1/100 ガンダムサンドロックEW
UPDATE stock_info SET url = 'https://www.amazon.co.jp/dp/B09K3N92GW'
WHERE store = 'amazon' AND product_id IN (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7074/');

-- あみあみのURLも検索URLから商品検索結果ページに修正（あみあみは検索が最適）
UPDATE stock_info SET url = 'https://www.amiami.jp/top/search/S/?srt=regtimed&vtype=list&s_keywords=MGSD+ガンダムエアリアル'
WHERE store = 'amiami' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_5962/');

UPDATE stock_info SET url = 'https://www.amiami.jp/top/search/S/?srt=regtimed&vtype=list&s_keywords=MGSD+デスティニーガンダム'
WHERE store = 'amiami' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6881/');

UPDATE stock_info SET url = 'https://www.amiami.jp/top/search/S/?srt=regtimed&vtype=list&s_keywords=HG+ガンダムエアリアル'
WHERE store = 'amiami' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4762/');

-- 駿河屋のURLも検索URLに修正
UPDATE stock_info SET url = 'https://www.suruga-ya.jp/search?category=5&search_word=RG+G-3ガンダム+Ver.2.0'
WHERE store = 'surugaya' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6854/');

UPDATE stock_info SET url = 'https://www.suruga-ya.jp/search?category=5&search_word=RG+ガンダムアストレイ+レッドドラゴン'
WHERE store = 'surugaya' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7047/');
