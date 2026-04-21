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

const shortCrowdingState = (shortInterestPctFloat: number, borrowFeePct: number): string => {
  if (shortInterestPctFloat >= 22 || borrowFeePct >= 12) return "elevated short crowding";
  if (shortInterestPctFloat >= 13 || borrowFeePct >= 6) return "moderate short crowding";
  return "contained short crowding";
};

const optionsPressureState = (optionsRatio: number, skew: number): string => {
  if (optionsRatio >= 3 || skew >= 1.32) return "aggressive call-led pressure";
  if (optionsRatio >= 2 || skew >= 1.15) return "building options pressure";
  return "balanced options positioning";
};

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
  const provenance = row.signalProvenance ?? {
    shortInterestPctFloat: "fallback",
    borrowFeePct: "fallback",
    optionsVolumeRatio: "fallback",
    callPutSkew: "fallback",
    floatSharesM: "fallback",
    liquidityTightness: "fallback"
  };
  const scoreDelta = comparison.diff?.scoreDelta ?? 0;
  const confidenceDelta = comparison.diff?.confidenceDelta ?? 0;
  const driverRows: Array<[string, number]> = [
    ["Short pressure", row.explainabilityBreakdown.shortPressure],
    ["Options pressure", row.explainabilityBreakdown.optionsPressure],
    ["Volume pressure", row.explainabilityBreakdown.volumePressure],
    ["Catalyst pressure", row.explainabilityBreakdown.catalystPressure],
    ["Liquidity pressure", row.explainabilityBreakdown.liquidityPressure]
  ];
  const topDrivers = [...driverRows].sort((a, b) => b[1] - a[1]).slice(0, 2);

  return (
    <main className="container page">
      <h2 className="page-title" style={{ fontSize: "2rem" }}>{row.symbol} Intelligence Brief</h2>
      <p className="page-subtitle">{row.companyName} - {row.region} / {row.exchange}</p>
      <div className="card" style={{ marginBottom: "1rem", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.8rem" }}>
        <div>
          <p style={{ marginTop: 0, marginBottom: "0.2rem", color: "#89a0bf" }}>Squeeze score</p>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }} className={`score-${band}`}>{row.squeezeScore.toFixed(1)}</p>
          <p style={{ margin: "0.25rem 0 0 0", color: "#89a0bf" }}>{band} band ({scoreDelta >= 0 ? "+" : ""}{scoreDelta.toFixed(1)} vs prior)</p>
        </div>
        <div>
          <p style={{ marginTop: 0, marginBottom: "0.2rem", color: "#89a0bf" }}>Confidence</p>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>{row.confidence.toFixed(0)}%</p>
          <p style={{ margin: "0.25rem 0 0 0", color: "#89a0bf" }}>{confidenceDelta >= 0 ? "+" : ""}{confidenceDelta.toFixed(1)}% vs prior</p>
        </div>
        <div>
          <p style={{ marginTop: 0, marginBottom: "0.2rem", color: "#89a0bf" }}>Freshness</p>
          <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>{row.sourceFreshnessMinutes}m</p>
          <p style={{ margin: "0.25rem 0 0 0", color: "#89a0bf", textTransform: "capitalize" }}>{row.dataOrigin.replace("-", " ")} origin</p>
        </div>
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Current Driver Stack</h3>
        <p style={{ marginTop: 0, color: "#b4c5dd" }}>
          Top active drivers: <strong>{topDrivers[0][0]}</strong> ({topDrivers[0][1].toFixed(1)}) and{" "}
          <strong>{topDrivers[1][0]}</strong> ({topDrivers[1][1].toFixed(1)}).
        </p>
        <p style={{ marginBottom: "0.25rem" }}><strong>Price / 1D Move:</strong> ${row.price.toFixed(2)} / {row.move1D.toFixed(1)}%</p>
        <p style={{ marginBottom: "0.25rem" }}><strong>Volume / RelVol:</strong> {row.volume.toLocaleString()} / {row.relativeVolume.toFixed(1)}x</p>
        <p style={{ marginBottom: "0.25rem" }}><strong>Short Interest / Borrow Fee:</strong> {row.shortInterestPctFloat.toFixed(1)}% / {row.borrowFeePct.toFixed(1)}%</p>
        <p style={{ marginBottom: "0.25rem" }}><strong>Short Crowding State:</strong> {shortCrowdingState(row.shortInterestPctFloat, row.borrowFeePct)}</p>
        <p style={{ marginBottom: "0.25rem" }}><strong>Options Ratio / Call-Put Skew:</strong> {row.optionsVolumeRatio.toFixed(1)} / {row.callPutSkew.toFixed(2)}</p>
        <p style={{ marginBottom: "0.25rem" }}><strong>Options Pressure State:</strong> {optionsPressureState(row.optionsVolumeRatio, row.callPutSkew)}</p>
        <p style={{ marginBottom: "0.25rem", textTransform: "capitalize" }}><strong>Catalyst:</strong> {row.catalystStatus}</p>
        <p style={{ marginTop: 0, color: "#b4c5dd" }}>{row.catalystSummary}</p>
        <p style={{ marginBottom: "0.25rem", textTransform: "capitalize" }}>
          <strong>Signal Provenance:</strong> short {provenance.shortInterestPctFloat}, borrow {provenance.borrowFeePct},
          options {provenance.optionsVolumeRatio}, skew {provenance.callPutSkew}, float {provenance.floatSharesM},
          liquidity {provenance.liquidityTightness}
        </p>
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
        <h3 style={{ marginTop: 0 }}>Recent Alerts and Signal Memory</h3>
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
