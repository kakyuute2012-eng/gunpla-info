import * as cheerio from "cheerio";

interface ScrapedProduct {
  name: string;
  grade: string | null;
  series: string | null;
  price: number | null;
  release_date: string | null;
  image_url: string | null;
  bandai_url: string;
}

/**
 * バンダイホビーサイトの発売スケジュールページからスクレイピング
 * セレクタは2026年3月時点のサイト構造に基づく
 */
export async function scrapeBandaiProducts(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  try {
    // 当月と来月のスケジュールを取得
    const now = new Date();
    const months = [
      { year: now.getFullYear(), month: now.getMonth() + 1 },
      { year: now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(), month: ((now.getMonth() + 1) % 12) + 1 },
    ];

    for (const { year, month } of months) {
      const url = `https://bandai-hobby.net/schedule/?y=${year}&m=${String(month).padStart(2, "0")}`;
      const scraped = await scrapeSchedulePage(url, year, month);
      products.push(...scraped);
    }
  } catch (error) {
    console.error("Bandai scraping error:", error);
  }

  return products;
}

async function scrapeSchedulePage(
  url: string,
  year: number,
  month: number
): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    },
  });

  if (!res.ok) {
    console.error(`Bandai fetch failed: ${res.status} for ${url}`);
    return products;
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // 日付見出しをトラッキング
  let currentDay: string | null = null;

  // 各セクション内の日付見出しと商品カードを処理
  $(".pg-calendar__inner").each((_, inner) => {
    const $inner = $(inner);

    $inner.children().each((_, child) => {
      const $child = $(child);

      // 日付見出し (h3)
      if ($child.is("h3") || $child.hasClass("p-heading__h3")) {
        const dayText = $child.text().trim();
        const dayMatch = dayText.match(/(\d{1,2})日/);
        if (dayMatch) {
          currentDay = dayMatch[1].padStart(2, "0");
        }
      }

      // 商品カードのグリッド
      if ($child.hasClass("p-card__wrap")) {
        $child.find("a.p-card").each((_, card) => {
          const $card = $(card);

          const name = $card.find(".p-card__tit").text().trim();
          if (!name) return;

          // 価格
          const priceText = $card.find(".p-card__price").text();
          const priceMatch = priceText.match(/([\d,]+)円/);
          const price = priceMatch
            ? parseInt(priceMatch[1].replace(/,/g, ""), 10)
            : null;

          // 画像URL
          const imgEl = $card.find(".p-card__img img");
          const image_url = imgEl.attr("src") || imgEl.attr("data-src") || null;

          // リンク
          const href = $card.attr("href") || "";
          const bandai_url = href.startsWith("http")
            ? href
            : `https://bandai-hobby.net${href}`;

          // 発売日
          let release_date: string | null = null;
          if (currentDay) {
            release_date = `${year}-${String(month).padStart(2, "0")}-${currentDay}`;
          } else {
            // .p-card_date からフォールバック（シングルアンダースコア注意）
            const dateText = $card.find(".p-card_date").text();
            const dateMatch = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
            if (dateMatch) {
              release_date = `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`;
            }
          }

          const grade = detectGrade(name);
          const series = detectSeries(name);

          products.push({
            name,
            grade,
            series,
            price,
            release_date,
            image_url,
            bandai_url,
          });
        });
      }
    });
  });

  return products;
}

function detectGrade(name: string): string | null {
  const upper = name.toUpperCase();
  if (upper.includes("PG UNLEASHED") || upper.includes("PG 1/60")) return "PG";
  if (upper.includes("MGSD")) return "MG";
  if (upper.includes("MGEX")) return "MGEX";
  if (upper.includes("MG 1/100") || upper.includes("MG ")) return "MG";
  if (upper.includes("RG 1/144") || upper.includes("RG ")) return "RG";
  if (upper.includes("HGUC") || upper.includes("HGCE") || upper.includes("HGAC") || upper.includes("HGBF")) return "HG";
  if (upper.includes("HG 1/144") || upper.includes("HG ")) return "HG";
  if (upper.includes("SD ") || upper.includes("SDCS")) return "SD";
  if (upper.includes("RE/100")) return "RE/100";
  if (upper.includes("ENTRY GRADE") || upper.includes("EG ")) return "HG";
  if (upper.includes("FULL MECHANICS")) return "HG";
  return null;
}

function detectSeries(name: string): string | null {
  if (name.includes("水星の魔女")) return "機動戦士ガンダム 水星の魔女";
  if (name.includes("SEED FREEDOM") || name.includes("シードフリーダム")) return "機動戦士ガンダムSEED FREEDOM";
  if (name.includes("SEED DESTINY") || name.includes("デスティニー")) return "機動戦士ガンダムSEED DESTINY";
  if (name.includes("SEED") || name.includes("フリーダム") || name.includes("ストライク")) return "機動戦士ガンダムSEED";
  if (name.includes("逆襲のシャア") || name.includes("νガンダム") || name.includes("サザビー")) return "機動戦士ガンダム 逆襲のシャア";
  if (name.includes("UC") || name.includes("ユニコーン")) return "機動戦士ガンダムUC";
  if (name.includes("閃光のハサウェイ") || name.includes("Ξ") || name.includes("クスィー") || name.includes("ペーネロペー") || name.includes("グスタフ・カール")) return "機動戦士ガンダム 閃光のハサウェイ";
  if (name.includes("ΖΖ") || name.includes("ZZ")) return "機動戦士ガンダムΖΖ";
  if (name.includes("Ζガンダム") || name.includes("Zガンダム")) return "機動戦士Ζガンダム";
  if (name.includes("ガンダムW") || name.includes("ウイング") || name.includes("サンドロック") || name.includes("デスサイズ") || name.includes("ヘビーアームズ") || name.includes("シェンロン") || name.includes("エピオン")) return "新機動戦記ガンダムW";
  if (name.includes("鉄血") || name.includes("バルバトス")) return "機動戦士ガンダム 鉄血のオルフェンズ";
  if (name.includes("00") || name.includes("ダブルオー") || name.includes("エクシア")) return "機動戦士ガンダム00";
  if (name.includes("ビルド") || name.includes("BUILD")) return "ガンダムビルドシリーズ";
  if (name.includes("RX-78") || name.includes("ザク") || name.includes("グフ") || name.includes("ドム") || name.includes("ジオング") || name.includes("ゲルググ")) return "機動戦士ガンダム";
  return null;
}
