import Link from "next/link";
import { getRegionalMonitorRows } from "../../lib/db";

export default async function RegionalMonitorPage() {
  const rows = await getRegionalMonitorRows();

  return (
    <main className="container page">
      <h2 className="page-title" style={{ fontSize: "2rem" }}>Regional Pressure Monitor</h2>
      <p className="page-subtitle">
        Regional aggregation of squeeze pressure, catalyst density, and anomaly behavior.
      </p>
      <section className="grid-3" style={{ marginTop: "1.2rem" }}>
        {rows.map((region) => (
          <article className="card" key={region.region}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="section-title" style={{ marginBottom: "0.2rem" }}>{region.region}</h3>
              <span className="chip">{region.activeSignalsCount} active signals</span>
            </div>
            <p className="stat-line" style={{ marginTop: 0 }}>
              <strong>Average squeeze score:</strong> <span className="score-high">{region.averageSqueezeScore.toFixed(1)}</span>
            </p>
            <div className="soft-divider" />
            <p style={{ marginBottom: "0.4rem", color: "#89a0bf", fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Highest-risk symbols</p>
            {region.highestRiskSymbols.map((symbol) => (
              <p key={symbol.symbol} style={{ margin: "0.25rem 0", color: "#d9e2f2" }}>
                <strong>{symbol.symbol}</strong> - {symbol.score.toFixed(1)} score / {symbol.confidence}% confidence
              </p>
            ))}
            <p style={{ marginBottom: "0.35rem", marginTop: "0.8rem", color: "#89a0bf", fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Catalyst activity</p>
            <p className="stat-line" style={{ marginTop: 0 }}>{region.catalystActivitySummary}</p>
            <p style={{ marginBottom: "0.35rem", color: "#89a0bf", fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Pressure note</p>
            <p className="stat-line" style={{ marginTop: 0 }}>{region.unusualPressureNote}</p>
          </article>
        ))}
      </section>
      <div style={{ marginTop: "1.1rem" }}>
        <Link className="btn-secondary" href="/platform">Open platform intelligence console</Link>
      </div>
    </main>
  );
}
