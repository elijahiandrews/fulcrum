import { NextResponse } from "next/server";
import { getCoverageSummary, getLatestScores, getLiveStatus } from "../../../lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? undefined;
  const rows = await getLatestScores(region ?? undefined);
  const coverage = await getCoverageSummary();
  const liveStatus = await getLiveStatus();
  return NextResponse.json({ data: rows, count: rows.length, coverage, liveStatus });
}
