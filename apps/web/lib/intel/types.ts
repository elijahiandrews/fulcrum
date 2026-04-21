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
