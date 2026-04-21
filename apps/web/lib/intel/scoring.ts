import { ExplainabilityBreakdown, FieldProvenanceMap, SymbolFeatureInput } from "./types";
import { riskBandFromScore } from "./riskBand";

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

/** Narrative lines tied to raw features and the computed breakdown (GSI explainability contract). */
export function buildFulcrumExplanation(params: {
  symbol: string;
  features: SymbolFeatureInput;
  breakdown: ExplainabilityBreakdown;
  squeezeScore: number;
  confidence: number;
  catalystSummary: string;
  sourceFreshnessMinutes: number;
}): string[] {
  const { symbol, features, breakdown, squeezeScore, confidence, catalystSummary, sourceFreshnessMinutes } = params;
  const band = riskBandFromScore(squeezeScore);
  const ranked = (
    [
      ["Short positioning", breakdown.shortPressure],
      ["Options surface", breakdown.optionsPressure],
      ["Volume regime", breakdown.volumePressure],
      ["Catalyst stack", breakdown.catalystPressure],
      ["Liquidity / float", breakdown.liquidityPressure]
    ] as [string, number][]
  ).slice()
    .sort((a, b) => b[1] - a[1]);

  const freshness =
    sourceFreshnessMinutes <= 5
      ? "Tape and positioning inputs refreshed within 5 minutes."
      : `Oldest primary input in the stack is ~${sourceFreshnessMinutes} minutes stale.`;

  return [
    `${symbol} — ${band} band at squeeze score ${squeezeScore.toFixed(1)} (${confidence.toFixed(0)}% confidence). Top drivers: ${ranked[0][0].toLowerCase()} (${ranked[0][1].toFixed(
      1
    )}), then ${ranked[1][0].toLowerCase()} (${ranked[1][1].toFixed(1)}).`,
    `Positioning: disclosed short interest ~${features.shortInterestPctFloat.toFixed(1)}% of float with borrow fee ~${features.borrowFeePct.toFixed(
      1
    )}%; float context ~${features.floatSharesM.toFixed(0)}M shares.`,
    `Derivatives & tape: options volume ~${features.optionsVolumeRatio.toFixed(2)}x vs 30-day ADV, call/put skew ${features.callPutSkew.toFixed(
      2
    )}; session volume running ~${features.relativeVolume.toFixed(2)}x vs baseline.`,
    `Catalyst lens: ${catalystSummary}`,
    freshness
  ];
}
