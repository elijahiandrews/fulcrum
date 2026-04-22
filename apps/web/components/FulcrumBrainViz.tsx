import type { ExplainabilityBreakdown } from "../lib/intel/types";

/** Matches weight order in `lib/intel/scoring.ts` — same axes as every live row’s explainability block. */
const LANE_META: {
  key: keyof ExplainabilityBreakdown;
  label: string;
  abbr: string;
  weight: number;
}[] = [
  { key: "shortPressure", label: "Short & borrow", abbr: "SHORT", weight: 0.28 },
  { key: "optionsPressure", label: "Derivatives surface", abbr: "OPT", weight: 0.23 },
  { key: "volumePressure", label: "Tape & volume", abbr: "TAPE", weight: 0.18 },
  { key: "catalystPressure", label: "Catalyst stack", abbr: "CAT", weight: 0.16 },
  { key: "liquidityPressure", label: "Liquidity & float", abbr: "LIQ", weight: 0.15 }
];

export type FulcrumBrainVizProps = {
  idPrefix?: string;
  regionTally: Record<"US" | "Europe" | "Asia", number>;
  avgBreakdown: ExplainabilityBreakdown;
  bookAvgScore: number;
  bookAvgConfidence: number;
};

function laneStroke(key: keyof ExplainabilityBreakdown, avg: ExplainabilityBreakdown): number {
  const v = avg[key] / 100;
  return 1.35 + 3.2 * v;
}

function laneOpacity(key: keyof ExplainabilityBreakdown, avg: ExplainabilityBreakdown): number {
  return 0.35 + 0.55 * (avg[key] / 100);
}

function regionRadius(count: number, max: number): number {
  if (max <= 0) return 16;
  return 12 + 14 * (count / max);
}

/**
 * Architectural diagram of Fulcrum: regional universes → signal lanes (explainability axes) → fusion core → book output.
 * Lane weights and labels mirror `computeFulcrumScore`; averages animate intensity from the live monitor list.
 */
export function FulcrumBrainViz({
  idPrefix = "brain",
  regionTally,
  avgBreakdown,
  bookAvgScore,
  bookAvgConfidence
}: FulcrumBrainVizProps) {
  const p = idPrefix;
  const maxReg = Math.max(regionTally.US, regionTally.Europe, regionTally.Asia, 1);
  const rUs = regionRadius(regionTally.US, maxReg);
  const rEu = regionRadius(regionTally.Europe, maxReg);
  const rAs = regionRadius(regionTally.Asia, maxReg);

  const scoreH = Math.min(100, Math.max(0, bookAvgScore));
  const confPct = Math.min(100, Math.max(0, bookAvgConfidence));

  const laneY = [232, 252, 272, 292, 310];
  const fuseX = 402;
  const fuseY = 278;

  return (
    <figure className="fulcrum-brain">
      <svg
        className="fulcrum-brain-svg"
        viewBox="0 0 920 560"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby={`${p}-title ${p}-desc`}
      >
        <title id={`${p}-title`}>Fulcrum intelligence pipeline</title>
        <desc id={`${p}-desc`}>
          Regional ingest feeds five explainability lanes—short, options, tape, catalyst, and liquidity—fused into a single squeeze score.
          Current book averages drive lane emphasis; output shows monitor book average score and confidence.
        </desc>

        <defs>
          <linearGradient id={`${p}-ink`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(13, 148, 136, 0.15)" />
            <stop offset="50%" stopColor="rgba(13, 148, 136, 0.45)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.25)" />
          </linearGradient>
          <linearGradient id={`${p}-core`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.98)" />
          </linearGradient>
          <linearGradient id={`${p}-merge`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(13,148,136,0.35)" />
            <stop offset="50%" stopColor="rgba(13,148,136,0.5)" />
            <stop offset="100%" stopColor="rgba(13,148,136,0.35)" />
          </linearGradient>
          <filter id={`${p}-soft`} x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="fulcrum-breath-field" aria-hidden>
          <g transform="translate(460 278)">
            {[26, 48, 74, 104, 138].map((r, i) => (
              <g key={r} className={`fulcrum-breath-pulse fulcrum-breath-pulse--${(i % 5) + 1}`}>
                <circle
                  cx={0}
                  cy={0}
                  r={r}
                  fill="none"
                  stroke={i % 2 === 0 ? "rgba(13,148,136,0.2)" : "rgba(15,23,42,0.11)"}
                  strokeWidth={0.65 + (i % 3) * 0.12}
                  vectorEffect="nonScalingStroke"
                />
              </g>
            ))}
          </g>
          <g transform="translate(200 78)">
            <g className="fulcrum-breath-pulse fulcrum-breath-pulse--2">
              <circle cx={0} cy={0} r={34} fill="none" stroke="rgba(13,148,136,0.16)" strokeWidth="0.85" vectorEffect="nonScalingStroke" />
            </g>
          </g>
          <g transform="translate(460 70)">
            <g className="fulcrum-breath-pulse fulcrum-breath-pulse--4">
              <circle cx={0} cy={0} r={36} fill="none" stroke="rgba(13,148,136,0.18)" strokeWidth="0.9" vectorEffect="nonScalingStroke" />
            </g>
          </g>
          <g transform="translate(720 78)">
            <g className="fulcrum-breath-pulse fulcrum-breath-pulse--3">
              <circle cx={0} cy={0} r={34} fill="none" stroke="rgba(13,148,136,0.16)" strokeWidth="0.85" vectorEffect="nonScalingStroke" />
            </g>
          </g>
          <g transform="translate(788 278)">
            <g className="fulcrum-breath-pulse fulcrum-breath-pulse--1">
              <circle cx={0} cy={0} r={44} fill="none" stroke="rgba(13,148,136,0.12)" strokeWidth="0.75" vectorEffect="nonScalingStroke" />
            </g>
          </g>
        </g>

        <text className="fulcrum-brain-eyebrow" x="460" y="34" textAnchor="middle">
          Regional ingest → signal lanes → fusion core
        </text>

        <g className="fulcrum-brain-regions">
          <g transform={`translate(200 ${78})`}>
            <circle r={rUs} cx={0} cy={0} fill="rgba(255,255,255,0.85)" stroke="rgba(13,148,136,0.45)" strokeWidth="1.2" />
            <text className="fulcrum-brain-region-label" y="4" textAnchor="middle">
              US
            </text>
            <title>{`US listings · ${regionTally.US} on book`}</title>
          </g>
          <g transform={`translate(460 ${70})`}>
            <circle r={rEu} cx={0} cy={0} fill="rgba(255,255,255,0.92)" stroke="rgba(13,148,136,0.55)" strokeWidth="1.35" />
            <text className="fulcrum-brain-region-label" y="4" textAnchor="middle">
              EU
            </text>
            <title>{`Europe · ${regionTally.Europe} on book`}</title>
          </g>
          <g transform={`translate(720 ${78})`}>
            <circle r={rAs} cx={0} cy={0} fill="rgba(255,255,255,0.85)" stroke="rgba(13,148,136,0.45)" strokeWidth="1.2" />
            <text className="fulcrum-brain-region-label" y="4" textAnchor="middle">
              AS
            </text>
            <title>{`Asia · ${regionTally.Asia} on book`}</title>
          </g>
        </g>

        <path
          className="fulcrum-brain-trace fulcrum-brain-merge"
          fill="none"
          stroke={`url(#${p}-merge)`}
          strokeWidth="1.1"
          strokeLinecap="round"
          d="M 200 106 Q 330 142 460 152 Q 590 142 720 106"
        />

        <rect
          x="378"
          y="162"
          width="164"
          height="30"
          rx="8"
          fill="rgba(255,255,255,0.9)"
          stroke="rgba(15,23,42,0.12)"
          strokeWidth="1"
        />
        <text className="fulcrum-brain-capsule" x="460" y="182" textAnchor="middle">
          Universe · normalized features
        </text>

        <line x1="460" y1="192" x2="460" y2="218" stroke="rgba(15,23,42,0.2)" strokeWidth="1" />

        <g className="fulcrum-brain-lanes-paths">
          {LANE_META.map((lane, i) => {
            const y = laneY[i] ?? 232;
            const w = laneStroke(lane.key, avgBreakdown);
            const o = laneOpacity(lane.key, avgBreakdown);
            const bx = 72;
            const cx1 = 260 + i * 8;
            const cx2 = 330 + i * 6;
            return (
              <path
                key={`p-${lane.key}`}
                className="fulcrum-brain-trace fulcrum-brain-lane-path"
                fill="none"
                stroke="rgba(13, 148, 136, 0.9)"
                strokeOpacity={o}
                strokeWidth={w}
                strokeLinecap="round"
                d={`M ${bx + 108} ${y} C ${cx1} ${y} ${cx2} ${fuseY + (i - 2) * 3} ${fuseX} ${fuseY}`}
              />
            );
          })}
        </g>

        <g filter={`url(#${p}-soft)`}>
          <title>Fusion core — same weighted blend as lib/intel/scoring.ts</title>
          <polygon
            className="fulcrum-core"
            points={`460,218 518,278 460,338 ${fuseX},${fuseY}`}
            fill={`url(#${p}-core)`}
            stroke="rgba(13,148,136,0.5)"
            strokeWidth="1.4"
          />
        </g>
        <text className="fulcrum-core-title" x="460" y="275" textAnchor="middle">
          FULCRUM
        </text>
        <text className="fulcrum-core-sub" x="460" y="298" textAnchor="middle">
          Σ weighted fusion
        </text>

        <g className="fulcrum-brain-lane-chips">
          {LANE_META.map((lane, i) => {
            const y = laneY[i] ?? 232;
            const o = laneOpacity(lane.key, avgBreakdown);
            const bx = 72;
            const by = y - 18;
            return (
              <g key={lane.key}>
                <title>{`${lane.label} · book avg axis · model weight ${(lane.weight * 100).toFixed(0)}%`}</title>
                <rect
                  x={bx}
                  y={by}
                  width="108"
                  height="36"
                  rx="6"
                  fill="rgba(255,255,255,0.92)"
                  stroke={`rgba(13,148,136,${0.28 + o * 0.35})`}
                  strokeWidth="1"
                />
                <text className="fulcrum-brain-lane-abbr" x={bx + 54} y={y + 4} textAnchor="middle">
                  {lane.abbr}
                </text>
              </g>
            );
          })}
        </g>

        <path
          className="fulcrum-brain-trace"
          fill="none"
          stroke={`url(#${p}-ink)`}
          strokeWidth="2.2"
          strokeLinecap="round"
          d={`M 518 278 L 688 278`}
        />

        <g transform="translate(688 218)">
          <rect x="0" y="0" width="200" height="120" rx="10" fill="rgba(255,255,255,0.92)" stroke="rgba(15,23,42,0.1)" strokeWidth="1" />
          <text className="fulcrum-out-label" x="100" y="26" textAnchor="middle">
            Book output
          </text>
          <text className="fulcrum-out-k" x="24" y="58">
            Squeeze index
          </text>
          <rect x="140" y="38" width="44" height="62" rx="4" fill="rgba(241,245,249,0.95)" stroke="rgba(15,23,42,0.12)" strokeWidth="1" />
          <rect
            x="142"
            y={40 + (60 - (scoreH / 100) * 58)}
            width="40"
            height={(scoreH / 100) * 58}
            rx="2"
            fill="rgba(13,148,136,0.55)"
          />
          <text className="fulcrum-out-val" x="118" y="92" textAnchor="end">
            {bookAvgScore.toFixed(1)}
          </text>
          <text className="fulcrum-out-k" x="24" y="112">
            Confidence
          </text>
          <text className="fulcrum-out-conf" x="176" y="112" textAnchor="end">
            {confPct.toFixed(0)}%
          </text>
        </g>

        <text className="fulcrum-brain-foot" x="460" y="545" textAnchor="middle">
          Axes match explainability on every symbol row · weights = short 28% · opt 23% · tape 18% · cat 16% · liq 15%
        </text>
      </svg>
    </figure>
  );
}
