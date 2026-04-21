import { NextResponse } from "next/server";
import { getAlerts, getLiveStatus } from "../../../../lib/db";

export async function GET() {
  const alerts = await getAlerts();
  const liveStatus = await getLiveStatus();
  return NextResponse.json({ data: alerts, count: alerts.length, liveStatus });
}
