import Link from "next/link";
import { FulcrumBrainViz } from "../components/FulcrumBrainViz";
import { getLatestScores } from "../lib/db";
import type { ExplainabilityBreakdown } from "../lib/intel/types";
import { riskBandFromScore } from "../lib/intel/riskBand";

/** ISR: reuse cached HTML for the shell; intel snapshot inside still refreshes per revalidate window. */
export const revalidate = 120;

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
          <div className="chip chip--ambient">Live fusion map</div>
          <h1 id="landing-heading" className="page-title hud-title-glow landing-hero-title">
            Ingest, fuse, and explain squeeze pressure before the tape fully reprices.
          </h1>
          <p className="landing-hero-lede">
            Fulcrum evaluates positioning, derivatives, liquidity, and catalyst channels into a single auditable score — with provenance and
            input-age on every output.
          </p>
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
              Request access
            </Link>
            <Link href="/platform" className="btn-secondary" prefetch={false}>
              Open platform
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

      <section className="product-desc-bar landing-after-hero card card--elevated" aria-labelledby="product-desc-heading">
        <div className="chip product-desc-chip">GSI · Fulcrum Intelligence</div>
        <h2 id="product-desc-heading" className="product-desc-headline">
          Institutional-grade squeeze intelligence — calm interface, high signal.
        </h2>
        <p className="product-desc-body">
          Built for analysts and decision-makers who need explainable pressure, not another noisy scanner. Cross-check structure, flow, and
          catalyst context in one place.
        </p>
        <p className="product-desc-surfaces">
          <span className="product-desc-surfaces-label">Surfaces</span>
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
    </main>
  );
}
