import Link from "next/link";
import { ScoreRow } from "../lib/db";

const freshnessLabel = (minutes: number) => `${minutes}m old`;
const bandFromScore = (score: number): "low" | "elevated" | "high" | "critical" =>
  score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "elevated" : "low";

export function ScoreTable({ rows }: { rows: ScoreRow[] }) {
  return (
    <div className="card">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
        <thead>
          <tr style={{ color: "#89a0bf", textAlign: "left" }}>
            <th style={{ paddingBottom: "0.65rem" }}>Symbol</th>
            <th style={{ paddingBottom: "0.65rem" }}>Squeeze</th>
            <th style={{ paddingBottom: "0.65rem" }}>Confidence</th>
            <th style={{ paddingBottom: "0.65rem" }}>Short</th>
            <th style={{ paddingBottom: "0.65rem" }}>Options</th>
            <th style={{ paddingBottom: "0.65rem" }}>Volume</th>
            <th style={{ paddingBottom: "0.65rem" }}>Catalyst</th>
            <th style={{ paddingBottom: "0.65rem" }}>Liquidity Sensitivity</th>
            <th style={{ paddingBottom: "0.65rem" }}>Freshness</th>
            <th style={{ paddingBottom: "0.65rem" }}>Origin</th>
            <th style={{ paddingBottom: "0.65rem" }}>Explainability</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const band = bandFromScore(row.squeezeScore);
            return (
              <tr key={row.symbol} style={{ borderTop: "1px solid #1e2a3f" }}>
                <td style={{ padding: "0.7rem 0" }}>
                  <Link href={`/symbol/${row.symbol.toLowerCase()}`} style={{ fontWeight: 600 }}>{row.symbol}</Link>
                  <div style={{ color: "#89a0bf", fontSize: "0.78rem" }}>{row.companyName}</div>
                </td>
                <td className={`score-${band}`}>{row.squeezeScore.toFixed(1)} ({band})</td>
                <td>{row.confidence.toFixed(0)}%</td>
                <td>{row.explainabilityBreakdown.shortPressure.toFixed(1)}</td>
                <td>{row.explainabilityBreakdown.optionsPressure.toFixed(1)}</td>
                <td>{row.relativeVolume.toFixed(1)}x</td>
                <td style={{ textTransform: "capitalize" }}>{row.catalystStatus}</td>
                <td style={{ textTransform: "capitalize" }}>{row.liquidityTightness}</td>
                <td>
                  {freshnessLabel(row.sourceFreshnessMinutes)}
                  <div style={{ color: "#89a0bf", fontSize: "0.78rem" }}>{row.region} / {row.exchange}</div>
                </td>
                <td style={{ textTransform: "capitalize" }}>{row.dataOrigin.replace("-", " ")}</td>
                <td style={{ maxWidth: 320, color: "#b5c6de" }}>{row.explanation}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
