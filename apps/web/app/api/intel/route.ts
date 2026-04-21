import { NextResponse } from "next/server";
import { getLatestScores } from "../../../lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? undefined;
  const rows = await getLatestScores(region ?? undefined);
  return NextResponse.json({ data: rows, count: rows.length });
}
