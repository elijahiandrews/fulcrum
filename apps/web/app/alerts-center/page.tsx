import { getAlerts } from "../../lib/db";

const tone: Record<string, string> = {
  critical: "score-critical",
  high: "score-high",
  elevated: "score-elevated",
  low: "score-low"
};

export default async function AlertsCenterPage() {
  const alerts = await getAlerts();
  const activeAlerts = alerts.filter((alert) => alert.status === "active");
  const historicalAlerts = alerts.filter((alert) => alert.status !== "active");
  const criticalActiveCount = activeAlerts.filter((alert) => alert.severity === "critical").length;

  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2 style={{ marginBottom: "0.35rem" }}>Alerts Center</h2>
      <p style={{ color: "#89a0bf", marginTop: 0 }}>
        Live operational feed for score transitions, options acceleration, and catalyst-linked pressure changes.
      </p>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.6rem" }}>
        <span className="chip">{activeAlerts.length} active alerts</span>
        <span className="chip">{criticalActiveCount} critical active alerts</span>
        <span className="chip">{historicalAlerts.length} historical events</span>
      </div>
      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Active Alerts</h3>
        {activeAlerts.length === 0 ? <p style={{ marginTop: 0, color: "#89a0bf" }}>No active alerts at current thresholds.</p> : null}
        {activeAlerts.map((a) => (
          <div key={a.id} style={{ padding: "0.65rem 0", borderTop: "1px solid #1e2a3f" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", flexWrap: "wrap" }}>
              <p style={{ margin: 0 }}><strong>{a.symbol}</strong> - {a.companyName}</p>
              <span className={tone[a.severity]} style={{ fontWeight: 600 }}>{a.severity.toUpperCase()}</span>
            </div>
            <p style={{ margin: "0.25rem 0", color: "#b5c6de" }}>
              {a.alertType} - {a.confidence}% confidence - {new Date(a.timestamp).toLocaleString()}
            </p>
            <p style={{ marginTop: 0 }}>{a.explanation}</p>
          </div>
        ))}
      </section>
      <section className="card">
        <h3 style={{ marginTop: 0 }}>Recent / Resolved History</h3>
        {historicalAlerts.length === 0 ? <p style={{ marginTop: 0, color: "#89a0bf" }}>No resolved or downgraded alerts yet.</p> : null}
        {historicalAlerts.map((a) => (
          <div key={a.id} style={{ padding: "0.65rem 0", borderTop: "1px solid #1e2a3f" }}>
            <p style={{ margin: 0 }}>
              <strong>{a.symbol}</strong> - {a.alertType} - <span style={{ textTransform: "capitalize" }}>{a.status}</span>
            </p>
            <p style={{ margin: "0.2rem 0", color: "#89a0bf" }}>
              {new Date(a.timestamp).toLocaleString()} - {a.confidence}% confidence
            </p>
            <p style={{ marginTop: 0 }}>{a.explanation}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
