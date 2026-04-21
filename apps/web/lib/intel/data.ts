import { getLiveIntelSnapshot } from "./live";
import { getAlertMemory } from "./history";
import { FulcrumAlert, SymbolIntel } from "./types";

const dominantDrivers = (intel: SymbolIntel): string[] => {
  const entries: Array<[string, number]> = [
    ["short pressure", intel.explainabilityBreakdown.shortPressure],
    ["options pressure", intel.explainabilityBreakdown.optionsPressure],
    ["volume pressure", intel.explainabilityBreakdown.volumePressure],
    ["catalyst pressure", intel.explainabilityBreakdown.catalystPressure],
    ["liquidity pressure", intel.explainabilityBreakdown.liquidityPressure]
  ];

  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([label]) => label);
};

const bandFromScore = (score: number): "critical" | "high" | "elevated" | "low" =>
  score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "elevated" : "low";

const developmentStage = (intel: SymbolIntel): "emerging" | "building" | "active squeeze risk" | "cooling" => {
  const shortOptionsPressure =
    (intel.explainabilityBreakdown.shortPressure + intel.explainabilityBreakdown.optionsPressure) / 2;
  if (intel.squeezeScore >= 80 && shortOptionsPressure >= 70) return "active squeeze risk";
  if (intel.squeezeScore >= 62 || (shortOptionsPressure >= 60 && intel.relativeVolume >= 2.2)) return "building";
  if (intel.squeezeScore >= 45 || intel.relativeVolume >= 1.8 || intel.catalystStatus !== "none") return "emerging";
  return "cooling";
};

const explainIntel = (intel: SymbolIntel): string => {
  const [firstDriver, secondDriver] = dominantDrivers(intel);
  const band = bandFromScore(intel.squeezeScore);
  const freshnessText =
    intel.sourceFreshnessMinutes <= 5
      ? "source stack refreshed within 5 minutes"
      : `source stack is ${intel.sourceFreshnessMinutes} minutes old`;
  const proxyCount = Object.values(intel.signalProvenance).filter((value) => value === "proxy").length;
  const fallbackCount = Object.values(intel.signalProvenance).filter((value) => value === "fallback").length;
  const signalQuality =
    fallbackCount > 0
      ? "fallback-heavy"
      : proxyCount >= 4
        ? "proxy-derived"
        : proxyCount > 0
          ? "mixed-source"
          : "live-backed";

  const stage = developmentStage(intel);
  return `${intel.symbol} sits in the ${band} squeeze-risk band at ${intel.squeezeScore.toFixed(1)} with ${intel.confidence.toFixed(
    0
  )}% confidence and is currently ${stage}, led by ${firstDriver} and ${secondDriver}. Signal quality is ${signalQuality}; ${intel.catalystSummary} Current ${freshnessText}.`;
};

export const getSymbolIntelDataset = async (): Promise<SymbolIntel[]> => {
  const snapshot = await getLiveIntelSnapshot();
  return snapshot.symbols
    .map((row) => ({
      ...row,
      explanation: explainIntel(row)
    }))
    .sort((a, b) => b.squeezeScore - a.squeezeScore);
};

export const getGeneratedAlerts = async (): Promise<FulcrumAlert[]> => {
  await getSymbolIntelDataset();
  return getAlertMemory(200).map(
    (record): FulcrumAlert => ({
      id: record.id,
      timestamp: record.updatedAt,
      symbol: record.symbol,
      companyName: record.companyName,
      alertType: record.alertType,
      severity: record.severity,
      confidence: record.confidence,
      explanation: record.explanation,
      status: record.status
    })
  );
};
