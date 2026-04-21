import { NextResponse } from "next/server";

import { getLiveStatusForScenario, getScoreById, getSymbolHistoryBundle } from "../../../../lib/db";

export async function GET(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  const scenario = new URL(_request.url).searchParams.get("simulate") as
    | "healthy"
    | "missing_fmp"
    | "finnhub_error"
    | "fmp_error"
    | "both_unavailable"
    | null;
  const { symbol } = await context.params;
  const row = await getScoreById(symbol);
  if (!row) {
    return NextResponse.json({ error: "Symbol not found." }, { status: 404 });
  }
  const history = await getSymbolHistoryBundle(row.symbol, 10);
  const liveStatus = await getLiveStatusForScenario(scenario ?? undefined);
  return NextResponse.json({ data: row, history, liveStatus });
}
