import Link from "next/link";
import { getLatestScores } from "../lib/db";
import { riskBandFromScore } from "../lib/intel/riskBand";

export default async function LandingPage() {
  const rows = await getLatestScores();
  const critical = rows.filter((r) => riskBandFromScore(r.squeezeScore) === "critical").length;
  const high = rows.filter((r) => riskBandFromScore(r.squeezeScore) === "high").length;
  const avgScore = rows.reduce((s, r) => s + r.squeezeScore, 0) / Math.max(rows.length, 1);

  return (
    <main className="container page">
      <section style={{ marginBottom: "2rem" }}>
        <div className="chip">Fulcrum Intelligence</div>
        <h1 className="page-title" style={{ maxWidth: 920 }}>
          Spot emerging short squeeze conditions before the market fully reprices them.
        </h1>
        <p className="page-subtitle">
          Fulcrum Intelligence monitors market structure, positioning pressure, catalyst activity, and cross-market anomalies to identify
          squeeze-risk setups in real time. Built for traders, funds, and intelligence-led operators who need explainable
          pressure — not another noisy scanner.
        </p>
        <div style={{ display: "flex", gap: "0.7rem", marginTop: "1.1rem", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/request-access" className="btn-primary">
            Request Access
          </Link>
          <Link href="/platform" className="btn-secondary">
            See the Platform
          </Link>
        </div>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--muted)" }}>
          Product surfaces:{" "}
          <Link href="/platform" style={{ color: "var(--accent)" }}>
            Platform
          </Link>
          {" · "}
          <Link href="/regional-monitor" style={{ color: "var(--accent)" }}>
            Regional monitor
          </Link>
          {" · "}
          <Link href="/alerts-center" style={{ color: "var(--accent)" }}>
            Alerts center
          </Link>
        </p>
      </section>

      <section
        className="card"
        style={{
          marginBottom: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem 1.5rem",
          alignItems: "center",
          justifyContent: "space-between",
          borderColor: "rgba(122, 162, 255, 0.22)"
        }}
      >
        <div style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>
          Live book snapshot
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem 1.25rem", fontSize: "0.92rem", color: "var(--muted2)" }}>
          <span>
            <strong style={{ color: "var(--text)" }}>{rows.length}</strong> symbols on the monitor list
          </span>
          <span>
            <strong style={{ color: "var(--pressure-critical)" }}>{critical}</strong> critical ·{" "}
            <strong style={{ color: "var(--pressure-high)" }}>{high}</strong> high band
          </span>
          <span>
            <strong style={{ color: "var(--text)" }}>{avgScore.toFixed(1)}</strong> book-average squeeze score
          </span>
        </div>
      </section>

      <section className="card" style={{ marginBottom: "1.3rem" }}>
        <div className="grid-3">
          <div>
            <span className="chip">Coverage</span>
            <p className="stat-line">US, Europe, and Asia listings scored on one comparable squeeze index.</p>
          </div>
          <div>
            <span className="chip">Model inputs</span>
            <p className="stat-line">Short/float pressure, options surface, volume regime, catalyst stack, liquidity sensitivity.</p>
          </div>
          <div>
            <span className="chip">Cadence</span>
            <p className="stat-line">Snapshot refresh with worst-channel freshness surfaced on every row.</p>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <article className="card">
          <h3 className="section-title">Why Fulcrum Intelligence</h3>
          <p className="stat-line">
            Most participants react after repricing starts. Fulcrum Intelligence highlights the pressure stack while the setup is still forming.
          </p>
        </article>
        <article className="card">
          <h3 className="section-title">What it tracks</h3>
          <p className="stat-line">
            Borrow and float stress, derivatives acceleration, abnormal tape participation, catalyst emergence, and book depth.
          </p>
        </article>
        <article className="card">
          <h3 className="section-title">Why it matters</h3>
          <p className="stat-line">
            When positioning crowds and liquidity thins, repricing can outrun traditional dashboards. Fulcrum Intelligence makes that regime visible early.
          </p>
        </article>
      </section>
    </main>
  );
}
