import { IntelOperationsStrip } from "../../components/IntelOperationsStrip";
import { ScoreTable } from "../../components/ScoreTable";
import { getCoverageSummary, getLatestScores } from "../../lib/db";
import { riskBandFromScore } from "../../lib/intel/riskBand";

export default async function PlatformPage() {
  const rows = await getLatestScores();
  const coverage = await getCoverageSummary();
  const criticalCount = rows.filter((r) => riskBandFromScore(r.squeezeScore) === "critical").length;
  const highCount = rows.filter((r) => riskBandFromScore(r.squeezeScore) === "high").length;
  const avgConfidence = rows.reduce((sum, row) => sum + row.confidence, 0) / Math.max(rows.length, 1);
  const avgFreshness = rows.reduce((sum, row) => sum + row.sourceFreshnessMinutes, 0) / Math.max(rows.length, 1);
  const avgScore = rows.reduce((sum, row) => sum + row.squeezeScore, 0) / Math.max(rows.length, 1);
  const topSector = Object.entries(coverage.sectorBreakdown ?? {}).sort((a, b) => b[1] - a[1])[0];

  return (
    <main className="container page">
      <div className="terminal-bar">
        <div>
          <div className="terminal-kicker">Fulcrum Intelligence</div>
          <h1 className="page-title">Platform — monitored squeeze book</h1>
        </div>
        <span className="chip">Ranked by composite squeeze score</span>
      </div>
      <p className="page-subtitle">
        Unified model: positioning, derivatives, tape, catalyst, and liquidity features scored into an explainable index — with provenance and
        input-age on every row.
      </p>
      <div className="metric-strip" aria-label="Book summary">
        <div className="metric-tile">
          <div className="metric-tile-label">Coverage</div>
          <div className="metric-tile-value">
            {coverage.activeTrackedSymbols} / {coverage.totalTrackedSymbols}
          </div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Critical / high</div>
          <div className="metric-tile-value">
            {criticalCount} / {highCount}
          </div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Avg score</div>
          <div className="metric-tile-value">{avgScore.toFixed(1)}</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Avg confidence</div>
          <div className="metric-tile-value">{avgConfidence.toFixed(0)}%</div>
        </div>
        <div className="metric-tile">
          <div className="metric-tile-label">Avg input age</div>
          <div className="metric-tile-value">{avgFreshness.toFixed(0)}m</div>
        </div>
        {topSector ? (
          <div className="metric-tile">
            <div className="metric-tile-label">Top sector</div>
            <div className="metric-tile-value" style={{ fontSize: "0.95rem" }}>
              {topSector[0]}{" "}
              <span style={{ color: "var(--muted)", fontWeight: 500 }}>({topSector[1]})</span>
            </div>
          </div>
        ) : null}
      </div>

      <IntelOperationsStrip rows={rows} />

      <ScoreTable rows={rows} />
    </main>
  );
}
