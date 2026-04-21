import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { getAlertHistory, getAlerts, getLiveStatusForScenario } from "../../../lib/db";
import { enforceApiRateLimit, requireApiAccess } from "../../../lib/api/guard";
import { parseLiveStatusScenario } from "../../../lib/api/live-status";

export async function GET(request: NextRequest) {
  const denied = requireApiAccess(request) ?? enforceApiRateLimit(request);
  if (denied) return denied;
  const scenario = parseLiveStatusScenario(request);
  const alerts = await getAlerts();
  const history = await getAlertHistory(120);
  const liveStatus = await getLiveStatusForScenario(scenario);
  return NextResponse.json({
    data: alerts,
    history,
    count: alerts.length,
    activeCount: alerts.filter((alert) => alert.status === "active").length,
    liveStatus
  });
}
