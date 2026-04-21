import { getAlerts } from "../../lib/db";

const tone: Record<string, string> = {
  critical: "score-critical",
  high: "score-high",
  elevated: "score-elevated",
  low: "score-low"
};

export default async function AlertsPage() {
  const alerts = await getAlerts();
  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0" }}>
      <h2>Alerts Center</h2>
      <p style={{ color: "#89a0bf" }}>Event stream for pressure escalation and structural imbalance changes.</p>
      <div className="card">
        {alerts.map((a) => (
          <div key={a.id} style={{ padding: "0.55rem 0", borderBottom: "1px solid #1e2a3f" }}>
            <div className={tone[a.severity] ?? "score-low"} style={{ fontWeight: 600 }}>{a.severity.toUpperCase()} SIGNAL</div>
            <div>{a.message}</div>
            <div style={{ color: "#89a0bf", fontSize: "0.8rem" }}>{new Date(a.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
