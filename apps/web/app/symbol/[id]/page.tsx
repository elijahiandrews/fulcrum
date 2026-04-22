import Link from "next/link";
import { ExplainabilityBars } from "../../../components/ExplainabilityBars";
import { getScoreById } from "../../../lib/db";
import { riskBandFromScore } from "../../../lib/intel/riskBand";

export default async function SymbolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getScoreById(id);
  if (!row) return <main className="container page" style={{ padding: "2rem 0" }}>No data for symbol.</main>;

  const band = riskBandFromScore(row.squeezeScore);
  const provenanceEntries = Object.entries(row.signalProvenance) as Array<[string, string]>;

  return (
    <main className="container page symbol-page">
      <nav className="symbol-back" aria-label="Breadcrumb">
        <Link href="/platform" className="chip">
          ← Platform
        </Link>
      </nav>

      <div className="symbol-hero">
        <article className="card card--elevated symbol-hero-main">
          <p className="symbol-hero-eyebrow">Symbol intelligence brief</p>
          <h1 className="symbol-hero-title">{row.symbol}</h1>
          <p className="symbol-hero-meta">
            {row.companyName}
            <br />
            <span>
              {row.region} / {row.exchange} · origin <strong>{row.dataOrigin}</strong>
            </span>
          </p>
          <div className="symbol-score-block">
            <span className={`symbol-score-value score-${band}`}>{row.squeezeScore.toFixed(1)}</span>
            <span className={`symbol-band-pill score-${band}`}>{band}</span>
          </div>
          <div className="confidence-meter">
            <div className="confidence-meter-label">
              <span>Model confidence</span>
              <span>{row.confidence.toFixed(0)}%</span>
            </div>
            <div className="confidence-meter-track" role="presentation">
              <div className="confidence-meter-fill" style={{ width: `${Math.min(100, Math.max(0, row.confidence))}%` }} />
            </div>
          </div>
          <p className="freshness-line">
            <span>Source freshness (worst channel)</span>
            <span className="data-mono">~{row.sourceFreshnessMinutes}m</span>
            <span aria-hidden>·</span>
            <span>Snapshot</span>
            <span className="data-mono">{new Date(row.updatedAt).toLocaleString()}</span>
          </p>
        </article>

        <aside className="card card--inset symbol-hero-aside" aria-label="Price snapshot">
          <h2 className="symbol-section-title">Market snapshot</h2>
          <dl>
            <div className="symbol-kv">
              <dt>Price</dt>
              <dd>{row.price.toFixed(2)}</dd>
            </div>
            <div className="symbol-kv">
              <dt>1D move</dt>
              <dd>{row.move1D.toFixed(2)}%</dd>
            </div>
            <div className="symbol-kv">
              <dt>Volume</dt>
              <dd>{row.volume.toLocaleString()}</dd>
            </div>
            <div className="symbol-kv">
              <dt>Rel. volume</dt>
              <dd>{row.relativeVolume.toFixed(2)}×</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="symbol-grid">
        <article className="card card--quiet">
          <h2 className="symbol-section-title">Positioning & liquidity</h2>
          <dl>
            <div className="symbol-kv">
              <dt>Short interest (est. % float)</dt>
              <dd>{row.shortInterestPctFloat.toFixed(1)}%</dd>
            </div>
            <div className="symbol-kv">
              <dt>Borrow fee (proxy)</dt>
              <dd>{row.borrowFeePct.toFixed(1)}%</dd>
            </div>
            <div className="symbol-kv">
              <dt>Float (M sh.)</dt>
              <dd>{row.floatSharesM.toFixed(1)}</dd>
            </div>
            <div className="symbol-kv">
              <dt>Liquidity</dt>
              <dd style={{ textTransform: "capitalize" }}>{row.liquidityTightness}</dd>
            </div>
          </dl>
        </article>
        <article className="card card--quiet">
          <h2 className="symbol-section-title">Derivatives</h2>
          <dl>
            <div className="symbol-kv">
              <dt>Options vol vs 30D ADV</dt>
              <dd>{row.optionsVolumeRatio.toFixed(2)}×</dd>
            </div>
            <div className="symbol-kv">
              <dt>Call/put skew</dt>
              <dd>{row.callPutSkew.toFixed(2)}</dd>
            </div>
          </dl>
          <h2 className="symbol-section-title" style={{ marginTop: "1rem" }}>
            Catalyst
          </h2>
          <p style={{ margin: 0, textTransform: "capitalize", fontWeight: 600 }}>{row.catalystStatus}</p>
          <p style={{ margin: "0.45rem 0 0", color: "var(--muted2)", fontSize: "0.9rem", lineHeight: 1.55 }}>{row.catalystSummary}</p>
        </article>
      </div>

      <article className="card card--elevated" style={{ marginBottom: "1rem" }}>
        <h2 className="symbol-section-title">Explainability — channel pressure</h2>
        <p style={{ margin: "0 0 0.85rem", color: "var(--muted)", fontSize: "0.88rem", maxWidth: "72ch" }}>
          Normalized 0–100 contributions from each model lane. Higher means that channel is adding more squeeze-style pressure in this snapshot.
        </p>
        <ExplainabilityBars breakdown={row.explainabilityBreakdown} />
      </article>

      <article className="card card--inset" style={{ marginBottom: "1rem" }}>
        <h2 className="symbol-section-title">Narrative</h2>
        <ul className="symbol-narrative">
          {row.explanation.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </article>

      <article className="card">
        <h2 className="symbol-section-title">Field provenance</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: 0, maxWidth: "85ch", lineHeight: 1.5 }}>
          live = vendor/direct; proxy = model-estimated from tape; fallback = seeded until worker fills the channel.
        </p>
        <div className="provenance-grid">
          {provenanceEntries.map(([field, state]) => (
            <div key={field} className="provenance-item">
              <strong>{field}</strong>
              {state}
            </div>
          ))}
        </div>
        <p style={{ marginTop: "0.85rem", fontSize: "0.85rem", color: "var(--muted)" }}>
          Live-backed UI fields this pass: {row.liveFieldCoverage.length ? row.liveFieldCoverage.join(", ") : "none (full seed/hybrid)"}
        </p>
      </article>
    </main>
  );
}
