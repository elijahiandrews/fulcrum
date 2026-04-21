export type RegionCode = "US" | "UK" | "EU";

export interface SourceMeta {
  sourceKey: string;
  sourceType: "market" | "positioning" | "catalyst" | "options";
  observedAt: string;
  ingestedAt: string;
  freshnessSeconds: number;
  provenance: string;
}

export interface MarketSnapshot {
  securityId: string;
  observedAt: string;
  lastPrice: number;
  intradayChangePct: number;
  volume: number;
  volumeVsAvg: number;
  sharesFloat: number;
  venue: string;
  source: SourceMeta;
}

export interface PositioningSnapshot {
  securityId: string;
  observedAt: string;
  shortInterestPctFloat: number;
  borrowFeeBps: number;
  utilizationPct: number;
  daysToCover: number;
  isEstimated: boolean;
  source: SourceMeta;
}

export interface OptionsSnapshot {
  securityId: string;
  observedAt: string;
  callPutVolumeRatio: number;
  nearTermIvPct: number;
  gammaExposureScore: number;
  source: SourceMeta;
}

export interface CatalystEvent {
  securityId: string;
  occurredAt: string;
  category: "filing" | "news" | "earnings" | "regulatory";
  title: string;
  impactScore: number;
  source: SourceMeta;
}

export interface SubScores {
  marketPressure: number;
  positioningStress: number;
  optionsAccel: number;
  catalystHeat: number;
}

export interface ExplainableScore {
  securityId: string;
  computedAt: string;
  region: RegionCode;
  totalScore: number;
  confidence: number;
  riskBand: "low" | "elevated" | "high" | "critical";
  subscores: SubScores;
  explanation: string[];
  sourceFreshness: SourceMeta[];
}
