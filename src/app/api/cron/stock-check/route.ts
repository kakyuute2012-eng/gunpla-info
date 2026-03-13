import { NextRequest, NextResponse } from "next/server";
import { checkStockBatch } from "@/lib/scraper/stock";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * 在庫チェック専用エンドポイント
 * GET /api/cron/stock-check?secret=xxx&limit=15
 *
 * cronから呼ばれるか、手動で呼び出し可能
 * 外部cronサービスから1日複数回呼び出して全商品をカバー
 */
export async function GET(request: NextRequest) {
  // 認証: Bearer tokenまたはクエリパラメータ
  const authHeader = request.headers.get("authorization");
  const secretParam = request.nextUrl.searchParams.get("secret");

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    secretParam !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "15",
    10
  );

  try {
    const result = await checkStockBatch(55000, limit);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stock check error:", error);
    return NextResponse.json(
      { error: "Stock check failed" },
      { status: 500 }
    );
  }
}
