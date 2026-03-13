-- 在庫ステータスを実態に合わせて更新
-- 2026年3月13日時点の調査結果

-- MG フルアーマーZZガンダム Ver.Ka - Amazon: サードパーティのみ, ヨドバシ: 品切れ
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6875/');

UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE store = 'yodobashi' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6875/');

-- PG UNLEASHED νガンダム - Amazon: サードパーティのみ(高額), ヨドバシ: 品切れ
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6783/');

UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE store = 'yodobashi' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6783/');

-- MGSD デスティニーガンダム - Amazon: サードパーティのみ
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6881/');

-- HG ガンダムエアリアル - Amazon: サードパーティのみ, ヨドバシ: 品切れ, あみあみ: 品切れ
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4762/');

-- MGSD ガンダムエアリアル - Amazon: サードパーティのみ(高額)
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_5962/');

-- ENTRY GRADE RX-78-2 - Amazon: 在庫わずか
UPDATE stock_info SET status = 'in_stock', price = 770
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_4960/');

-- RG Hi-νガンダム - Amazon: サードパーティのみ(高額)
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_3524/');

-- HG グスタフ・カール００型 - Amazon: 不明(品切れの可能性)
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE store = 'amazon' AND product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6873/');

-- RG ガンダムアストレイ レッドドラゴン - プレバン限定、サードパーティのみ
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7047/');

-- RG G-3ガンダム Ver.2.0 - プレバン限定、サードパーティのみ
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_6854/');

-- HG ストライクフリーダムガンダム弐式 - プレバン限定、予約受付中の可能性
UPDATE stock_info SET status = 'preorder'
WHERE product_id = (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7079/');

-- MG ガンダムサンドロックEW - Amazon: サードパーティのみ
UPDATE stock_info SET status = 'out_of_stock', price = NULL
WHERE store = 'amazon' AND product_id IN (SELECT id FROM products WHERE bandai_url = 'https://bandai-hobby.net/item/01_7074/');

-- checked_atを現在時刻に更新
UPDATE stock_info SET checked_at = now();
