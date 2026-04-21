import { ExplainabilityBreakdown, SymbolFeatureInput } from "./types";

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

export function computeFulcrumScore(input: SymbolFeatureInput): {
  squeezeScore: number;
  confidence: number;
  explainabilityBreakdown: ExplainabilityBreakdown;
} {
  const shortPressure = clamp(input.shortInterestPctFloat * 2 + input.borrowFeePct * 1.9 + (input.floatSharesM < 250 ? 6 : 0));
  const volumePressure = clamp((input.relativeVolume - 1) * 36 + Math.max(0, input.optionsVolumeRatio - 2) * 6);
  const optionsPressure = clamp(input.optionsVolumeRatio * 20 + input.callPutSkew * 22);
  const catalystPressure = clamp(input.catalystStatus === "active" ? 90 : input.catalystStatus === "watch" ? 58 : 20);
  const liquidityPressure = clamp(
    (input.liquidityTightness === "tight" ? 82 : input.liquidityTightness === "moderate" ? 52 : 28) +
      Math.max(0, 20 - input.floatSharesM * 0.7)
  );

  const explainabilityBreakdown: ExplainabilityBreakdown = {
    shortPressure,
    optionsPressure,
    volumePressure,
    catalystPressure,
    liquidityPressure
  };

  const weighted =
    shortPressure * 0.25 +
    volumePressure * 0.21 +
    optionsPressure * 0.2 +
    catalystPressure * 0.16 +
    liquidityPressure * 0.18;

  const squeezeScore = clamp(weighted * liquidityMultiplier[input.liquidityTightness] * catalystMultiplier[input.catalystStatus]);

  const freshnessPenalty =
    input.sourceFreshnessMinutes <= 5 ? 0 : input.sourceFreshnessMinutes <= 15 ? 4 : input.sourceFreshnessMinutes <= 40 ? 9 : 15;

  const confidence = clamp(
    90 -
      freshnessPenalty -
      (input.catalystStatus === "none" ? 5 : 0) -
      (input.relativeVolume < 1.5 ? 4 : 0) +
      (input.liquidityTightness === "tight" ? 3 : 0) +
      (input.optionsVolumeRatio >= 2.4 ? 2 : 0)
  );

  return { squeezeScore, confidence, explainabilityBreakdown };
}
