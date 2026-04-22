import Link from "next/link";
import { getRegionalMonitorRows } from "../../lib/db";
import { riskBandFromScore } from "../../lib/intel/riskBand";

export default async function RegionalMonitorPage() {
  const rows = await getRegionalMonitorRows();

  return (
    <main className="container page">
      <div className="terminal-bar">
        <div>
          <div className="terminal-kicker">Regional book</div>
          <h1 className="page-title" style={{ fontSize: "1.85rem", marginBottom: 0 }}>
            Regional pressure monitor
          </h1>
        </div>
        <span className="chip">Aggregated from the same SymbolIntel rows as Platform</span>
      </div>
      <p className="page-subtitle">
        Pressure, catalyst density, and anomaly behavior grouped by listing region — for cross-market surveillance workflows.
      </p>
      <section className="grid-3" style={{ marginTop: "1rem" }}>
        {rows.map((region) => {
          const avgBand = riskBandFromScore(region.averageSqueezeScore);
          return (
            <article className="card card--interactive" key={region.region}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                <h2 className="section-title" style={{ marginBottom: "0.2rem" }}>
                  {region.region}
                </h2>
                <span className="chip">{region.activeSignalsCount} active signals</span>
              </div>
              <p className="stat-line" style={{ marginTop: 0 }}>
                <strong>Average squeeze score:</strong>{" "}
                <span className={`score-${avgBand}`}>{region.averageSqueezeScore.toFixed(1)}</span>
              </p>
              <div className="soft-divider" />
              <p style={{ marginBottom: "0.4rem", color: "var(--muted)", fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Highest-risk symbols
              </p>
              {region.highestRiskSymbols.map((s) => (
                <p key={s.symbol} style={{ margin: "0.25rem 0", color: "var(--text)" }}>
                  <Link href={`/symbol/${s.symbol.toLowerCase()}`} style={{ fontWeight: 600 }}>
                    {s.symbol}
                  </Link>{" "}
                  — {s.score.toFixed(1)} score / {s.confidence.toFixed(0)}% confidence
                </p>
              ))}
              <p
                style={{
                  marginBottom: "0.35rem",
                  marginTop: "0.85rem",
                  color: "var(--muted)",
                  fontSize: "0.82rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase"
                }}
              >
                Catalyst activity
              </p>
              <p className="stat-line" style={{ marginTop: 0 }}>
                {region.catalystActivitySummary}
              </p>
              <p
                style={{
                  marginBottom: "0.35rem",
                  color: "var(--muted)",
                  fontSize: "0.82rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase"
                }}
              >
                Unusual pressure note
              </p>
              <p className="stat-line" style={{ marginTop: 0 }}>
                {region.unusualPressureNote}
              </p>
            </article>
          );
        })}
      </section>
      <div style={{ marginTop: "1.1rem" }}>
        <Link className="btn-secondary" href="/platform">
          Open platform intelligence console
        </Link>
      </div>
    </main>
  );
}
