import {
  CatalystEvent,
  ExplainableScore,
  MarketSnapshot,
  OptionsSnapshot,
  PositioningSnapshot,
  RegionCode,
  SourceMeta,
  SubScores
} from "./types";

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

const avgFreshnessPenalty = (sources: SourceMeta[]): number => {
  if (!sources.length) return 40;
  const avg = sources.reduce((sum, s) => sum + s.freshnessSeconds, 0) / sources.length;
  if (avg <= 900) return 0;
  if (avg <= 3600) return 5;
  if (avg <= 21600) return 12;
  return 22;
};

export function computeSubscores(
  market: MarketSnapshot,
  positioning: PositioningSnapshot,
  options: OptionsSnapshot,
  catalysts: CatalystEvent[]
): SubScores {
  const marketPressure = clamp(market.volumeVsAvg * 14 + Math.max(0, market.intradayChangePct) * 8);
  const positioningStress = clamp(
    positioning.shortInterestPctFloat * 1.9 +
      positioning.borrowFeeBps / 9 +
      positioning.utilizationPct * 0.25 +
      positioning.daysToCover * 8
  );
  const optionsAccel = clamp(
    options.callPutVolumeRatio * 24 + options.gammaExposureScore * 0.5 + options.nearTermIvPct * 0.6
  );
  const catalystHeat = clamp(
    catalysts.reduce((sum, c) => sum + c.impactScore, 0) * 18 + Math.min(catalysts.length, 3) * 8
  );

  return { marketPressure, positioningStress, optionsAccel, catalystHeat };
}

export function computeExplainableScore(args: {
  securityId: string;
  region: RegionCode;
  market: MarketSnapshot;
  positioning: PositioningSnapshot;
  options: OptionsSnapshot;
  catalysts: CatalystEvent[];
}): ExplainableScore {
  const subscores = computeSubscores(args.market, args.positioning, args.options, args.catalysts);
  const sources = [args.market.source, args.positioning.source, args.options.source, ...args.catalysts.map((c) => c.source)];
  const weighted =
    subscores.marketPressure * 0.3 +
    subscores.positioningStress * 0.35 +
    subscores.optionsAccel * 0.2 +
    subscores.catalystHeat * 0.15;
  const freshnessPenalty = avgFreshnessPenalty(sources);
  const totalScore = clamp(weighted - freshnessPenalty);
  const confidence = clamp(100 - freshnessPenalty * 2.5);

  const riskBand =
    totalScore >= 85 ? "critical" : totalScore >= 70 ? "high" : totalScore >= 50 ? "elevated" : "low";

  const explanation = [
    `Positioning stress ${subscores.positioningStress.toFixed(1)} drives primary squeeze pressure.`,
    `Market pressure ${subscores.marketPressure.toFixed(1)} reflects demand and momentum acceleration.`,
    `Options acceleration ${subscores.optionsAccel.toFixed(1)} captures call skew and gamma sensitivity.`,
    `Catalyst heat ${subscores.catalystHeat.toFixed(1)} includes filings and news shocks.`,
    `Freshness penalty ${freshnessPenalty.toFixed(1)} applied from multi-source lag profile.`
  ];

  return {
    securityId: args.securityId,
    computedAt: new Date().toISOString(),
    region: args.region,
    totalScore,
    confidence,
    riskBand,
    subscores,
    explanation,
    sourceFreshness: sources
  };
}
