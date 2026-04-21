import { NextRequest, NextResponse } from "next/server";

import { getLiveStatusForScenario, getScoreById, getSymbolHistoryBundle } from "../../../../../lib/db";
import { enforceApiRateLimit, requireApiAccess } from "../../../../../lib/api/guard";
import { parseLiveStatusScenario } from "../../../../../lib/api/live-status";

export async function GET(request: NextRequest, context: { params: Promise<{ symbol: string }> }) {
  const denied = requireApiAccess(request) ?? enforceApiRateLimit(request);
  if (denied) return denied;
  const scenario = parseLiveStatusScenario(request);
  const { symbol } = await context.params;
  const row = await getScoreById(symbol);
  if (!row) {
    return NextResponse.json({ symbol: null, error: "Symbol not found." }, { status: 404 });
  }
  const history = await getSymbolHistoryBundle(row.symbol, 10);
  const liveStatus = await getLiveStatusForScenario(scenario);
  return NextResponse.json({ symbol: row, history, liveStatus });
}
