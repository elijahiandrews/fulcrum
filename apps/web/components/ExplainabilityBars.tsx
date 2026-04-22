import type { ExplainabilityBreakdown } from "../lib/intel/types";

const LANES: Array<{ key: keyof ExplainabilityBreakdown; label: string }> = [
  { key: "shortPressure", label: "Short / float" },
  { key: "optionsPressure", label: "Options surface" },
  { key: "volumePressure", label: "Volume regime" },
  { key: "catalystPressure", label: "Catalyst" },
  { key: "liquidityPressure", label: "Liquidity / float" }
];

export function ExplainabilityBars({ breakdown }: { breakdown: ExplainabilityBreakdown }) {
  return (
    <ul className="data-hbar-list" aria-label="Model channel pressure, 0 to 100">
      {LANES.map(({ key, label }) => {
        const v = breakdown[key];
        const pct = Math.min(100, Math.max(0, v));
        return (
          <li key={key} className="data-hbar-row">
            <div className="data-hbar-label">
              <span>{label}</span>
              <span className="data-hbar-value data-mono">{v.toFixed(1)}</span>
            </div>
            <div className="data-hbar-track" role="presentation">
              <div className="data-hbar-fill" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
