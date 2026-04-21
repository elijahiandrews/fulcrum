import { ScoreTable } from "../../components/ScoreTable";
import { getLatestScores } from "../../lib/db";

export default async function PlatformPage() {
  const rows = await getLatestScores();
  const criticalCount = rows.filter((r) => r.squeezeScore >= 85).length;
  const highCount = rows.filter((r) => r.squeezeScore >= 70 && r.squeezeScore < 85).length;
  const avgConfidence = rows.reduce((sum, row) => sum + row.confidence, 0) / Math.max(rows.length, 1);
  const avgFreshness = rows.reduce((sum, row) => sum + row.sourceFreshnessMinutes, 0) / Math.max(rows.length, 1);
  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2 style={{ marginBottom: "0.3rem" }}>Platform Intelligence Console</h2>
      <p style={{ color: "#89a0bf", marginTop: 0 }}>Explainable squeeze-risk scoring across US, Europe, and Asia books.</p>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.6rem" }}>
        <span className="chip">{rows.length} symbols monitored</span>
        <span className="chip">{criticalCount} critical / {highCount} high-risk</span>
        <span className="chip">{avgConfidence.toFixed(0)}% avg confidence</span>
        <span className="chip">{avgFreshness.toFixed(0)}m avg source age</span>
      </div>
      <ScoreTable rows={rows} />
    </main>
  );
}
