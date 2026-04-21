import {
  getAlertHistory,
  getCoverageSummary,
  getLatestScores,
  getLiveStatus,
  getRecentCatalystChangeEvents,
  getRecentScoreChangeEvents
} from "../../lib/db";

const scoreTone = (score: number): "score-critical" | "score-high" | "score-elevated" | "score-low" =>
  score >= 85 ? "score-critical" : score >= 70 ? "score-high" : score >= 50 ? "score-elevated" : "score-low";

export default async function OpsPage() {
  const [liveStatus, coverage, symbols, scoreChanges, catalystChanges, alertHistory] = await Promise.all([
    getLiveStatus(),
    getCoverageSummary(),
    getLatestScores(),
    getRecentScoreChangeEvents(undefined, 8),
    getRecentCatalystChangeEvents(undefined, 8),
    getAlertHistory(120)
  ]);

  const lowConfidence = symbols.filter((row) => row.confidence < 70).slice(0, 8);
  const fallbackHeavy = symbols
    .filter((row) => row.dataOrigin !== "live" || row.liveFieldCoverage.length <= 2)
    .slice(0, 8);
  const highSeverityAlerts = alertHistory
    .filter((alert) => alert.severity === "critical" || alert.severity === "high")
    .slice(0, 10);
  const downgradedOrResolved = alertHistory
    .filter((alert) => alert.status === "downgraded" || alert.status === "resolved")
    .slice(0, 10);

  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2 style={{ marginBottom: "0.25rem" }}>Internal Ops Console</h2>
      <p style={{ color: "#89a0bf", marginTop: 0 }}>
        Internal diagnostics for live provider behavior, coverage quality, and recent intelligence state changes.
      </p>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Provider Health</h3>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Overall mode:</strong>{" "}
          <span className={liveStatus.overallMode === "live" ? "score-high" : liveStatus.overallMode === "partial" ? "score-elevated" : "score-low"}>
            {liveStatus.overallMode}
          </span>
        </p>
        <p style={{ margin: "0.25rem 0" }}><strong>FMP status:</strong> {liveStatus.fmpStatus}</p>
        <p style={{ margin: "0.25rem 0" }}><strong>Finnhub status:</strong> {liveStatus.finnhubStatus}</p>
        <p style={{ margin: "0.25rem 0" }}><strong>Cache:</strong> {liveStatus.cacheStatus}</p>
        <p style={{ margin: "0.25rem 0" }}><strong>Generated:</strong> {new Date(liveStatus.generatedAt).toLocaleString()}</p>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Live-backed fields:</strong> {liveStatus.liveFieldCoverage.liveBacked.length > 0 ? liveStatus.liveFieldCoverage.liveBacked.join(", ") : "none"}
        </p>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Fallback-derived fields:</strong> {liveStatus.liveFieldCoverage.fallbackDerived.join(", ")}
        </p>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Unavailable fields:</strong> {liveStatus.liveFieldCoverage.unavailable.length > 0 ? liveStatus.liveFieldCoverage.unavailable.join(", ") : "none"}
        </p>
        {liveStatus.note ? <p style={{ marginBottom: 0, color: "#b5c6de" }}><strong>Note:</strong> {liveStatus.note}</p> : null}
      </section>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Tracked Universe Summary</h3>
        <p style={{ margin: "0.25rem 0" }}><strong>Total tracked:</strong> {coverage.totalTrackedSymbols}</p>
        <p style={{ margin: "0.25rem 0" }}><strong>Active tracked:</strong> {coverage.activeTrackedSymbols}</p>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Product dataset:</strong> {"fulcrumProductDatasetSymbols" in coverage ? coverage.fulcrumProductDatasetSymbols : "—"} symbols (seed → score pipeline)
        </p>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Region breakdown:</strong> US {coverage.regionBreakdown.US} / Europe {coverage.regionBreakdown.Europe} / Asia {coverage.regionBreakdown.Asia}
        </p>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Priority tiers:</strong> core {coverage.priorityBreakdown.core} / watch {coverage.priorityBreakdown.watch} / experimental {coverage.priorityBreakdown.experimental}
        </p>
        <p style={{ margin: "0.65rem 0 0.25rem 0", color: "#89a0bf" }}>Low-confidence symbols (&lt;70%)</p>
        {lowConfidence.length === 0 ? (
          <p style={{ marginTop: 0, color: "#b5c6de" }}>No low-confidence symbols in current snapshot.</p>
        ) : (
          lowConfidence.map((row) => (
            <p key={`low-${row.symbol}`} style={{ margin: "0.2rem 0", color: "#d9e2f2" }}>
              <strong>{row.symbol}</strong> - {row.confidence.toFixed(0)}% confidence - origin {row.dataOrigin}
            </p>
          ))
        )}
        <p style={{ margin: "0.65rem 0 0.25rem 0", color: "#89a0bf" }}>Fallback/proxy-dependent symbols</p>
        {fallbackHeavy.length === 0 ? (
          <p style={{ marginTop: 0, color: "#b5c6de" }}>No fallback-heavy symbols in current snapshot.</p>
        ) : (
          fallbackHeavy.map((row) => (
            <p key={`fallback-${row.symbol}`} style={{ margin: "0.2rem 0", color: "#d9e2f2" }}>
              <strong>{row.symbol}</strong> - {row.dataOrigin} - live fields: {row.liveFieldCoverage.length > 0 ? row.liveFieldCoverage.join(", ") : "none"}
            </p>
          ))
        )}
      </section>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Recent Intelligence Changes</h3>
        <p style={{ marginBottom: "0.35rem", color: "#89a0bf" }}>Recent score jumps / drops</p>
        {scoreChanges.length === 0 ? (
          <p style={{ marginTop: 0, color: "#b5c6de" }}>No material score changes captured yet.</p>
        ) : (
          scoreChanges.map((event, idx) => (
            <p key={`score-change-${idx}`} style={{ margin: "0.2rem 0", color: "#d9e2f2" }}>
              <strong>{event.symbol}</strong> - {event.message}
            </p>
          ))
        )}
        <p style={{ margin: "0.75rem 0 0.35rem 0", color: "#89a0bf" }}>Recent catalyst changes</p>
        {catalystChanges.length === 0 ? (
          <p style={{ marginTop: 0, color: "#b5c6de" }}>No catalyst transitions captured yet.</p>
        ) : (
          catalystChanges.map((event, idx) => (
            <p key={`catalyst-change-${idx}`} style={{ margin: "0.2rem 0", color: "#d9e2f2" }}>
              <strong>{event.symbol}</strong> - {event.message}
            </p>
          ))
        )}
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Alert Diagnostics</h3>
        <p style={{ marginBottom: "0.35rem", color: "#89a0bf" }}>High-severity alerts (critical/high)</p>
        {highSeverityAlerts.length === 0 ? (
          <p style={{ marginTop: 0, color: "#b5c6de" }}>No high-severity alerts in memory.</p>
        ) : (
          highSeverityAlerts.map((alert) => (
            <p key={`sev-${alert.id}`} style={{ margin: "0.2rem 0", color: "#d9e2f2" }}>
              <strong>{alert.symbol}</strong> - <span className={scoreTone(alert.severity === "critical" ? 90 : 72)}>{alert.severity}</span> - {alert.alertType} - {alert.status}
            </p>
          ))
        )}
        <p style={{ margin: "0.75rem 0 0.35rem 0", color: "#89a0bf" }}>Downgraded / resolved alerts</p>
        {downgradedOrResolved.length === 0 ? (
          <p style={{ marginTop: 0, color: "#b5c6de" }}>No downgraded or resolved alerts in memory.</p>
        ) : (
          downgradedOrResolved.map((alert) => (
            <p key={`state-${alert.id}`} style={{ margin: "0.2rem 0", color: "#d9e2f2" }}>
              <strong>{alert.symbol}</strong> - {alert.alertType} - {alert.status} ({new Date(alert.updatedAt).toLocaleString()})
            </p>
          ))
        )}
      </section>
    </main>
  );
}
