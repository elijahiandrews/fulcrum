import { NextResponse } from "next/server";

import { getCoverageSummary, getLiveStatusForScenario, getRegionalMonitorRows } from "../../../lib/db";

export async function GET(request: Request) {
  const scenario = new URL(request.url).searchParams.get("simulate") as
    | "healthy"
    | "missing_fmp"
    | "finnhub_error"
    | "fmp_error"
    | "both_unavailable"
    | null;
  const rows = await getRegionalMonitorRows();
  const coverage = await getCoverageSummary();
  const liveStatus = await getLiveStatusForScenario(scenario ?? undefined);
  return NextResponse.json({ data: rows, count: rows.length, coverage, liveStatus });
}
