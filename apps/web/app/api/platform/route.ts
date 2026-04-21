import { NextResponse } from "next/server";

import { getLatestScores } from "../../../lib/db";

export async function GET() {
  const rows = await getLatestScores();
  return NextResponse.json({ data: rows, count: rows.length });
}
