import Link from "next/link";
import { ScoreRow } from "../lib/db";

const freshnessLabel = (sec: number) => {
  if (sec <= 300) return "Live / near real-time";
  if (sec <= 3600) return "Slightly delayed";
  return "Delayed regulatory/positioning";
};

export function ScoreTable({ rows }: { rows: ScoreRow[] }) {
  return (
    <div className="card">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
        <thead>
          <tr style={{ color: "#89a0bf", textAlign: "left" }}>
            <th>Symbol</th><th>Region</th><th>Squeeze Signal</th><th>Confidence</th><th>Freshness</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const avgFreshness = row.source_freshness.reduce((s, f) => s + f.freshnessSeconds, 0) / row.source_freshness.length;
            return (
              <tr key={row.security_id} style={{ borderTop: "1px solid #1e2a3f" }}>
                <td style={{ padding: "0.7rem 0" }}>
                  <Link href={`/symbol/${row.security_id}`}>{row.symbol}</Link>
                  <div style={{ color: "#89a0bf", fontSize: "0.78rem" }}>{row.primary_exchange}</div>
                </td>
                <td>{row.region_code}</td>
                <td className={`score-${row.risk_band}`}>{row.total_score.toFixed(1)} ({row.risk_band})</td>
                <td>{row.confidence.toFixed(0)}%</td>
                <td>{freshnessLabel(avgFreshness)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
