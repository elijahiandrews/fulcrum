import { NextResponse } from "next/server";

import { getDataToActionItems, getLiveStatusForScenario } from "../../../../lib/db";
import { parseLiveStatusScenario } from "../../../../lib/api/live-status";

export async function GET(request: Request) {
  const scenario = parseLiveStatusScenario(request);
  const limitParam = new URL(request.url).searchParams.get("limit");
  const parsed = limitParam ? Number(limitParam) : 8;
  const limit = Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), 20) : 8;

  const [data, liveStatus] = await Promise.all([getDataToActionItems(limit), getLiveStatusForScenario(scenario)]);

  return NextResponse.json({
    data,
    count: data.length,
    liveStatus,
    pipeline: "Data sources → Normalize → Score signals → Rank → Action (discarded if no action)"
  });
}
