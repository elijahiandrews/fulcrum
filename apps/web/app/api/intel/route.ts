import { NextResponse } from "next/server";
import { getCoverageSummary, getLatestScores, getLiveStatusForScenario } from "../../../lib/db";
import { parseLiveStatusScenario } from "../../../lib/api/live-status";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? undefined;
  const scenario = parseLiveStatusScenario(request);
  const rows = await getLatestScores(region ?? undefined);
  const coverage = await getCoverageSummary();
  const liveStatus = await getLiveStatusForScenario(scenario);
  return NextResponse.json({ data: rows, count: rows.length, coverage, liveStatus });
}
