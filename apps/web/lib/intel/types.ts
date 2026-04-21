export type CatalystStatus = "none" | "watch" | "active";
export type LiquidityTightness = "loose" | "moderate" | "tight";

export interface ExplainabilityBreakdown {
  shortPressure: number;
  optionsPressure: number;
  volumePressure: number;
  catalystPressure: number;
  liquidityPressure: number;
}

export interface SymbolIntel {
  symbol: string;
  companyName: string;
  region: "US" | "Europe" | "Asia";
  exchange: string;
  price: number;
  move1D: number;
  volume: number;
  relativeVolume: number;
  shortInterestPctFloat: number;
  borrowFeePct: number;
  optionsVolumeRatio: number;
  callPutSkew: number;
  floatSharesM: number;
  catalystStatus: CatalystStatus;
  catalystSummary: string;
  liquidityTightness: LiquidityTightness;
  squeezeScore: number;
  confidence: number;
  explainabilityBreakdown: ExplainabilityBreakdown;
  explanation: string;
  sourceFreshnessMinutes: number;
  updatedAt: string;
  dataOrigin: "live" | "hybrid-fallback" | "seed";
  liveFieldCoverage: string[];
  signalProvenance: FieldProvenanceMap;
}

export interface LiveFieldCoverageSummary {
  liveBacked: string[];
  proxyDerived: string[];
  fallbackDerived: string[];
  unavailable: string[];
}

export interface LiveStatus {
  overallMode: "live" | "partial" | "fallback";
  fmpStatus: "ok" | "degraded" | "missing_key" | "error";
  finnhubStatus: "ok" | "degraded" | "missing_key" | "error";
  cacheStatus: "fresh" | "stale";
  generatedAt: string;
  liveFieldCoverage: LiveFieldCoverageSummary;
  note?: string;
}

export interface SymbolFeatureInput {
  shortInterestPctFloat: number;
  borrowFeePct: number;
  relativeVolume: number;
  optionsVolumeRatio: number;
  callPutSkew: number;
  catalystStatus: CatalystStatus;
  liquidityTightness: LiquidityTightness;
  floatSharesM: number;
  sourceFreshnessMinutes: number;
}

export type SignalProvenance = "live" | "proxy" | "fallback";

export interface FieldProvenanceMap {
  shortInterestPctFloat: SignalProvenance;
  borrowFeePct: SignalProvenance;
  optionsVolumeRatio: SignalProvenance;
  callPutSkew: SignalProvenance;
  floatSharesM: SignalProvenance;
  liquidityTightness: SignalProvenance;
}

export interface SeedSymbolInput {
  symbol: string;
  companyName: string;
  region: "US" | "Europe" | "Asia";
  exchange: string;
  price: number;
  move1D: number;
  volume: number;
  catalystSummary: string;
  updatedAt: string;
  previousScore: number;
  previousConfidence: number;
  features: SymbolFeatureInput;
}

export type UniversePriorityTier = "core" | "watch" | "experimental";

export interface TrackedSymbolEntry {
  symbol: string;
  companyName: string;
  region: "US" | "Europe" | "Asia";
  exchange: string;
  sector?: string;
  priorityTier: UniversePriorityTier;
  active: boolean;
  monitoringRationale: string;
  tags?: string[];
  seedDefaults?: SeedSymbolInput;
}

export interface TrackedUniverseSummary {
  totalTrackedSymbols: number;
  activeTrackedSymbols: number;
  regionBreakdown: Record<TrackedSymbolEntry["region"], number>;
  priorityBreakdown: Record<UniversePriorityTier, number>;
  sectorBreakdown?: Record<string, number>;
}

export interface FulcrumAlert {
  id: string;
  timestamp: string;
  symbol: string;
  companyName: string;
  alertType:
    | "score threshold crossed"
    | "abnormal volume spike"
    | "options acceleration"
    | "catalyst detected"
    | "confidence upgrade"
    | "confidence downgrade";
  severity: "critical" | "high" | "elevated" | "low";
  confidence: number;
  explanation: string;
  status: "active" | "resolved" | "downgraded";
}

export interface SymbolSnapshot {
  symbol: string;
  capturedAt: string;
  squeezeScore: number;
  confidence: number;
  price: number;
  move1D: number;
  volume: number;
  relativeVolume: number;
  catalystStatus: CatalystStatus;
  catalystSummary: string;
  explainabilityBreakdown: ExplainabilityBreakdown;
  sourceFreshnessMinutes: number;
  dataOrigin: SymbolIntel["dataOrigin"];
}

export type SnapshotChangeType =
  | "score-increase"
  | "score-decrease"
  | "confidence-change"
  | "catalyst-change"
  | "relative-volume-spike"
  | "driver-shift";

export interface SnapshotChangeEvent {
  symbol: string;
  type: SnapshotChangeType;
  message: string;
  previousValue?: string;
  currentValue?: string;
  magnitude?: number;
  capturedAt: string;
}

export interface AlertMemoryRecord {
  id: string;
  symbol: string;
  companyName: string;
  alertType: FulcrumAlert["alertType"];
  severity: FulcrumAlert["severity"];
  confidence: number;
  explanation: string;
  status: "active" | "resolved" | "downgraded";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
