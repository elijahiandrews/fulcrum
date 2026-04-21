import { ExplainabilityBreakdown, FieldProvenanceMap, SymbolFeatureInput } from "./types";

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

const liquidityMultiplier: Record<SymbolFeatureInput["liquidityTightness"], number> = {
  loose: 0.9,
  moderate: 1,
  tight: 1.15
};

const catalystMultiplier: Record<SymbolFeatureInput["catalystStatus"], number> = {
  none: 0.9,
  watch: 1,
  active: 1.2
};

const provenancePenalty = (provenance?: FieldProvenanceMap): number => {
  if (!provenance) return 0;
  const fields = Object.values(provenance);
  return fields.reduce((sum, value) => sum + (value === "fallback" ? 2.2 : value === "proxy" ? 0.8 : 0), 0);
};

export function computeFulcrumScore(input: SymbolFeatureInput, provenance?: FieldProvenanceMap): {
  squeezeScore: number;
  confidence: number;
  explainabilityBreakdown: ExplainabilityBreakdown;
} {
  const shortFloatPressure = clamp(input.shortInterestPctFloat * 2.15);
  const borrowStressPressure = clamp(input.borrowFeePct * 2.05);
  const floatTightnessBoost = clamp((280 - input.floatSharesM) * 0.045, 0, 16);
  const shortPressure = clamp(shortFloatPressure * 0.52 + borrowStressPressure * 0.38 + floatTightnessBoost);

  const optionsRatioPressure = clamp((input.optionsVolumeRatio - 1) * 30);
  const optionsSkewPressure = clamp((input.callPutSkew - 0.85) * 55);
  const optionsPressure = clamp(optionsRatioPressure * 0.62 + optionsSkewPressure * 0.38);

  const volumePressure = clamp((input.relativeVolume - 1) * 34 + Math.max(0, input.optionsVolumeRatio - 2) * 5);
  const catalystPressure = clamp(input.catalystStatus === "active" ? 90 : input.catalystStatus === "watch" ? 58 : 20);
  const liquidityPressure = clamp(
    (input.liquidityTightness === "tight" ? 84 : input.liquidityTightness === "moderate" ? 54 : 30) +
      Math.max(0, 26 - input.floatSharesM * 0.08)
  );

  const explainabilityBreakdown: ExplainabilityBreakdown = {
    shortPressure,
    optionsPressure,
    volumePressure,
    catalystPressure,
    liquidityPressure
  };

  const weighted =
    shortPressure * 0.28 +
    volumePressure * 0.18 +
    optionsPressure * 0.23 +
    catalystPressure * 0.16 +
    liquidityPressure * 0.15;

  const squeezeScore = clamp(weighted * liquidityMultiplier[input.liquidityTightness] * catalystMultiplier[input.catalystStatus]);

  const freshnessPenalty =
    input.sourceFreshnessMinutes <= 5 ? 0 : input.sourceFreshnessMinutes <= 15 ? 4 : input.sourceFreshnessMinutes <= 40 ? 9 : 15;

  const confidence = clamp(
    90 -
      freshnessPenalty -
      (input.catalystStatus === "none" ? 5 : 0) -
      (input.relativeVolume < 1.5 ? 4 : 0) +
      (input.liquidityTightness === "tight" ? 3 : 0) +
      (input.optionsVolumeRatio >= 2.4 ? 2 : 0) -
      provenancePenalty(provenance)
  );

  return { squeezeScore, confidence, explainabilityBreakdown };
}
