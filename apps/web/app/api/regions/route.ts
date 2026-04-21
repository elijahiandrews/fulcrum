import { NextResponse } from "next/server";

import { getRegionalMonitorRows } from "../../../lib/db";

export async function GET() {
  const rows = await getRegionalMonitorRows();
  return NextResponse.json({ data: rows, count: rows.length });
}
