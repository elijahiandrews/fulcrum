/** Risk band for UI styling — derived only from Fulcrum squeeze score (0–100). */
export type SqueezeRiskBand = "low" | "elevated" | "high" | "critical";

export function riskBandFromScore(score: number): SqueezeRiskBand {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  if (score >= 50) return "elevated";
  return "low";
}
