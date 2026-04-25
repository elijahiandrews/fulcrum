import type { ExplainabilityBreakdown } from "../lib/intel/types";

export type FulcrumBrainVizProps = {
  idPrefix?: string;
  regionTally: Record<"US" | "Europe" | "Asia", number>;
  avgBreakdown: ExplainabilityBreakdown;
  bookAvgScore: number;
  bookAvgConfidence: number;
};

export function FulcrumBrainViz({
  idPrefix = "brain",
  regionTally: _regionTally,
  avgBreakdown,
  bookAvgScore,
  bookAvgConfidence
}: FulcrumBrainVizProps) {
  const p = idPrefix;
  const confPct = Math.min(100, Math.max(0, bookAvgConfidence)).toFixed(0);
  const score = bookAvgScore.toFixed(1);
  const codeDensity = Math.max(0.35, Math.min(1, avgBreakdown.volumePressure / 100));
  const glowOpacity = 0.16 + (avgBreakdown.liquidityPressure / 100) * 0.18;
  const ringStroke = 0.7 + codeDensity * 0.45;

  const snippets = [
    "if(signal.confidence>0.72){queue.promote(symbol)}",
    "score=0.28*short+0.23*options+0.18*volume+0.16*catalyst+0.15*liq",
    "while(book.live){ingest();normalize();rank();}",
    "provenance.attach(channel,freshnessMinutes)",
    "alerts.emit(thresholdCross,optionsAccel,volumeSpike)",
    "fulcrum::fusion_core -> explainability[] -> output"
  ];

  return (
    <figure className="fulcrum-brain">
      <svg
        className="fulcrum-brain-svg"
        viewBox="0 0 920 560"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby={`${p}-title ${p}-desc`}
      >
        <title id={`${p}-title`}>Fulcrum code brain</title>
        <desc id={`${p}-desc`}>
          Animated code-rings orbit in opposing directions to form a loose open sphere with a subtle green glow behind the center.
          The structure represents Fulcrum fusion logic and real-time evaluation.
        </desc>

        <defs>
          <radialGradient id={`${p}-green-glow`} cx="50%" cy="48%" r="48%">
            <stop offset="0%" stopColor={`rgba(22, 163, 74, ${glowOpacity.toFixed(3)})`} />
            <stop offset="50%" stopColor={`rgba(22, 163, 74, ${(glowOpacity * 0.55).toFixed(3)})`} />
            <stop offset="100%" stopColor="rgba(22,163,74,0)" />
          </radialGradient>
          <linearGradient id={`${p}-ring-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(15,23,42,0.15)" />
            <stop offset="38%" stopColor="rgba(15,118,110,0.58)" />
            <stop offset="64%" stopColor="rgba(13,148,136,0.72)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.22)" />
          </linearGradient>
          <filter id={`${p}-soft`} x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="1.25" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <ellipse id={`${p}-ring-a`} cx="460" cy="264" rx="178" ry="62" />
          <ellipse id={`${p}-ring-b`} cx="460" cy="266" rx="154" ry="54" />
          <ellipse id={`${p}-ring-c`} cx="460" cy="268" rx="132" ry="46" />
          <ellipse id={`${p}-ring-d`} cx="460" cy="270" rx="108" ry="38" />
        </defs>

        <text className="fulcrum-brain-eyebrow" x="460" y="36" textAnchor="middle">
          Code fusion cortex · live scoring geometry
        </text>

        <g className="code-brain-glow">
          <ellipse cx="460" cy="266" rx="260" ry="124" fill={`url(#${p}-green-glow)`} />
          <ellipse cx="460" cy="266" rx="212" ry="98" fill="rgba(255,255,255,0.24)" />
        </g>

        <g className="code-brain-lobes">
          {[192, 168, 144, 120, 96].map((rx, idx) => (
            <ellipse
              key={rx}
              cx="460"
              cy="266"
              rx={rx}
              ry={Math.round(rx * 0.345)}
              fill="none"
              stroke={`url(#${p}-ring-stroke)`}
              strokeOpacity={0.22 + idx * 0.095}
              strokeWidth={ringStroke}
              className={`code-brain-static-ring code-brain-static-ring--${idx + 1}`}
            />
          ))}
        </g>

        <g className="code-brain-rings" filter={`url(#${p}-soft)`}>
          <g className="code-ring code-ring--a">
            <use href={`#${p}-ring-a`} fill="none" stroke={`url(#${p}-ring-stroke)`} strokeWidth={ringStroke + 0.45} strokeOpacity="0.6" />
            <text className="code-ring-text">
              <textPath href={`#${p}-ring-a`} startOffset="3%">
                {snippets[0]} · {snippets[1]} · {snippets[2]} ·
              </textPath>
            </text>
          </g>
          <g className="code-ring code-ring--b">
            <use href={`#${p}-ring-b`} fill="none" stroke={`url(#${p}-ring-stroke)`} strokeWidth={ringStroke + 0.3} strokeOpacity="0.52" />
            <text className="code-ring-text">
              <textPath href={`#${p}-ring-b`} startOffset="9%">
                {snippets[3]} · {snippets[4]} · {snippets[5]} ·
              </textPath>
            </text>
          </g>
          <g className="code-ring code-ring--c">
            <use href={`#${p}-ring-c`} fill="none" stroke={`url(#${p}-ring-stroke)`} strokeWidth={ringStroke + 0.2} strokeOpacity="0.48" />
            <text className="code-ring-text">
              <textPath href={`#${p}-ring-c`} startOffset="16%">
                {snippets[1]} · {snippets[2]} · {snippets[3]} ·
              </textPath>
            </text>
          </g>
          <g className="code-ring code-ring--d">
            <use href={`#${p}-ring-d`} fill="none" stroke={`url(#${p}-ring-stroke)`} strokeWidth={ringStroke + 0.1} strokeOpacity="0.45" />
            <text className="code-ring-text">
              <textPath href={`#${p}-ring-d`} startOffset="24%">
                {snippets[4]} · {snippets[0]} · {snippets[5]} ·
              </textPath>
            </text>
          </g>
        </g>

        <g className="code-brain-core" aria-hidden>
          <ellipse cx="460" cy="266" rx="76" ry="26" fill="rgba(255,255,255,0.88)" stroke="rgba(15,23,42,0.14)" strokeWidth="0.9" />
          <ellipse cx="460" cy="266" rx="54" ry="18" fill="rgba(255,255,255,0.96)" />
        </g>

        <g className="code-brain-labels">
          <text className="fulcrum-core-title" x="460" y="260" textAnchor="middle">
            CODE BRAIN
          </text>
          <text className="fulcrum-core-sub" x="460" y="279" textAnchor="middle">
            fusion rings · open-core geometry
          </text>
        </g>

        <g transform="translate(668 198)">
          <rect x="0" y="0" width="214" height="136" rx="11" fill="rgba(255,255,255,0.93)" stroke="rgba(15,23,42,0.11)" strokeWidth="1" />
          <text className="fulcrum-out-label" x="106" y="28" textAnchor="middle">
            Live output
          </text>
          <text className="fulcrum-out-k" x="20" y="58">
            Book score
          </text>
          <text className="fulcrum-out-val" x="194" y="58" textAnchor="end">
            {score}
          </text>
          <text className="fulcrum-out-k" x="20" y="84">
            Confidence
          </text>
          <text className="fulcrum-out-conf" x="194" y="84" textAnchor="end">
            {confPct}%
          </text>
          <text className="fulcrum-out-k" x="20" y="110">
            Lanes
          </text>
          <text className="fulcrum-out-k" x="194" y="110" textAnchor="end">
            short · opt · tape · cat · liq
          </text>
        </g>

        <text className="fulcrum-brain-foot" x="460" y="545" textAnchor="middle">
          Concentric code-rings orbit around an open core to visualize continuous Fulcrum evaluation and explainable signal fusion.
        </text>
      </svg>
    </figure>
  );
}
