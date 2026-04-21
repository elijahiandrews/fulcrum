import {
  getAlertsForSymbol,
  getCurrentVsPrevious,
  getRecentCatalystChangeEvents,
  getRecentScoreChangeEvents,
  getRecentSymbolHistory,
  getScoreById
} from "../../../lib/db";

const bandFromScore = (score: number): "low" | "elevated" | "high" | "critical" =>
  score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "elevated" : "low";

export default async function SymbolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getScoreById(id);
  if (!row) return <main className="container" style={{ padding: "2rem 0" }}>No data for symbol.</main>;
  const [relatedAlerts, comparison, recentHistory, catalystChanges, scoreChanges] = await Promise.all([
    getAlertsForSymbol(row.symbol),
    getCurrentVsPrevious(row.symbol),
    getRecentSymbolHistory(row.symbol, 8),
    getRecentCatalystChangeEvents(row.symbol, 5),
    getRecentScoreChangeEvents(row.symbol, 5)
  ]);
  const band = bandFromScore(row.squeezeScore);
  const scoreDelta = comparison.diff?.scoreDelta ?? 0;
  const confidenceDelta = comparison.diff?.confidenceDelta ?? 0;

  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2>{row.symbol} Intelligence Brief</h2>
      <p style={{ color: "#89a0bf", marginTop: 0 }}>{row.companyName} - {row.region} / {row.exchange}</p>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <p style={{ margin: 0 }}><strong>Signal Score:</strong> <span className={`score-${band}`}>{row.squeezeScore.toFixed(1)} ({band})</span></p>
        <p><strong>Score vs Previous:</strong> {scoreDelta >= 0 ? "+" : ""}{scoreDelta.toFixed(1)}</p>
        <p><strong>Confidence:</strong> {row.confidence.toFixed(0)}%</p>
        <p><strong>Confidence vs Previous:</strong> {confidenceDelta >= 0 ? "+" : ""}{confidenceDelta.toFixed(1)}%</p>
        <p><strong>Price / 1D Move:</strong> ${row.price.toFixed(2)} / {row.move1D.toFixed(1)}%</p>
        <p><strong>Volume / RelVol:</strong> {row.volume.toLocaleString()} / {row.relativeVolume.toFixed(1)}x</p>
        <p><strong>Short Interest / Borrow Fee:</strong> {row.shortInterestPctFloat.toFixed(1)}% / {row.borrowFeePct.toFixed(1)}%</p>
        <p><strong>Options Ratio / Call-Put Skew:</strong> {row.optionsVolumeRatio.toFixed(1)} / {row.callPutSkew.toFixed(2)}</p>
        <p style={{ textTransform: "capitalize" }}><strong>Catalyst Status:</strong> {row.catalystStatus}</p>
        <p><strong>Catalyst Summary:</strong> {row.catalystSummary}</p>
        <p style={{ textTransform: "capitalize" }}><strong>Liquidity Tightness:</strong> {row.liquidityTightness}</p>
        <p><strong>Source Freshness:</strong> {row.sourceFreshnessMinutes} min</p>
        <p style={{ textTransform: "capitalize" }}><strong>Data Origin:</strong> {row.dataOrigin.replace("-", " ")}</p>
        <p><strong>Live Field Coverage:</strong> {row.liveFieldCoverage.length > 0 ? row.liveFieldCoverage.join(", ") : "none"}</p>
        <p><strong>Updated:</strong> {new Date(row.updatedAt).toLocaleString()}</p>
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Explainability Breakdown</h3>
        <ul>
          <li>Short pressure: {row.explainabilityBreakdown.shortPressure.toFixed(1)}</li>
          <li>Options pressure: {row.explainabilityBreakdown.optionsPressure.toFixed(1)}</li>
          <li>Volume pressure: {row.explainabilityBreakdown.volumePressure.toFixed(1)}</li>
          <li>Catalyst pressure: {row.explainabilityBreakdown.catalystPressure.toFixed(1)}</li>
          <li>Liquidity pressure: {row.explainabilityBreakdown.liquidityPressure.toFixed(1)}</li>
        </ul>
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Recent Related Alerts</h3>
        {relatedAlerts.slice(0, 4).map((alert) => (
          <p key={alert.id} style={{ margin: "0.45rem 0", color: "#b4c5dd" }}>
            <strong>{new Date(alert.timestamp).toLocaleString()}</strong> - {alert.alertType} ({alert.severity}) - {alert.confidence}% confidence
          </p>
        ))}
        {relatedAlerts.length === 0 ? <p style={{ marginTop: 0, color: "#89a0bf" }}>No active alert history for this symbol.</p> : null}
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Snapshot Timeline (Recent)</h3>
        {recentHistory.map((snapshot) => (
          <p key={snapshot.capturedAt} style={{ margin: "0.45rem 0", color: "#b4c5dd" }}>
            <strong>{new Date(snapshot.capturedAt).toLocaleString()}</strong> - score {snapshot.squeezeScore.toFixed(1)}, confidence{" "}
            {snapshot.confidence.toFixed(0)}%, rel-vol {snapshot.relativeVolume.toFixed(1)}x, catalyst {snapshot.catalystStatus}
          </p>
        ))}
        {recentHistory.length === 0 ? <p style={{ marginTop: 0, color: "#89a0bf" }}>No snapshot history captured yet.</p> : null}
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Recent Score Changes</h3>
        {scoreChanges.map((event, idx) => (
          <p key={`${event.capturedAt}-score-${idx}`} style={{ margin: "0.45rem 0", color: "#b4c5dd" }}>
            <strong>{new Date(event.capturedAt).toLocaleString()}</strong> - {event.message}
          </p>
        ))}
        {scoreChanges.length === 0 ? <p style={{ marginTop: 0, color: "#89a0bf" }}>No material score transitions in recent snapshots.</p> : null}
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Recent Catalyst Changes</h3>
        {catalystChanges.map((event, idx) => (
          <p key={`${event.capturedAt}-${idx}`} style={{ margin: "0.45rem 0", color: "#b4c5dd" }}>
            <strong>{new Date(event.capturedAt).toLocaleString()}</strong> - {event.message}
          </p>
        ))}
        {catalystChanges.length === 0 ? <p style={{ marginTop: 0, color: "#89a0bf" }}>No catalyst-state transitions in recent snapshots.</p> : null}
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Narrative Explanation</h3>
        <p style={{ marginTop: 0, color: "#b4c5dd" }}>{row.explanation}</p>
      </div>
    </main>
  );
}
