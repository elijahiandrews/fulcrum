import { getLatestScores } from "../../../lib/db";

export default async function SymbolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await getLatestScores();
  const row = rows.find((r) => r.security_id === id);
  if (!row) return <main className="container" style={{ padding: "2rem 0" }}>No data for symbol.</main>;

  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2>{row.symbol} Intelligence Brief</h2>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <p style={{ margin: 0 }}><strong>Signal Score:</strong> <span className={`score-${row.risk_band}`}>{row.total_score.toFixed(1)} ({row.risk_band})</span></p>
        <p><strong>Confidence:</strong> {row.confidence.toFixed(0)}%</p>
        <p><strong>Computed:</strong> {new Date(row.computed_at).toLocaleString()}</p>
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Explainability Notes</h3>
        <ul>
          {row.explanation.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Source Freshness & Provenance</h3>
        {row.source_freshness.map((s, i) => (
          <p key={`${s.sourceKey}-${i}`} style={{ margin: "0.45rem 0", color: "#b4c5dd" }}>
            <strong>{s.sourceKey}</strong> - {Math.round(s.freshnessSeconds / 60)} min lag - {s.provenance}
          </p>
        ))}
      </div>
    </main>
  );
}
