/**
 * Shared morphing HUD geometry — used by the ambient backdrop and the landing hero stage.
 * Server-safe (no hooks); animations are CSS-driven from globals.css.
 * `idPrefix` avoids duplicate gradient/filter IDs when two SVGs mount on one page.
 */
export function SystemGeometry({
  variant = "backdrop",
  idPrefix = "geo"
}: {
  variant?: "backdrop" | "hero";
  idPrefix?: string;
}) {
  const isHero = variant === "hero";
  const meshClass = `cortex-mesh system-geometry${isHero ? " system-geometry--hero" : ""}`;
  const ink = `${idPrefix}-hudInk`;
  const inkHero = `${idPrefix}-hudInkHero`;
  const glow = `${idPrefix}-hudGlow`;
  const glowHero = `${idPrefix}-hudGlowHero`;

  return (
    <svg className={meshClass} viewBox="0 0 1200 800" preserveAspectRatio={isHero ? "xMidYMid meet" : "xMidYMid slice"}>
      <defs>
        <linearGradient id={ink} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(15, 23, 42, 0)" />
          <stop offset="40%" stopColor="rgba(15, 23, 42, 0.14)" />
          <stop offset="100%" stopColor="rgba(13, 148, 136, 0.12)" />
        </linearGradient>
        <linearGradient id={inkHero} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(15, 23, 42, 0)" />
          <stop offset="35%" stopColor="rgba(15, 23, 42, 0.22)" />
          <stop offset="100%" stopColor="rgba(13, 148, 136, 0.28)" />
        </linearGradient>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={glowHero} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation={isHero ? 1.2 : 0.9} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="cortex-field-halos" aria-hidden>
        {[
          { cx: 180, cy: 160, r: 28 },
          { cx: 640, cy: 380, r: 32 },
          { cx: 980, cy: 220, r: 26 }
        ].map((h, i) => (
          <g key={`${h.cx}-${h.cy}`} transform={`translate(${h.cx} ${h.cy})`} className={`cortex-field-halo cortex-field-halo--${i + 1}`}>
            <circle cx={0} cy={0} r={h.r} fill="none" stroke="rgba(13,148,136,0.14)" strokeWidth="0.75" vectorEffect="nonScalingStroke" />
            <circle cx={0} cy={0} r={h.r * 0.62} fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth="0.6" vectorEffect="nonScalingStroke" />
          </g>
        ))}
      </g>

      <g transform="translate(600 380)">
        <g className="cortex-breath-nexus" aria-hidden>
          {[40, 72, 108, 152, 198].map((r, i) => (
            <g key={r} className={`cortex-breath-pulse cortex-breath-pulse--${(i % 5) + 1}`}>
              <circle
                cx={0}
                cy={0}
                r={r}
                fill="none"
                stroke={i % 2 === 0 ? "rgba(13,148,136,0.16)" : "rgba(15,23,42,0.1)"}
                strokeWidth={0.7 + (i % 3) * 0.15}
                vectorEffect="nonScalingStroke"
              />
            </g>
          ))}
        </g>
        <g className="hud-iso-root" filter={isHero ? `url(#${glowHero})` : `url(#${glow})`}>
          <g className="hud-rhomb hud-rhomb-a">
            <path
              d="M 0,-90 L 78,-45 L 0,0 L -78,-45 Z"
              fill="none"
              stroke={isHero ? "rgba(15,23,42,0.32)" : "rgba(15,23,42,0.2)"}
              strokeWidth={isHero ? 1.6 : 1.2}
              vectorEffect="nonScalingStroke"
            />
            <path
              d="M 0,-90 L 0,0"
              stroke={isHero ? "rgba(13,148,136,0.55)" : "rgba(13,148,136,0.35)"}
              strokeWidth={isHero ? 1.15 : 0.85}
              vectorEffect="nonScalingStroke"
            />
            <path
              d="M -78,-45 L 78,-45"
              stroke={isHero ? "rgba(15,23,42,0.22)" : "rgba(15,23,42,0.14)"}
              strokeWidth={isHero ? 1.05 : 0.8}
              vectorEffect="nonScalingStroke"
            />
          </g>
          <g className="hud-rhomb hud-rhomb-b">
            <path
              d="M 0,-55 L 52,-28 L 0,12 L -52,-28 Z"
              fill="none"
              stroke={isHero ? "rgba(13,148,136,0.58)" : "rgba(13,148,136,0.42)"}
              strokeWidth={isHero ? 1.35 : 1}
              vectorEffect="nonScalingStroke"
            />
          </g>
          <g className="hud-rhomb hud-rhomb-c">
            <path
              d="M 0,-120 L 95,-60 L 0,0 L -95,-60 Z"
              fill="none"
              stroke={isHero ? "rgba(15,23,42,0.2)" : "rgba(15,23,42,0.12)"}
              strokeWidth={isHero ? 1.2 : 0.9}
              strokeDasharray="6 10"
              vectorEffect="nonScalingStroke"
            />
          </g>
          {isHero ? (
            <g className="hud-rhomb hud-rhomb-d" opacity={0.85}>
              <circle r="118" fill="none" stroke="rgba(13,148,136,0.18)" strokeWidth="1" vectorEffect="nonScalingStroke" />
              <circle r="86" fill="none" stroke="rgba(15,23,42,0.12)" strokeWidth="0.9" strokeDasharray="4 8" vectorEffect="nonScalingStroke" />
            </g>
          ) : null}
        </g>
      </g>

      <g
        className="cortex-paths"
        fill="none"
        stroke={isHero ? `url(#${inkHero})` : `url(#${ink})`}
        strokeWidth={isHero ? 0.85 : 0.65}
        strokeLinecap="round"
      >
        <path d="M0,120 Q300,80 520,200 T920,140 T1200,220" />
        <path d="M0,380 Q400,320 640,420 T1200,360" />
        <path d="M80,800 Q420,520 720,600 T1200,480" />
        <path d="M200,0 Q480,200 760,120 T1100,280" opacity="0.75" />
      </g>

      <circle
        className="cortex-node cortex-node-a"
        cx="180"
        cy="160"
        r={isHero ? 2.8 : 2.2}
        fill={isHero ? "rgba(13,148,136,0.7)" : "rgba(13,148,136,0.55)"}
      />
      <circle
        className="cortex-node cortex-node-b"
        cx="640"
        cy="380"
        r={isHero ? 2.4 : 2}
        fill={isHero ? "rgba(15,23,42,0.45)" : "rgba(15,23,42,0.35)"}
      />
      <circle
        className="cortex-node cortex-node-c"
        cx="980"
        cy="220"
        r={isHero ? 2.4 : 2}
        fill={isHero ? "rgba(13,148,136,0.58)" : "rgba(13,148,136,0.45)"}
      />
    </svg>
  );
}
