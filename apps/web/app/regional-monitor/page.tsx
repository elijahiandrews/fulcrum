import Link from "next/link";
import { getRegionalMonitorRows } from "../../lib/db";

export default async function RegionalMonitorPage() {
  const rows = await getRegionalMonitorRows();

  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2 style={{ marginBottom: "0.35rem" }}>Regional Pressure Monitor</h2>
      <p style={{ color: "#89a0bf", marginTop: 0 }}>
        Regional aggregation of squeeze pressure, catalyst density, and anomaly behavior.
      </p>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
        {rows.map((region) => (
          <article className="card" key={region.region}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ marginTop: 0, marginBottom: "0.6rem" }}>{region.region}</h3>
              <span className="chip">{region.activeSignalsCount} active signals</span>
            </div>
            <p style={{ marginTop: 0, color: "#b5c6de" }}>
              <strong>Average squeeze score:</strong> <span className="score-high">{region.averageSqueezeScore.toFixed(1)}</span>
            </p>
            <p style={{ marginBottom: "0.4rem", color: "#89a0bf" }}>Highest-risk symbols</p>
            {region.highestRiskSymbols.map((symbol) => (
              <p key={symbol.symbol} style={{ margin: "0.2rem 0", color: "#d9e2f2" }}>
                <strong>{symbol.symbol}</strong> - {symbol.score.toFixed(1)} score / {symbol.confidence}% confidence
              </p>
            ))}
            <p style={{ marginBottom: "0.4rem", marginTop: "0.8rem", color: "#89a0bf" }}>Catalyst activity</p>
            <p style={{ marginTop: 0, color: "#b5c6de" }}>{region.catalystActivitySummary}</p>
            <p style={{ marginBottom: "0.4rem", color: "#89a0bf" }}>Unusual pressure note</p>
            <p style={{ marginTop: 0, color: "#b5c6de" }}>{region.unusualPressureNote}</p>
          </article>
        ))}
      </section>
      <div style={{ marginTop: "1rem" }}>
        <Link className="chip" href="/platform">Open platform intelligence table</Link>
      </div>
    </main>
  );
}
