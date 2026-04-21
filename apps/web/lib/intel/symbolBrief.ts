import type { SymbolIntel } from "./types";

/** Snapshot diff from `getSnapshotDiff` — duplicated shape to avoid circular imports. */
export type SnapshotDiff = {
  scoreDelta: number;
  confidenceDelta: number;
  relativeVolumeDelta: number;
  catalystChanged: boolean;
  dataOriginChanged: boolean;
} | null;

/**
 * Human-readable stage for how a squeeze setup is evolving (vs. a single “hot” score).
 */
export function opportunityStage(
  row: SymbolIntel,
  diff: SnapshotDiff
): { label: string; blurb: string } {
  const score = row.squeezeScore;
  const rv = row.relativeVolume;
  const sd = diff?.scoreDelta ?? 0;
  const cd = diff?.confidenceDelta ?? 0;
  const rvd = diff?.relativeVolumeDelta ?? 0;

  const cooling =
    sd <= -5 ||
    (score < 62 && sd < -2 && cd <= -3) ||
    (row.catalystStatus === "none" && score < 58 && sd <= 0);

  if (cooling) {
    return {
      label: "Cooling / invalidating",
      blurb: "Pressure is easing or evidence is diverging; treat prior urgency as stale unless the next snapshots confirm a re-acceleration."
    };
  }

  if (score >= 74 && rv >= 2.4) {
    return {
      label: "Active squeeze risk",
      blurb: "Score and flow are aligned at elevated levels — regime risk is live, not hypothetical."
    };
  }

  if (score >= 58 && (sd >= 2 || rvd >= 0.35 || (row.catalystStatus === "active" && score >= 62))) {
    return {
      label: "Developing setup",
      blurb: "Conditions are stacking: watch for confirmation from volume, borrow stress, or catalyst persistence."
    };
  }

  return {
    label: "Early signal",
    blurb: "Only partial confirmation so far — prioritize what would strengthen or invalidate the case on the next refresh."
  };
}

/** Short, de-duplicated bullets for what to watch next. */
export function watchNextBullets(row: SymbolIntel, diff: SnapshotDiff): string[] {
  const out: string[] = [];
  const sd = diff?.scoreDelta ?? 0;
  const cat = row.catalystStatus;

  if (cat === "active") out.push("Whether headline catalyst persists through the next tape session.");
  if (cat === "watch") out.push("Whether dormant catalyst risk wakes up into a live headline or filing.");
  if (row.relativeVolume >= 2.2) out.push("Whether relative volume holds without the score rolling over.");
  if (row.borrowFeePct >= 6) out.push("Whether borrow / locate stress tightens or mean-reverts.");
  if (row.explainabilityBreakdown.optionsPressure >= row.explainabilityBreakdown.shortPressure) {
    out.push("Whether options-led convexity keeps leading the squeeze stack.");
  } else {
    out.push("Whether short / float pressure remains the dominant channel.");
  }
  if (sd >= 3) out.push("Whether the recent score step-up is confirmed by a second snapshot.");
  if (row.sourceFreshnessMinutes > 25) out.push("Stale inputs: next refresh should improve worst-channel freshness.");

  const seen = new Set<string>();
  return out.filter((line) => {
    const k = line.slice(0, 48);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 6);
}
