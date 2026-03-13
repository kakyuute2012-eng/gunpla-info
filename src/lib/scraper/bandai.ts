import * as cheerio from "cheerio";

interface ScrapedProduct {
  name: string;
  grade: string | null;
  price: number | null;
  release_date: string | null;
  image_url: string | null;
  bandai_url: string;
}

/**
 * バンダイホビーサイトから新商品・再販情報をスクレイピング
 * ※ 実際のスクレイピングはサイト構造に合わせて調整が必要
 */
export async function scrapeBandaiProducts(): Promise<ScrapedProduct[]> {
  const products: ScrapedProduct[] = [];

  try {
    const res = await fetch("https://bandai-hobby.net/schedule/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      console.error(`Bandai fetch failed: ${res.status}`);
      return products;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // スケジュールページの各商品を取得
    // ※ 実際のHTML構造に合わせてセレクタを調整する必要があります
    $(".p-schedule__item, .schedule-item, article").each((_, el) => {
      const $el = $(el);
      const name = $el.find("h2, h3, .title, .name").first().text().trim();
      if (!name) return;

      const priceText = $el.find(".price, .p-schedule__price").text();
      const priceMatch = priceText.match(/[\d,]+/);
      const price = priceMatch
        ? parseInt(priceMatch[0].replace(/,/g, ""), 10)
        : null;

      const dateText = $el.find(".date, .p-schedule__date, time").text();
      const dateMatch = dateText.match(/(\d{4})[年/](\d{1,2})[月/](\d{1,2})/);
      const release_date = dateMatch
        ? `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`
        : null;

      const image_url =
        $el.find("img").attr("src") || $el.find("img").attr("data-src") || null;

      const linkHref = $el.find("a").attr("href") || "";
      const bandai_url = linkHref.startsWith("http")
        ? linkHref
        : `https://bandai-hobby.net${linkHref}`;

      // Detect grade from name
      const grade = detectGrade(name);

      products.push({
        name,
        grade,
        price,
        release_date,
        image_url,
        bandai_url,
      });
    });
  } catch (error) {
    console.error("Bandai scraping error:", error);
  }

  return products;
}

function detectGrade(name: string): string | null {
  const upper = name.toUpperCase();
  if (upper.includes("PG ") || upper.includes("PG　")) return "PG";
  if (upper.includes("MGEX")) return "MGEX";
  if (upper.includes("MG ") || upper.includes("MG　")) return "MG";
  if (upper.includes("RG ") || upper.includes("RG　")) return "RG";
  if (upper.includes("HG ") || upper.includes("HG　") || upper.includes("HGUC")) return "HG";
  if (upper.includes("SD ") || upper.includes("SD　")) return "SD";
  if (upper.includes("RE/100")) return "RE/100";
  return null;
}
