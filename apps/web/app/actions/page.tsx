import Link from "next/link";

import { getDataToActionItems } from "../../lib/db";

export default async function DataToActionPage() {
  const items = await getDataToActionItems(12);

  return (
    <main className="container" style={{ padding: "2rem 0 3rem 0", maxWidth: "42rem" }}>
      <h2 style={{ marginBottom: "0.35rem" }}>Data to action</h2>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        Raw coverage is normalized and scored upstream; this view keeps only names that pass an action gate, ranked by
        squeeze pressure vs. confidence.
      </p>
      <p style={{ color: "#6b7f96", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
        Pipeline: Data sources → Normalize → Score signals → Rank → Action. No row without an action.
      </p>

      {items.length === 0 ? (
        <p className="card" style={{ margin: 0, padding: "1rem 1.1rem", color: "var(--muted2)" }}>
          No actionable signals under current thresholds. Check back after the next snapshot refresh.
        </p>
      ) : (
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((row) => (
            <li key={row.symbol} className="card" style={{ marginBottom: "1rem", padding: "1rem 1.15rem" }}>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                Rank {row.rank} ·{" "}
                <Link href={`/symbol/${encodeURIComponent(row.symbol)}`} style={{ color: "var(--text)", fontWeight: 600 }}>
                  {row.symbol}
                </Link>{" "}
                · {row.region}
              </p>
              <p style={{ margin: "0.35rem 0", color: "#e8f0fa" }}>
                <strong>Signal:</strong> {row.signal}
              </p>
              <p style={{ margin: "0.35rem 0", color: "#e8f0fa" }}>
                <strong>Confidence:</strong> {row.confidence}%
              </p>
              <p style={{ margin: "0.35rem 0", color: "#e8f0fa" }}>
                <strong>Action:</strong> {row.action}
              </p>
              <p style={{ margin: "0.35rem 0", color: "#e8f0fa" }}>
                <strong>Expected outcome:</strong> {row.expectedOutcome}
              </p>
              <p style={{ margin: "0.35rem 0 0 0", color: "#e8f0fa" }}>
                <strong>Risk:</strong> {row.risk}
              </p>
            </li>
          ))}
        </ol>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#6b7f96" }}>
        Fulcrum Intelligence outputs decision support for qualified users, not personalized investment advice.
      </p>
    </main>
  );
}
