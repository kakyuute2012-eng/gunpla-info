import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { StockCheckResult, StoreSlug } from "./types";
import { checkAmazonStock } from "./amazon";
import { checkYodobashiStock } from "./yodobashi";
import { checkAmiamiStock } from "./amiami";
import { checkRakutenStock } from "./rakuten";
import { checkYahooStock } from "./yahoo";
import { checkBiccameraStock } from "./biccamera";
import { checkJoshinStock } from "./joshin";
import { checkYamadaStock } from "./yamada";
import { checkEdionStock } from "./edion";
import { checkHobbysearchStock } from "./hobbysearch";
import { checkTamtamStock } from "./tamtam";
import { checkDmmStock } from "./dmm";
import { checkBatonStock } from "./baton";
import { checkMokeinoStock } from "./mokeino";
import { checkSurugayaStock } from "./surugaya";

export interface StockCheckBatchResult {
  checked: number;
  updated: number;
  errors: number;
  details: { store: string; product: string; status: string; error?: string }[];
}

/**
 * ストアに対応するチェッカー関数を返す
 */
function getChecker(
  store: string
): ((url: string) => Promise<StockCheckResult>) | null {
  switch (store as StoreSlug) {
    case "amazon":
      return checkAmazonStock;
    case "yodobashi":
      return checkYodobashiStock;
    case "amiami":
      return checkAmiamiStock;
    case "rakuten":
      return checkRakutenStock;
    case "yahoo":
      return checkYahooStock;
    case "biccamera":
      return checkBiccameraStock;
    case "joshin":
      return checkJoshinStock;
    case "yamada":
      return checkYamadaStock;
    case "edion":
      return checkEdionStock;
    case "hobbysearch":
      return checkHobbysearchStock;
    case "tamtam":
      return checkTamtamStock;
    case "dmm":
      return checkDmmStock;
    case "surugaya":
      return checkSurugayaStock;
    case "baton":
      return checkBatonStock;
    case "mokeino":
      return checkMokeinoStock;
    default:
      return null; // bandai は未対応
  }
}

/**
 * 在庫チェックをバッチ実行
 * @param timeBudgetMs 使用可能な時間（ミリ秒）
 * @param batchSize 一度にチェックする最大件数
 */
export async function checkStockBatch(
  timeBudgetMs: number = 25000,
  batchSize: number = 10
): Promise<StockCheckBatchResult> {
  const startTime = Date.now();
  const result: StockCheckBatchResult = {
    checked: 0,
    updated: 0,
    errors: 0,
    details: [],
  };

  try {
    // URLがある在庫情報を、checked_at昇順（古い順）で取得
    const { data: stockItems, error } = await supabase
      .from("stock_info")
      .select("id, product_id, store, status, url, products(name)")
      .not("url", "is", null)
      .in("store", ["amazon", "yodobashi", "amiami", "rakuten", "yahoo", "biccamera", "joshin", "yamada", "edion", "hobbysearch", "tamtam", "dmm", "surugaya", "baton", "mokeino"])
      .order("checked_at", { ascending: true })
      .limit(batchSize);

    if (error || !stockItems || stockItems.length === 0) {
      console.log("No stock items to check");
      return result;
    }

    console.log(`Checking ${stockItems.length} stock items...`);

    for (const item of stockItems) {
      // タイムバジェットチェック
      const elapsed = Date.now() - startTime;
      if (elapsed > timeBudgetMs - 3000) {
        console.log(`Time budget exceeded after ${result.checked} items`);
        break;
      }

      const checker = getChecker(item.store);
      if (!checker || !item.url) continue;

      // Supabase joinの結果はオブジェクトまたは配列の場合がある
      const pd = item.products as unknown;
      const productName =
        (Array.isArray(pd)
          ? (pd[0] as { name?: string } | undefined)?.name
          : (pd as { name?: string } | null)?.name) ?? "unknown";

      try {
        console.log(`  Checking ${item.store}: ${productName}`);
        const checkResult = await checker(item.url);

        result.checked++;

        if (checkResult.error) {
          // エラー（CAPTCHA等）→ checked_atだけ更新してスキップ
          result.errors++;
          result.details.push({
            store: item.store,
            product: productName,
            status: `error: ${checkResult.error}`,
            error: checkResult.error,
          });

          await supabaseAdmin
            .from("stock_info")
            .update({ checked_at: new Date().toISOString() })
            .eq("id", item.id);
        } else {
          // 成功 → status, price, checked_at を更新
          const updateData: Record<string, unknown> = {
            status: checkResult.status,
            checked_at: new Date().toISOString(),
          };

          // 価格が取れた場合のみ更新
          if (checkResult.price !== null) {
            updateData.price = checkResult.price;
          }

          await supabaseAdmin
            .from("stock_info")
            .update(updateData)
            .eq("id", item.id);

          const changed = checkResult.status !== item.status;
          result.updated++;
          result.details.push({
            store: item.store,
            product: productName,
            status: `${checkResult.status}${changed ? " (changed!)" : ""}`,
          });

          if (changed) {
            console.log(
              `  → Status changed: ${item.status} → ${checkResult.status}`
            );
          }
        }
      } catch (e) {
        result.errors++;
        result.details.push({
          store: item.store,
          product: productName,
          status: "exception",
          error: e instanceof Error ? e.message : "unknown",
        });
      }

      // レートリミット対策: 1秒待機
      await new Promise((r) => setTimeout(r, 1000));
    }
  } catch (e) {
    console.error("Stock check batch error:", e);
  }

  return result;
}
