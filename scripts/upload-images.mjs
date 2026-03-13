/**
 * Amazon商品ページから画像を取得してSupabase Storageにアップロード
 * node scripts/upload-images.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pvdshgepywjtlwskmyki.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZHNoZ2VweXdqdGx3c2tteWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDY3NzcsImV4cCI6MjA4ODkyMjc3N30._WWge0yZVGxiAb2ES2c3dUc1leBMSKMg8FNXv6YCil4";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZHNoZ2VweXdqdGx3c2tteWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM0Njc3NywiZXhwIjoyMDg4OTIyNzc3fQ.9bpYnAh-CnEv2trHwCMLBeW0VxkKz_MlAQVT06600Z8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// バンダイURL → Amazon ASIN のマッピング
const PRODUCT_ASINS = {
  "https://bandai-hobby.net/item/01_6875/": "B0FNQ2Y726",  // MG フルアーマーZZ
  "https://bandai-hobby.net/item/01_6783/": "B0F9KF5Q1C",  // PG νガンダム
  "https://bandai-hobby.net/item/01_6881/": "B0FNQKFK9K",  // MGSD デスティニー
  "https://bandai-hobby.net/item/01_4762/": "B0B71XBLQZ",  // HG エアリアル
  "https://bandai-hobby.net/item/01_5962/": "B0DXDVBCL1",  // MGSD エアリアル
  "https://bandai-hobby.net/item/01_4960/": "B08VF8GV61",  // EG RX-78-2
  "https://bandai-hobby.net/item/01_3524/": "B092RKC6GX",  // RG Hi-ν
  "https://bandai-hobby.net/item/01_6873/": "B0FNQ54KXW",  // HG グスタフ・カール
  "https://bandai-hobby.net/item/01_7047/": "B0G44V4W7S",  // RG アストレイ レッドドラゴン
  "https://bandai-hobby.net/item/01_6854/": "B0FLD8Q89V",  // RG G-3
  "https://bandai-hobby.net/item/01_7079/": null,           // HG ストフリ弐式 (プレバン限定)
  "https://bandai-hobby.net/item/01_7074/": "B09K3N92GW",  // MG サンドロック
};

async function getAmazonImageUrl(asin) {
  const url = `https://www.amazon.co.jp/dp/${asin}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "ja,en;q=0.9",
    },
  });
  const html = await res.text();

  // 大きい画像を優先
  const patterns = [
    /https:\/\/m\.media-amazon\.com\/images\/I\/[^"'\s]+\._AC_SL1[0-9]+_\.jpg/,
    /https:\/\/m\.media-amazon\.com\/images\/I\/[^"'\s]+\._AC_SX[0-9]+_\.jpg/,
    /https:\/\/m\.media-amazon\.com\/images\/I\/[^"'\s]+\.jpg/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[0];
  }
  return null;
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (res.ok) return await res.arrayBuffer();
  return null;
}

async function main() {
  console.log("=== 画像アップロードスクリプト ===\n");

  for (const [bandaiUrl, asin] of Object.entries(PRODUCT_ASINS)) {
    const itemId = bandaiUrl.match(/item\/([^/]+)/)?.[1];
    if (!itemId) continue;

    console.log(`Processing ${itemId} (ASIN: ${asin || "none"})...`);

    if (!asin) {
      console.log("  → ASIN なし、スキップ\n");
      continue;
    }

    // Amazon画像URL取得
    const imageUrl = await getAmazonImageUrl(asin);
    if (!imageUrl) {
      console.log("  → 画像URL取得失敗\n");
      continue;
    }
    console.log(`  → Amazon画像: ${imageUrl.substring(0, 60)}...`);

    // 画像ダウンロード
    const imgBuffer = await downloadImage(imageUrl);
    if (!imgBuffer) {
      console.log("  → ダウンロード失敗\n");
      continue;
    }
    console.log(`  → サイズ: ${imgBuffer.byteLength} bytes`);

    // Supabase Storageにアップロード
    const fileName = `${itemId}.jpg`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(fileName, imgBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.log(`  → アップロード失敗: ${uploadError.message}\n`);
      continue;
    }

    // 公開URL取得
    const { data: pubUrl } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const publicUrl = pubUrl?.publicUrl;
    console.log(`  → 公開URL: ${publicUrl}`);

    // DBのimage_urlを更新
    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update({ image_url: publicUrl })
      .eq("bandai_url", bandaiUrl);

    if (updateError) {
      console.log(`  → DB更新失敗: ${updateError.message}`);
    } else {
      console.log("  → DB更新完了");
    }
    console.log();

    // レートリミット回避
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("=== 完了 ===");
}

main().catch(console.error);
