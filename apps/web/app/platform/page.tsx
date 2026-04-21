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
          <h1 className="page-title" style={{ fontSize: "1.85rem", marginBottom: 0 }}>
            Platform — monitored squeeze book
          </h1>
        </div>
        <span className="chip">Ranked by composite squeeze score</span>
      </div>
      <p className="page-subtitle">
        Unified model: positioning, derivatives, tape, catalyst, and liquidity features scored into an explainable index — with
        provenance and input-age on every row.
      </p>
      <div className="meta-row">
        <span className="chip">
          {coverage.activeTrackedSymbols} active / {coverage.totalTrackedSymbols} tracked
        </span>
        <span className="chip">
          {criticalCount} critical / {highCount} high
        </span>
        <span className="chip">{avgScore.toFixed(1)} avg score</span>
        <span className="chip">{avgConfidence.toFixed(0)}% avg confidence</span>
        <span className="chip">{avgFreshness.toFixed(0)}m avg input age</span>
        {topSector ? (
          <span className="chip">
            Top sector: {topSector[0]} ({topSector[1]})
          </span>
        ) : null}
      </div>
      <ScoreTable rows={rows} />
    </main>
  );
}
