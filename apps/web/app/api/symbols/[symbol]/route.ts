import { NextResponse } from "next/server";

import { getScoreById } from "../../../../lib/db";

export async function GET(_request: Request, context: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await context.params;
  const row = await getScoreById(symbol);
  if (!row) {
    return NextResponse.json({ error: "Symbol not found." }, { status: 404 });
  }
  return NextResponse.json({ data: row });
}
