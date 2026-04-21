/**
 * Data → Normalize → Score (already in SymbolIntel) → Rank → Action
 * Signals without a defensible action are discarded (not surfaced).
 */

import type { SymbolIntel } from "./types";

export interface DataToActionItem {
  symbol: string;
  companyName: string;
  region: SymbolIntel["region"];
  /** Rank order (1 = highest priority). */
  rank: number;
  signal: string;
  /** 0–100 — composite decision confidence, not raw model confidence alone. */
  confidence: number;
  action: string;
  expectedOutcome: string;
  risk: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

type Dominant = "short" | "options" | "volume" | "catalyst" | "liquidity";

const dominantDriver = (intel: SymbolIntel): Dominant => {
  const b = intel.explainabilityBreakdown;
  const entries: Array<[Dominant, number]> = [
    ["short", b.shortPressure],
    ["options", b.optionsPressure],
    ["volume", b.volumePressure],
    ["catalyst", b.catalystPressure],
    ["liquidity", b.liquidityPressure]
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
};

const driverLabel: Record<Dominant, string> = {
  short: "short positioning",
  options: "options convexity",
  volume: "relative volume / flow",
  catalyst: "catalyst-linked repricing",
  liquidity: "liquidity / depth"
};

/** Gate: only pass when confluence supports a single explicit action. */
export function isActionableIntel(intel: SymbolIntel): boolean {
  if (intel.confidence < 26) return false;
  if (intel.squeezeScore < 56) return false;

  const volHot = intel.relativeVolume >= 2.9;
  const optHot = intel.optionsVolumeRatio >= 2.4;
  const catHot = intel.catalystStatus === "active";
  const borrowHot = intel.borrowFeePct >= 8;
  const score = intel.squeezeScore;

  if (score >= 74) return true;
  if (score >= 64 && (volHot || optHot)) return true;
  if (score >= 60 && catHot && (volHot || optHot)) return true;
  if (score >= 62 && borrowHot && volHot) return true;
  return false;
}

function compositeConfidence(intel: SymbolIntel): number {
  const liveBoost = intel.dataOrigin === "live" ? 1.06 : intel.dataOrigin === "hybrid-fallback" ? 1.02 : 1;
  const freshnessPenalty = intel.sourceFreshnessMinutes > 45 ? 0.92 : intel.sourceFreshnessMinutes > 25 ? 0.96 : 1;
  const raw = intel.confidence * liveBoost * freshnessPenalty;
  return clamp(Math.round(raw), 0, 100);
}

function buildSignalLine(intel: SymbolIntel): string {
  const dom = dominantDriver(intel);
  const domText = driverLabel[dom];
  const vol = `${intel.relativeVolume.toFixed(1)}x rel. vol`;
  const move = `${intel.move1D >= 0 ? "+" : ""}${intel.move1D.toFixed(1)}% 1D`;
  const cat =
    intel.catalystStatus === "active"
      ? "active catalyst context"
      : intel.catalystStatus === "watch"
        ? "catalyst watch"
        : "no headline catalyst";
  return `Elevated squeeze pressure led by ${domText}; ${vol}, ${move}; ${cat}.`;
}

function bandFromScore(score: number): "critical" | "high" | "elevated" {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  return "elevated";
}

function buildActionLine(intel: SymbolIntel): string {
  const band = bandFromScore(intel.squeezeScore);
  const dom = dominantDriver(intel);
  if (band === "critical") {
    if (dom === "options" || dom === "volume") {
      return `Within the next 2 trading hours: plan a tactical long only on a pullback or VWAP retest; avoid chasing extension. Size to a small fraction of book; predefine exit if squeeze score prints below ${Math.max(68, Math.round(intel.squeezeScore - 12))} on the next snapshot.`;
    }
    return `Within the next session: review for a reduced-size long vs. cash; enter only if price holds structure and squeeze score does not degrade twice in a row.`;
  }
  if (band === "high") {
    return `Next 1–2 sessions: consider scaling in on weakness only; no new risk if relative volume falls below ~2.5x without score improvement.`;
  }
  return `Watchlist only: prepare orders but do not add risk until score clears 70 with confirming volume or catalyst.`;
}

function buildExpectedOutcome(intel: SymbolIntel): string {
  const band = bandFromScore(intel.squeezeScore);
  if (band === "critical") return "Potential +6–12% if squeeze regime persists 1–3 sessions; otherwise flat.";
  if (band === "high") return "Potential +4–8% on follow-through; trim into strength.";
  return "Potential +2–5% if conditions tighten; otherwise sidelined.";
}

function buildRiskLine(intel: SymbolIntel): string {
  const base =
    intel.squeezeScore >= 80
      ? "−4–8%"
      : intel.squeezeScore >= 65
        ? "−3–6%"
        : "−2–4%";
  return `${base} adverse move if squeeze score drops >8 pts, borrow/short stress eases, or catalyst resolves against positioning.`;
}

function rankScore(intel: SymbolIntel): number {
  return intel.squeezeScore * (intel.confidence / 100) * (intel.relativeVolume / 3.5 + 0.5);
}

/**
 * Normalize (intel rows are already Fulcrum-normalized), score/rank, emit actions only where gates pass.
 */
export function buildRankedActions(intelRows: SymbolIntel[], maxActions = 8): DataToActionItem[] {
  const candidates = intelRows
    .filter(isActionableIntel)
    .map((intel) => ({ intel, score: rankScore(intel) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, maxActions));

  return candidates.map(({ intel }, i) => ({
    symbol: intel.symbol,
    companyName: intel.companyName,
    region: intel.region,
    rank: i + 1,
    signal: buildSignalLine(intel),
    confidence: compositeConfidence(intel),
    action: buildActionLine(intel),
    expectedOutcome: buildExpectedOutcome(intel),
    risk: buildRiskLine(intel)
  }));
}
