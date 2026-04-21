import { ScoreTable } from "../../components/ScoreTable";
import { getLatestScores } from "../../lib/db";

export default async function PlatformPage() {
  const rows = await getLatestScores();
  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2 style={{ marginBottom: "0.3rem" }}>Fulcrum Signal Overview</h2>
      <p style={{ color: "#89a0bf", marginTop: 0 }}>Explainable squeeze-risk scoring across US, UK, and EU coverage.</p>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.6rem" }}>
        <span className="chip">Trust-first scoring</span>
        <span className="chip">Live + delayed source aware</span>
        <span className="chip">No black-box certainty</span>
      </div>
      <ScoreTable rows={rows} />
    </main>
  );
}
