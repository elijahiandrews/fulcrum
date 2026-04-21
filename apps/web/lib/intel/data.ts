import { getLiveIntelSnapshot } from "./live";
import { seededSymbols } from "./seed";
import { FulcrumAlert, SymbolIntel } from "./types";

const severityFromScore = (score: number): FulcrumAlert["severity"] =>
  score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "elevated" : "low";

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

const explainIntel = (intel: SymbolIntel): string => {
  const [firstDriver, secondDriver] = dominantDrivers(intel);
  const band = bandFromScore(intel.squeezeScore);
  const freshnessText =
    intel.sourceFreshnessMinutes <= 5
      ? "source stack refreshed within 5 minutes"
      : `source stack is ${intel.sourceFreshnessMinutes} minutes old`;

  return `${intel.symbol} sits in the ${band} squeeze-risk band at ${intel.squeezeScore.toFixed(1)} with ${intel.confidence.toFixed(
    0
  )}% confidence, led by ${firstDriver} and ${secondDriver}. ${intel.catalystSummary} Current ${freshnessText}.`;
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

const makeAlert = (
  symbol: SymbolIntel,
  type: FulcrumAlert["alertType"],
  explanation: string,
  status: FulcrumAlert["status"] = "active"
): FulcrumAlert => ({
  id: `${symbol.symbol.toLowerCase()}-${type.replace(/\s+/g, "-")}`,
  timestamp: symbol.updatedAt,
  symbol: symbol.symbol,
  companyName: symbol.companyName,
  alertType: type,
  severity: severityFromScore(symbol.squeezeScore),
  confidence: Math.round(symbol.confidence),
  explanation,
  status
});

export const getGeneratedAlerts = async (): Promise<FulcrumAlert[]> => {
  const intelRows = await getSymbolIntelDataset();
  const alerts: FulcrumAlert[] = [];

  for (const intel of intelRows) {
    const seedMeta = seededSymbols.find((x) => x.symbol === intel.symbol);
    if (!seedMeta) continue;

    if (intel.squeezeScore >= 80 && seedMeta.previousScore < 80) {
      alerts.push(
        makeAlert(
          intel,
          "score threshold crossed",
          `${intel.symbol} moved from ${seedMeta.previousScore.toFixed(1)} to ${intel.squeezeScore.toFixed(1)}, crossing the Fulcrum risk trigger.`
        )
      );
    }
    if (intel.relativeVolume >= 4) {
      alerts.push(
        makeAlert(
          intel,
          "abnormal volume spike",
          `${intel.symbol} is printing ${intel.relativeVolume.toFixed(1)}x normal turnover with ${intel.move1D.toFixed(1)}% one-day move.`
        )
      );
    }
    if (intel.optionsVolumeRatio >= 2.8 || intel.callPutSkew >= 1.35) {
      alerts.push(
        makeAlert(
          intel,
          "options acceleration",
          `${intel.symbol} options flow accelerated to ${intel.optionsVolumeRatio.toFixed(1)}x with call/put skew at ${intel.callPutSkew.toFixed(2)}.`
        )
      );
    }
    if (intel.catalystStatus === "active") {
      alerts.push(makeAlert(intel, "catalyst detected", intel.catalystSummary));
    }
    if (intel.confidence - seedMeta.previousConfidence >= 6) {
      alerts.push(
        makeAlert(
          intel,
          "confidence upgrade",
          `${intel.symbol} confidence upgraded from ${seedMeta.previousConfidence}% to ${Math.round(intel.confidence)}% as data alignment improved.`
        )
      );
    } else if (seedMeta.previousConfidence - intel.confidence >= 6) {
      alerts.push(
        makeAlert(
          intel,
          "confidence downgrade",
          `${intel.symbol} confidence slipped from ${seedMeta.previousConfidence}% to ${Math.round(intel.confidence)}% due to weaker signal alignment.`,
          "downgraded"
        )
      );
    }
  }

  return alerts.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
};
