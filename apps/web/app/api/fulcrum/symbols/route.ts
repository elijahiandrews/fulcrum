import { NextRequest, NextResponse } from "next/server";

import { getCoverageSummary, getLatestScores, getLiveStatusForScenario } from "../../../../lib/db";
import { enforceApiRateLimit, requireApiAccess } from "../../../../lib/api/guard";
import { parseLiveStatusScenario } from "../../../../lib/api/live-status";

/** Normalized Fulcrum symbol list — same payload shape as `/api/intel` but namespaced for product integration. */
export async function GET(request: NextRequest) {
  const denied = requireApiAccess(request) ?? enforceApiRateLimit(request);
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? undefined;
  const scenario = parseLiveStatusScenario(request);
  const symbols = await getLatestScores(region ?? undefined);
  const coverage = await getCoverageSummary();
  const liveStatus = await getLiveStatusForScenario(scenario);
  return NextResponse.json({ symbols, count: symbols.length, coverage, liveStatus });
}
