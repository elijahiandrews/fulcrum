import { getAlerts } from "../../lib/db";

const tone: Record<string, string> = {
  critical: "score-critical",
  high: "score-high",
  elevated: "score-elevated",
  low: "score-low"
};

const statusBadge = (status: "active" | "resolved" | "downgraded"): string => {
  if (status === "active") return "badge badge-active";
  if (status === "resolved") return "badge badge-resolved";
  return "badge badge-downgraded";
};

export default async function AlertsCenterPage() {
  const alerts = await getAlerts();
  const activeAlerts = alerts.filter((alert) => alert.status === "active");
  const historicalAlerts = alerts.filter((alert) => alert.status !== "active");

  return (
    <main className="container page">
      <div className="terminal-bar">
        <div>
          <div className="terminal-kicker">Operational feed</div>
          <h1 className="page-title" style={{ fontSize: "1.85rem", marginBottom: 0 }}>
            Alerts center
          </h1>
        </div>
        <span className="chip">
          {activeAlerts.length} active · {historicalAlerts.length} cleared / adjusted
        </span>
      </div>
      <p className="page-subtitle">
        Threshold crossings and state transitions emitted from the same Fulcrum Intelligence snapshot engine as Platform — score, tape, options, and
        catalyst channels.
      </p>
      <section className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Active alerts
        </h2>
        {activeAlerts.length === 0 ? <p style={{ marginTop: 0, color: "var(--muted)" }}>No active alerts at current thresholds.</p> : null}
        {activeAlerts.map((a) => (
          <div key={a.id} style={{ padding: "0.75rem 0", borderTop: "1px solid var(--panel-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
              <p style={{ margin: 0 }}>
                <strong>{a.symbol}</strong> — {a.companyName}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <span className={statusBadge(a.status)}>{a.status}</span>
                <span className={tone[a.severity]} style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                  {a.severity.toUpperCase()}
                </span>
              </div>
            </div>
            <p style={{ margin: "0.35rem 0", color: "var(--muted2)", fontSize: "0.88rem" }}>
              <strong>{a.alertType}</strong> — {a.confidence}% model confidence — {new Date(a.timestamp).toLocaleString()}
            </p>
            <p style={{ marginTop: 0, color: "var(--text)" }}>{a.explanation}</p>
          </div>
        ))}
      </section>
      <section className="card">
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Recent / resolved history
        </h2>
        {historicalAlerts.length === 0 ? (
          <p style={{ marginTop: 0, color: "var(--muted)" }}>No resolved or downgraded alerts in the current memory window.</p>
        ) : null}
        {historicalAlerts.map((a) => (
          <div key={a.id} style={{ padding: "0.75rem 0", borderTop: "1px solid var(--panel-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
              <p style={{ margin: 0 }}>
                <strong>{a.symbol}</strong> — {a.companyName}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <span className={statusBadge(a.status)}>{a.status}</span>
                <span className={tone[a.severity]} style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                  {a.severity.toUpperCase()}
                </span>
              </div>
            </div>
            <p style={{ margin: "0.35rem 0", color: "var(--muted2)", fontSize: "0.88rem" }}>
              <strong>{a.alertType}</strong> — {new Date(a.timestamp).toLocaleString()} — {a.confidence}% confidence
            </p>
            <p style={{ marginTop: 0 }}>{a.explanation}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
