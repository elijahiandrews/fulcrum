import { FieldProvenanceMap, SeedSymbolInput, SymbolFeatureInput } from "./types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export interface EnrichedSignalFeatures {
  features: SymbolFeatureInput;
  provenance: FieldProvenanceMap;
  confidencePenalty: number;
}

export interface EnrichmentContext {
  relativeVolume: number;
  move1D: number;
  price: number;
  volume: number;
  catalystStatus: SeedSymbolInput["features"]["catalystStatus"];
}

// These fields are currently not directly provider-backed in V1; derive operational proxies from live market-state context.
export function enrichSqueezeSignals(seed: SeedSymbolInput, context: EnrichmentContext): EnrichedSignalFeatures {
  const base = seed.features;
  const relVol = clamp(context.relativeVolume, 0.8, 8);
  const absMove = Math.abs(context.move1D);
  const catalystLift = context.catalystStatus === "active" ? 1.12 : context.catalystStatus === "watch" ? 1.04 : 0.98;

  const floatProxy = clamp(base.floatSharesM * (1 - Math.min(0.22, (relVol - 1) * 0.05)), 45, 2200);
  const optionsRatioProxy = clamp(base.optionsVolumeRatio * (0.86 + relVol * 0.14 + absMove * 0.02) * catalystLift, 0.8, 5.8);
  const callPutSkewProxy = clamp(base.callPutSkew + Math.max(-0.16, Math.min(0.28, context.move1D * 0.015)) + (optionsRatioProxy - base.optionsVolumeRatio) * 0.05, 0.75, 1.8);
  const shortInterestProxy = clamp(base.shortInterestPctFloat * (0.94 + relVol * 0.045 + absMove * 0.01), 1.5, 45);
  const borrowFeeProxy = clamp(base.borrowFeePct * (0.9 + shortInterestProxy / 70 + relVol * 0.07), 0.4, 35);
  const liquidityProxy: SymbolFeatureInput["liquidityTightness"] =
    relVol >= 3.4 || (absMove >= 8 && context.volume > 7_500_000)
      ? "tight"
      : relVol >= 2 || absMove >= 4
        ? "moderate"
        : "loose";

  const features: SymbolFeatureInput = {
    ...base,
    shortInterestPctFloat: Number(shortInterestProxy.toFixed(2)),
    borrowFeePct: Number(borrowFeeProxy.toFixed(2)),
    optionsVolumeRatio: Number(optionsRatioProxy.toFixed(2)),
    callPutSkew: Number(callPutSkewProxy.toFixed(2)),
    floatSharesM: Number(floatProxy.toFixed(1)),
    liquidityTightness: liquidityProxy,
    relativeVolume: Number(relVol.toFixed(2)),
    catalystStatus: context.catalystStatus
  };

  const provenance: FieldProvenanceMap = {
    shortInterestPctFloat: "proxy",
    borrowFeePct: "proxy",
    optionsVolumeRatio: "proxy",
    callPutSkew: "proxy",
    floatSharesM: "proxy",
    liquidityTightness: "proxy"
  };

  // Confidence hit is smaller than full fallback, but reflects proxy-derived signal uncertainty.
  return { features, provenance, confidencePenalty: 7 };
}
