import { NextResponse } from "next/server";

import { getAlertHistory, getAlerts, getLiveStatusForScenario } from "../../../lib/db";

export async function GET(request: Request) {
  const scenario = new URL(request.url).searchParams.get("simulate") as
    | "healthy"
    | "missing_fmp"
    | "finnhub_error"
    | "fmp_error"
    | "both_unavailable"
    | null;
  const alerts = await getAlerts();
  const history = await getAlertHistory(120);
  const liveStatus = await getLiveStatusForScenario(scenario ?? undefined);
  return NextResponse.json({
    data: alerts,
    history,
    count: alerts.length,
    activeCount: alerts.filter((alert) => alert.status === "active").length,
    liveStatus
  });
}
