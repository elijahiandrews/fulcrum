import { getGeneratedAlerts, getSymbolIntelDataset } from "./intel/data";
import { SymbolIntel } from "./intel/types";

export type ScoreRow = SymbolIntel;
export type AlertRow = Awaited<ReturnType<typeof getAlerts>>[number];

export interface RegionMonitorRow {
  region: "US" | "Europe" | "Asia";
  activeSignalsCount: number;
  averageSqueezeScore: number;
  highestRiskSymbols: Array<{ symbol: string; score: number; confidence: number }>;
  catalystActivitySummary: string;
  unusualPressureNote: string;
}

const regionPressureNotes: Record<RegionMonitorRow["region"], string> = {
  US: "US flow shows repeated options-led convexity spikes in tighter-float names.",
  Europe: "European names are showing selective post-news pressure with thinner midday liquidity.",
  Asia: "Asia session pressure is concentrated around gamma-sensitive strikes and macro catalysts."
};

const catalystSummaryForRegion = (rows: SymbolIntel[]): string => {
  const active = rows.filter((r) => r.catalystStatus === "active").length;
  const watch = rows.filter((r) => r.catalystStatus === "watch").length;
  return `${active} active catalyst signals, ${watch} watchlist catalyst signals.`;
};

const toRegionRow = (region: RegionMonitorRow["region"], rows: SymbolIntel[]): RegionMonitorRow => ({
  region,
  activeSignalsCount: rows.filter((r) => r.squeezeScore >= 60).length,
  averageSqueezeScore: rows.length > 0 ? rows.reduce((sum, row) => sum + row.squeezeScore, 0) / rows.length : 0,
  highestRiskSymbols: [...rows]
    .sort((a, b) => b.squeezeScore - a.squeezeScore)
    .slice(0, 3)
    .map((x) => ({ symbol: x.symbol, score: x.squeezeScore, confidence: x.confidence })),
  catalystActivitySummary: catalystSummaryForRegion(rows),
  unusualPressureNote: regionPressureNotes[region]
});

export async function getLatestScores(region?: string): Promise<ScoreRow[]> {
  const rows = await getSymbolIntelDataset();
  if (!region) return rows;
  return rows.filter((row) => row.region === region);
}

export async function getSymbolsByRegion(region: SymbolIntel["region"]): Promise<ScoreRow[]> {
  return getLatestScores(region);
}

export async function getTopRankedSymbols(limit = 5): Promise<ScoreRow[]> {
  const rows = await getSymbolIntelDataset();
  return rows.slice(0, Math.max(1, limit));
}

export async function getScoreById(id: string): Promise<ScoreRow | undefined> {
  const rows = await getSymbolIntelDataset();
  return rows.find((row) => row.symbol.toLowerCase() === id.toLowerCase());
}

export async function getAlerts(): Promise<Awaited<ReturnType<typeof getGeneratedAlerts>>> {
  return await getGeneratedAlerts();
}

export async function getAlertsForSymbol(symbol: string): Promise<Awaited<ReturnType<typeof getGeneratedAlerts>>> {
  const normalized = symbol.toLowerCase();
  const alerts = await getGeneratedAlerts();
  return alerts.filter((alert) => alert.symbol.toLowerCase() === normalized);
}

export async function getRegionalMonitorRows(): Promise<RegionMonitorRow[]> {
  const rows = await getSymbolIntelDataset();
  return (["US", "Europe", "Asia"] as const).map((region) => toRegionRow(region, rows.filter((x) => x.region === region)));
}
