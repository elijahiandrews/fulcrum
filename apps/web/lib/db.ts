import { getGeneratedAlerts, getSymbolIntelDataset } from "./intel/data";
import { getLiveIntelSnapshot } from "./intel/live";
import {
  getAlertMemory,
  getAlertMemoryForSymbol,
  getCurrentVsPreviousSnapshot,
  getRecentChangeEvents,
  getRecentSnapshots
} from "./intel/history";
import { getTrackedUniverseSummary } from "./intel/universe";
import { AlertMemoryRecord, SnapshotChangeEvent, SymbolIntel, SymbolSnapshot } from "./intel/types";
import { LiveStatusScenario } from "./api/live-status";

export type ScoreRow = SymbolIntel;
export type AlertRow = Awaited<ReturnType<typeof getAlerts>>[number];
export interface SymbolHistoryBundle {
  snapshots: SymbolSnapshot[];
  comparison: ReturnType<typeof getCurrentVsPreviousSnapshot>;
  alertHistory: AlertMemoryRecord[];
  scoreChangeEvents: SnapshotChangeEvent[];
  catalystChangeEvents: SnapshotChangeEvent[];
}

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

export async function getAlertHistory(limit = 100): Promise<AlertMemoryRecord[]> {
  await getSymbolIntelDataset();
  return getAlertMemory(limit);
}

export async function getAlertHistoryForSymbol(symbol: string, limit = 20): Promise<AlertMemoryRecord[]> {
  await getSymbolIntelDataset();
  return getAlertMemoryForSymbol(symbol, limit);
}

export async function getRecentSymbolHistory(symbol: string, limit = 12): Promise<SymbolSnapshot[]> {
  await getSymbolIntelDataset();
  return getRecentSnapshots(symbol, limit);
}

export async function getCurrentVsPrevious(symbol: string) {
  await getSymbolIntelDataset();
  return getCurrentVsPreviousSnapshot(symbol);
}

export async function getRecentScoreChangeEvents(symbol?: string, limit = 10): Promise<SnapshotChangeEvent[]> {
  await getSymbolIntelDataset();
  return getRecentChangeEvents({ symbol, type: "score-increase", limit })
    .concat(getRecentChangeEvents({ symbol, type: "score-decrease", limit }))
    .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))
    .slice(0, limit);
}

export async function getRecentCatalystChangeEvents(symbol?: string, limit = 10): Promise<SnapshotChangeEvent[]> {
  await getSymbolIntelDataset();
  return getRecentChangeEvents({ symbol, type: "catalyst-change", limit });
}

export async function getSymbolHistoryBundle(symbol: string, limit = 12): Promise<SymbolHistoryBundle> {
  await getSymbolIntelDataset();
  return {
    snapshots: getRecentSnapshots(symbol, limit),
    comparison: getCurrentVsPreviousSnapshot(symbol),
    alertHistory: getAlertMemoryForSymbol(symbol, 12),
    scoreChangeEvents: getRecentChangeEvents({ symbol, limit, type: "score-increase" })
      .concat(getRecentChangeEvents({ symbol, limit, type: "score-decrease" }))
      .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))
      .slice(0, limit),
    catalystChangeEvents: getRecentChangeEvents({ symbol, limit, type: "catalyst-change" })
  };
}

export async function getRegionalMonitorRows(): Promise<RegionMonitorRow[]> {
  const rows = await getSymbolIntelDataset();
  return (["US", "Europe", "Asia"] as const).map((region) => toRegionRow(region, rows.filter((x) => x.region === region)));
}

export async function getCoverageSummary() {
  return getTrackedUniverseSummary();
}


export async function getLiveStatusForScenario(
  scenario?: LiveStatusScenario
) {
  const status = await getLiveStatus();
  if (!scenario) return status;
  if (scenario === "healthy") {
    return { ...status, overallMode: "live", fmpStatus: "ok", finnhubStatus: "ok", note: "Simulated healthy provider state." } as const;
  }
  if (scenario === "missing_fmp") {
    return {
      ...status,
      overallMode: "partial",
      fmpStatus: "missing_key",
      finnhubStatus: "ok",
      note: "Simulated: FMP key missing, catalyst feed remains live."
    } as const;
  }
  if (scenario === "finnhub_error") {
    return {
      ...status,
      overallMode: "partial",
      fmpStatus: "ok",
      finnhubStatus: "error",
      note: "Simulated: Finnhub request failures, market-state remains live."
    } as const;
  }
  if (scenario === "fmp_error") {
    return {
      ...status,
      overallMode: "partial",
      fmpStatus: "error",
      finnhubStatus: "ok",
      note: "Simulated: FMP request failures, catalyst enrichment remains live."
    } as const;
  }
  return {
    ...status,
    overallMode: "fallback",
    fmpStatus: "error",
    finnhubStatus: "error",
    note: "Simulated: both providers unavailable, seeded fallback active."
  } as const;
}

export async function getLiveStatus() {
  const snapshot = await getLiveIntelSnapshot();
  return snapshot.status;
}
