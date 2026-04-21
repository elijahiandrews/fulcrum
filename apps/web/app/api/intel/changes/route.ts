import { NextResponse } from "next/server";

import { getRecentCatalystChangeEvents, getRecentScoreChangeEvents } from "../../../../lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "10");
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;

  const [scoreChanges, catalystChanges] = await Promise.all([
    getRecentScoreChangeEvents(symbol, normalizedLimit),
    getRecentCatalystChangeEvents(symbol, normalizedLimit)
  ]);

  return NextResponse.json({
    data: {
      scoreChanges,
      catalystChanges
    }
  });
}
