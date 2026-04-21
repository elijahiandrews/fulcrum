import Link from "next/link";
import { ScoreRow } from "../lib/db";
import { riskBandFromScore } from "../lib/intel/riskBand";

const freshnessLabel = (minutes: number, updatedAt: string) =>
  `${minutes}m stack lag · ${new Date(updatedAt).toLocaleTimeString()}`;

const rowBandClass = (band: ReturnType<typeof riskBandFromScore>): string => {
  switch (band) {
    case "critical":
      return "row-band-critical";
    case "high":
      return "row-band-high";
    case "elevated":
      return "row-band-elevated";
    default:
      return "row-band-low";
  }
};

export function ScoreTable({ rows }: { rows: ScoreRow[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="table-scroll">
        <div className="intel-table-wrap">
          <table className="intel-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Squeeze</th>
                <th>Conf</th>
                <th>Short</th>
                <th>Options</th>
                <th>Vol Δ</th>
                <th>Catalyst</th>
                <th>Float / Liq</th>
                <th>Freshness</th>
                <th>Driver note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const band = riskBandFromScore(row.squeezeScore);
                const brief = row.explanation[0] ?? "";
                return (
                  <tr key={row.symbol} className={rowBandClass(band)}>
                    <td>
                      <Link href={`/symbol/${row.symbol.toLowerCase()}`} style={{ fontWeight: 600 }}>
                        {row.symbol}
                      </Link>
                      <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{row.companyName}</div>
                    </td>
                    <td className={`score-${band}`}>
                      {row.squeezeScore.toFixed(1)} <span style={{ color: "var(--muted)", fontWeight: 500 }}>({band})</span>
                    </td>
                    <td>{row.confidence.toFixed(0)}%</td>
                    <td>{row.explainabilityBreakdown.shortPressure.toFixed(1)}</td>
                    <td>{row.explainabilityBreakdown.optionsPressure.toFixed(1)}</td>
                    <td>{row.relativeVolume.toFixed(1)}×</td>
                    <td style={{ textTransform: "capitalize" }}>{row.catalystStatus}</td>
                    <td>
                      {row.floatSharesM.toFixed(0)}M float
                      <div style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "capitalize" }}>
                        {row.liquidityTightness} book
                      </div>
                    </td>
                    <td>
                      {freshnessLabel(row.sourceFreshnessMinutes, row.updatedAt)}
                      <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                        {row.region} / {row.exchange}
                      </div>
                    </td>
                    <td style={{ maxWidth: 340, color: "var(--muted2)", fontSize: "0.88rem" }}>{brief}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
