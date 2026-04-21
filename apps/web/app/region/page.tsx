import { ScoreTable } from "../../components/ScoreTable";
import { getLatestScores } from "../../lib/db";

export default async function RegionMonitorPage({
  searchParams
}: {
  searchParams: Promise<{ r?: "US" | "UK" | "EU" }>;
}) {
  const { r } = await searchParams;
  const region = r ?? "US";
  const rows = await getLatestScores(region);
  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2>{region} Regional Pressure Monitor</h2>
      <p style={{ color: "#89a0bf" }}>Focused view of imbalance, pressure, and catalyst risk by venue and symbol.</p>
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem" }}>
        <a href="/region?r=US" className="chip">US</a>
        <a href="/region?r=UK" className="chip">UK</a>
        <a href="/region?r=EU" className="chip">EU</a>
      </div>
      <ScoreTable rows={rows} />
    </main>
  );
}
