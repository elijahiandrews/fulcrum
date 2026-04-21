import { NextResponse } from "next/server";

import { getLiveStatusForScenario, getScoreById, getSymbolHistoryBundle } from "../../../../lib/db";
import { parseLiveStatusScenario } from "../../../../lib/api/live-status";

export async function GET(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  const scenario = parseLiveStatusScenario(_request);
  const { symbol } = await context.params;
  const row = await getScoreById(symbol);
  if (!row) {
    return NextResponse.json({ data: null, error: "Symbol not found." }, { status: 404 });
  }
  const history = await getSymbolHistoryBundle(row.symbol, 10);
  const liveStatus = await getLiveStatusForScenario(scenario);
  return NextResponse.json({ data: row, history, liveStatus });
}
