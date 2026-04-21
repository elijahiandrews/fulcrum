import Link from "next/link";
import { getLatestScores } from "../lib/db";

export default async function LandingPage() {
  const rows = await getLatestScores();
  return (
    <main className="container page">
      <section style={{ marginBottom: "2.2rem" }}>
        <div className="chip">Fulcrum / GSI Intelligence Layer</div>
        <h1 className="page-title" style={{ maxWidth: 920 }}>
          Spot emerging short squeeze conditions before the market fully reprices them.
        </h1>
        <p className="page-subtitle">
          Fulcrum monitors market structure, positioning pressure, catalyst activity, and cross-market anomalies to identify
          squeeze-risk setups in real time. Built for traders, funds, and intelligence-driven operators who want more than noisy scanners and delayed headlines.
        </p>
        <div style={{ display: "flex", gap: "0.7rem", marginTop: "1.15rem" }}>
          <Link href="/request-access" className="btn-primary">Request Access</Link>
          <Link href="/platform" className="btn-secondary">Open Platform</Link>
        </div>
      </section>

      <section className="card" style={{ marginBottom: "1.3rem" }}>
        <div className="grid-3">
          <div>
            <span className="chip">Coverage Set</span>
            <p className="stat-line">{rows.length} monitored symbols across US, Europe, and Asia.</p>
          </div>
          <div>
            <span className="chip">Signal Stack</span>
            <p className="stat-line">Short pressure, options pressure, volume anomaly, catalyst heat, liquidity stress.</p>
          </div>
          <div>
            <span className="chip">Cadence</span>
            <p className="stat-line">Minute-level recompute with explainable ranking and freshness awareness.</p>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <article className="card">
          <h3 className="section-title">Why Fulcrum</h3>
          <p className="stat-line">Most participants react after the move. Fulcrum surfaces pre-repricing pressure conditions before consensus catches up.</p>
        </article>
        <article className="card">
          <h3 className="section-title">What It Tracks</h3>
          <p className="stat-line">Abnormal volume, options acceleration, short-pressure regimes, catalyst emergence, and cross-market instability signals.</p>
        </article>
        <article className="card">
          <h3 className="section-title">Why It Matters</h3>
          <p className="stat-line">When positioning crowds and liquidity tightens, repricing can accelerate rapidly. Fulcrum makes that pressure readable in advance.</p>
        </article>
      </section>
    </main>
  );
}
