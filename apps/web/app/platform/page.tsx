import { ScoreTable } from "../../components/ScoreTable";
import { getCoverageSummary, getLatestScores } from "../../lib/db";

export default async function PlatformPage() {
  const rows = await getLatestScores();
  const coverage = await getCoverageSummary();
  const criticalCount = rows.filter((r) => r.squeezeScore >= 85).length;
  const highCount = rows.filter((r) => r.squeezeScore >= 70 && r.squeezeScore < 85).length;
  const avgConfidence = rows.reduce((sum, row) => sum + row.confidence, 0) / Math.max(rows.length, 1);
  const avgFreshness = rows.reduce((sum, row) => sum + row.sourceFreshnessMinutes, 0) / Math.max(rows.length, 1);
  const topSector = Object.entries(coverage.sectorBreakdown ?? {})
    .sort((a, b) => b[1] - a[1])[0];
  return (
    <main className="container page">
      <h2 className="page-title" style={{ fontSize: "2rem" }}>Platform Intelligence Console</h2>
      <p className="page-subtitle">Explainable squeeze-risk scoring across US, Europe, and Asia monitored coverage.</p>
      <div className="meta-row">
        <span className="chip">{coverage.activeTrackedSymbols} active coverage / {coverage.totalTrackedSymbols} tracked</span>
        <span className="chip">{criticalCount} critical / {highCount} high-risk</span>
        <span className="chip">{avgConfidence.toFixed(0)}% avg confidence</span>
        <span className="chip">{avgFreshness.toFixed(0)}m avg source age</span>
        {topSector ? <span className="chip">Top sector: {topSector[0]} ({topSector[1]})</span> : null}
      </div>
      <ScoreTable rows={rows} />
    </main>
  );
}
