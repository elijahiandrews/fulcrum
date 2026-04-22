import Link from "next/link";
import { FulcrumBrainViz } from "../components/FulcrumBrainViz";
import { getLatestScores } from "../lib/db";
import type { ExplainabilityBreakdown } from "../lib/intel/types";
import { riskBandFromScore } from "../lib/intel/riskBand";

export default async function LandingPage() {
  const rows = await getLatestScores();
  const n = Math.max(rows.length, 1);
  const critical = rows.filter((r) => riskBandFromScore(r.squeezeScore) === "critical").length;
  const high = rows.filter((r) => riskBandFromScore(r.squeezeScore) === "high").length;
  const avgScore = rows.reduce((s, r) => s + r.squeezeScore, 0) / n;
  const avgConfidence = rows.reduce((s, r) => s + r.confidence, 0) / n;

  const regionTally = { US: 0, Europe: 0, Asia: 0 };
  for (const r of rows) {
    regionTally[r.region]++;
  }

  const emptyBreakdown: ExplainabilityBreakdown = {
    shortPressure: 0,
    optionsPressure: 0,
    volumePressure: 0,
    catalystPressure: 0,
    liquidityPressure: 0
  };
  const sumBreakdown = rows.reduce(
    (acc, r) => ({
      shortPressure: acc.shortPressure + r.explainabilityBreakdown.shortPressure,
      optionsPressure: acc.optionsPressure + r.explainabilityBreakdown.optionsPressure,
      volumePressure: acc.volumePressure + r.explainabilityBreakdown.volumePressure,
      catalystPressure: acc.catalystPressure + r.explainabilityBreakdown.catalystPressure,
      liquidityPressure: acc.liquidityPressure + r.explainabilityBreakdown.liquidityPressure
    }),
    emptyBreakdown
  );
  const avgBreakdown: ExplainabilityBreakdown = {
    shortPressure: sumBreakdown.shortPressure / n,
    optionsPressure: sumBreakdown.optionsPressure / n,
    volumePressure: sumBreakdown.volumePressure / n,
    catalystPressure: sumBreakdown.catalystPressure / n,
    liquidityPressure: sumBreakdown.liquidityPressure / n
  };

  return (
    <main className="container page landing-page">
      <section className="product-desc-bar" aria-labelledby="product-desc-heading">
        <div className="chip product-desc-chip">GSI · Fulcrum Intelligence</div>
        <h2 id="product-desc-heading" className="product-desc-headline">
          Spot emerging short squeeze conditions before the market fully reprices them.
        </h2>
        <p className="product-desc-body">
          Fulcrum Intelligence monitors market structure, positioning pressure, catalyst activity, and cross-market anomalies to identify
          squeeze-risk setups in real time. Built for traders, funds, and intelligence-led operators who need explainable pressure — not
          another noisy scanner.
        </p>
        <p className="product-desc-surfaces">
          <span className="product-desc-surfaces-label">Product surfaces</span>
          <Link href="/platform" prefetch={false}>
            Platform
          </Link>
          <span className="product-desc-dot" aria-hidden>
            ·
          </span>
          <Link href="/regional-monitor" prefetch={false}>
            Regional monitor
          </Link>
          <span className="product-desc-dot" aria-hidden>
            ·
          </span>
          <Link href="/alerts-center" prefetch={false}>
            Alerts center
          </Link>
        </p>
      </section>

      <section className="landing-hero" aria-labelledby="landing-heading">
        <div className="landing-hero-viz">
          <FulcrumBrainViz
            idPrefix="landing-brain"
            regionTally={regionTally}
            avgBreakdown={avgBreakdown}
            bookAvgScore={avgScore}
            bookAvgConfidence={avgConfidence}
          />
        </div>
        <div className="landing-hero-overlay">
          <div className="chip">Live fusion map</div>
          <h1 id="landing-heading" className="page-title hud-title-glow landing-hero-title">
            The Fulcrum stack — ingest, signal lanes, fusion, output.
          </h1>
          <div className="landing-hud-stats" role="group" aria-label="Live book snapshot">
            <div className="landing-hud-stat">
              <span className="landing-hud-stat-label">Monitor</span>
              <span className="landing-hud-stat-value">{rows.length}</span>
            </div>
            <div className="landing-hud-stat landing-hud-stat--critical">
              <span className="landing-hud-stat-label">Critical</span>
              <span className="landing-hud-stat-value">{critical}</span>
            </div>
            <div className="landing-hud-stat landing-hud-stat--high">
              <span className="landing-hud-stat-label">High</span>
              <span className="landing-hud-stat-value">{high}</span>
            </div>
            <div className="landing-hud-stat">
              <span className="landing-hud-stat-label">Book avg</span>
              <span className="landing-hud-stat-value data-mono">{avgScore.toFixed(1)}</span>
            </div>
          </div>
          <div className="landing-cta">
            <Link href="/request-access" className="btn-primary">
              Request Access
            </Link>
            <Link href="/platform" className="btn-secondary" prefetch={false}>
              Open Platform
            </Link>
          </div>
          <nav className="landing-quick-nav" aria-label="Product areas">
            <Link href="/platform" prefetch={false}>
              Platform
            </Link>
            <span className="landing-quick-sep" aria-hidden>
              ·
            </span>
            <Link href="/regional-monitor" prefetch={false}>
              Regional
            </Link>
            <span className="landing-quick-sep" aria-hidden>
              ·
            </span>
            <Link href="/alerts-center" prefetch={false}>
              Alerts
            </Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
