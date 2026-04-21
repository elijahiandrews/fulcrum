import { NextResponse } from "next/server";

import { getLiveStatusForScenario, getRecentCatalystChangeEvents, getRecentScoreChangeEvents } from "../../../../lib/db";
import { parseLiveStatusScenario } from "../../../../lib/api/live-status";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? undefined;
  const scenario = parseLiveStatusScenario(request);
  const limit = Number(searchParams.get("limit") ?? "10");
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;

  const [scoreChanges, catalystChanges, liveStatus] = await Promise.all([
    getRecentScoreChangeEvents(symbol, normalizedLimit),
    getRecentCatalystChangeEvents(symbol, normalizedLimit),
    getLiveStatusForScenario(scenario)
  ]);

  return NextResponse.json({
    data: { scoreChanges, catalystChanges },
    count: scoreChanges.length + catalystChanges.length,
    liveStatus
  });
}
