import Link from "next/link";
import { getScoreById } from "../../../lib/db";
import { riskBandFromScore } from "../../../lib/intel/riskBand";

export default async function SymbolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getScoreById(id);
  if (!row) return <main className="container" style={{ padding: "2rem 0" }}>No data for symbol.</main>;

  const band = riskBandFromScore(row.squeezeScore);
  const provenanceEntries = Object.entries(row.signalProvenance) as Array<[string, string]>;

  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <p style={{ marginBottom: "1rem" }}>
        <Link href="/platform" className="chip">Back to platform</Link>
      </p>
      <h2 style={{ marginBottom: "0.25rem" }}>{row.symbol} Intelligence Brief</h2>
      <p style={{ color: "#89a0bf", marginTop: 0 }}>
        {row.companyName} — {row.region} / {row.exchange} — data origin: <strong>{row.dataOrigin}</strong>
      </p>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Market snapshot</h3>
        <p style={{ margin: "0.35rem 0" }}><strong>Price:</strong> {row.price.toFixed(2)}</p>
        <p style={{ margin: "0.35rem 0" }}><strong>1D move:</strong> {row.move1D.toFixed(2)}%</p>
        <p style={{ margin: "0.35rem 0" }}><strong>Volume (shares):</strong> {row.volume.toLocaleString()}</p>
        <p style={{ margin: "0.35rem 0" }}><strong>Relative volume:</strong> {row.relativeVolume.toFixed(2)}x vs baseline</p>
        <p style={{ margin: "0.35rem 0" }}><strong>Updated:</strong> {new Date(row.updatedAt).toLocaleString()}</p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Positioning & liquidity</h3>
        <p style={{ margin: "0.35rem 0" }}><strong>Short interest (est. % of float):</strong> {row.shortInterestPctFloat.toFixed(1)}%</p>
        <p style={{ margin: "0.35rem 0" }}><strong>Borrow fee (proxy, %):</strong> {row.borrowFeePct.toFixed(1)}%</p>
        <p style={{ margin: "0.35rem 0" }}><strong>Float (M shares):</strong> {row.floatSharesM.toFixed(1)}</p>
        <p style={{ margin: "0.35rem 0" }}><strong>Liquidity tightness:</strong> {row.liquidityTightness}</p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Derivatives</h3>
        <p style={{ margin: "0.35rem 0" }}><strong>Options volume vs 30D ADV:</strong> {row.optionsVolumeRatio.toFixed(2)}x</p>
        <p style={{ margin: "0.35rem 0" }}><strong>Call/put skew:</strong> {row.callPutSkew.toFixed(2)}</p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Catalyst</h3>
        <p style={{ margin: "0.35rem 0" }}><strong>Status:</strong> {row.catalystStatus}</p>
        <p style={{ margin: "0.35rem 0", color: "#b5c6de" }}>{row.catalystSummary}</p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Squeeze score</h3>
        <p style={{ margin: 0 }}>
          <strong>Squeeze score:</strong>{" "}
          <span className={`score-${band}`}>{row.squeezeScore.toFixed(1)} ({band})</span>
        </p>
        <p><strong>Confidence:</strong> {row.confidence.toFixed(0)}%</p>
        <p><strong>Source freshness (worst channel):</strong> ~{row.sourceFreshnessMinutes} min</p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Explainability breakdown (model channels, 0–100)</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <tbody>
            <tr style={{ borderTop: "1px solid #1e2a3f" }}>
              <td style={{ padding: "0.45rem 0", color: "#89a0bf" }}>Short / float pressure</td>
              <td style={{ padding: "0.45rem 0" }}>{row.explainabilityBreakdown.shortPressure.toFixed(1)}</td>
            </tr>
            <tr style={{ borderTop: "1px solid #1e2a3f" }}>
              <td style={{ padding: "0.45rem 0", color: "#89a0bf" }}>Options surface pressure</td>
              <td style={{ padding: "0.45rem 0" }}>{row.explainabilityBreakdown.optionsPressure.toFixed(1)}</td>
            </tr>
            <tr style={{ borderTop: "1px solid #1e2a3f" }}>
              <td style={{ padding: "0.45rem 0", color: "#89a0bf" }}>Volume regime pressure</td>
              <td style={{ padding: "0.45rem 0" }}>{row.explainabilityBreakdown.volumePressure.toFixed(1)}</td>
            </tr>
            <tr style={{ borderTop: "1px solid #1e2a3f" }}>
              <td style={{ padding: "0.45rem 0", color: "#89a0bf" }}>Catalyst pressure</td>
              <td style={{ padding: "0.45rem 0" }}>{row.explainabilityBreakdown.catalystPressure.toFixed(1)}</td>
            </tr>
            <tr style={{ borderTop: "1px solid #1e2a3f" }}>
              <td style={{ padding: "0.45rem 0", color: "#89a0bf" }}>Liquidity / float pressure</td>
              <td style={{ padding: "0.45rem 0" }}>{row.explainabilityBreakdown.liquidityPressure.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Narrative explanation</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#b5c6de" }}>
          {row.explanation.map((line, i) => (
            <li key={i} style={{ marginBottom: "0.35rem" }}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Field provenance</h3>
        <p style={{ color: "#89a0bf", fontSize: "0.88rem", marginTop: 0 }}>
          live = vendor/direct; proxy = model-estimated from tape; fallback = seeded until worker fills the channel.
        </p>
        {provenanceEntries.map(([field, state]) => (
          <p key={field} style={{ margin: "0.35rem 0" }}>
            <strong>{field}</strong> — {state}
          </p>
        ))}
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#89a0bf" }}>
          Live-backed UI fields this pass: {row.liveFieldCoverage.length ? row.liveFieldCoverage.join(", ") : "none (full seed/hybrid)"}
        </p>
      </div>
    </main>
  );
}
