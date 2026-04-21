import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { getCoverageSummary, getLatestScores, getLiveStatusForScenario } from "../../../lib/db";
import { enforceApiRateLimit, requireApiAccess } from "../../../lib/api/guard";
import { parseLiveStatusScenario } from "../../../lib/api/live-status";

export async function GET(request: NextRequest) {
  const denied = requireApiAccess(request) ?? enforceApiRateLimit(request);
  if (denied) return denied;
  const scenario = parseLiveStatusScenario(request);
  const rows = await getLatestScores();
  const coverage = await getCoverageSummary();
  const liveStatus = await getLiveStatusForScenario(scenario);
  return NextResponse.json({ data: rows, count: rows.length, coverage, liveStatus });
}
