import Link from "next/link";
import { ScoreRow } from "../lib/db";

const freshnessLabel = (minutes: number) => `${minutes}m old`;
const bandFromScore = (score: number): "low" | "elevated" | "high" | "critical" =>
  score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "elevated" : "low";

export function ScoreTable({ rows }: { rows: ScoreRow[] }) {
  return (
    <div className="card">
      <table className="intel-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Squeeze</th>
            <th>Confidence</th>
            <th>Signal Drivers</th>
            <th>Catalyst</th>
            <th>Freshness</th>
            <th>Brief</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const band = bandFromScore(row.squeezeScore);
            return (
              <tr key={row.symbol}>
                <td>
                  <Link href={`/symbol/${row.symbol.toLowerCase()}`} style={{ fontWeight: 600 }}>{row.symbol}</Link>
                  <div style={{ color: "#89a0bf", fontSize: "0.78rem" }}>{row.companyName}</div>
                </td>
                <td className={`score-${band}`}>{row.squeezeScore.toFixed(1)} ({band})</td>
                <td>{row.confidence.toFixed(0)}%</td>
                <td>
                  <div style={{ color: "#d9e2f2" }}>Short {row.explainabilityBreakdown.shortPressure.toFixed(1)}</div>
                  <div style={{ color: "#d9e2f2" }}>Options {row.explainabilityBreakdown.optionsPressure.toFixed(1)}</div>
                </td>
                <td>
                  <div style={{ textTransform: "capitalize" }}>{row.catalystStatus}</div>
                  <div style={{ color: "#89a0bf", fontSize: "0.78rem" }}>RelVol {row.relativeVolume.toFixed(1)}x</div>
                </td>
                <td>
                  {freshnessLabel(row.sourceFreshnessMinutes)}
                  <div style={{ color: "#89a0bf", fontSize: "0.78rem" }}>{row.region} / {row.exchange}</div>
                </td>
                <td style={{ maxWidth: 360, color: "#b5c6de" }}>
                  {row.explanation}
                  <div style={{ marginTop: "0.3rem", color: "#89a0bf", fontSize: "0.78rem", textTransform: "capitalize" }}>
                    {row.dataOrigin.replace("-", " ")}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
