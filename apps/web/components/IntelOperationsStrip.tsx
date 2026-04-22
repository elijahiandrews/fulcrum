import Link from "next/link";
import type { ScoreRow } from "../lib/db";
import { riskBandFromScore } from "../lib/intel/riskBand";

export function IntelOperationsStrip({ rows }: { rows: ScoreRow[] }) {
  if (rows.length === 0) {
    return (
      <section className="intel-ops-strip card card--inset" aria-label="Evaluation queue">
        <p className="intel-ops-empty">No symbols in the monitored book.</p>
      </section>
    );
  }

  const sorted = [...rows].sort((a, b) => b.squeezeScore - a.squeezeScore);
  const primary = sorted[0];
  const queue = sorted.slice(1, 4);
  const topBand = riskBandFromScore(primary.squeezeScore);

  const lastRefresh = sorted.reduce((latest, r) => {
    const t = new Date(r.updatedAt).getTime();
    return t > latest ? t : latest;
  }, 0);

  return (
    <section className="intel-ops-strip" aria-label="Live evaluation queue">
      <div className="intel-ops-primary card card--elevated">
        <div className="intel-ops-primary-head">
          <span className="intel-ops-kicker">Primary evaluation</span>
          <span className={`intel-ops-band score-${topBand}`}>{topBand}</span>
        </div>
        <div className="intel-ops-primary-body">
          <Link href={`/symbol/${primary.symbol.toLowerCase()}`} className="intel-ops-symbol">
            {primary.symbol}
          </Link>
          <p className="intel-ops-company">{primary.companyName}</p>
        </div>
        <dl className="intel-ops-dl">
          <div>
            <dt>Composite</dt>
            <dd className={`data-mono score-${topBand}`}>{primary.squeezeScore.toFixed(1)}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd className="data-mono">{primary.confidence.toFixed(0)}%</dd>
          </div>
          <div>
            <dt>Input age</dt>
            <dd className="data-mono">~{primary.sourceFreshnessMinutes}m</dd>
          </div>
        </dl>
      </div>

      <div className="intel-ops-queue card card--inset">
        <h2 className="intel-ops-queue-title">Next in queue</h2>
        <ol className="intel-ops-queue-list">
          {queue.map((r, i) => {
            const band = riskBandFromScore(r.squeezeScore);
            return (
              <li key={r.symbol}>
                <div className="intel-ops-queue-line">
                  <span className="intel-ops-rank data-mono">{i + 2}</span>
                  <Link href={`/symbol/${r.symbol.toLowerCase()}`} className="intel-ops-queue-symbol">
                    {r.symbol}
                  </Link>
                  <span className={`intel-ops-queue-score data-mono score-${band}`}>{r.squeezeScore.toFixed(1)}</span>
                </div>
                <span className="intel-ops-queue-conf data-mono">{r.confidence.toFixed(0)}% confidence</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="intel-ops-meta card card--inset">
        <h2 className="intel-ops-queue-title">Book snapshot</h2>
        <ul className="intel-ops-meta-list">
          <li>
            <span className="intel-ops-meta-k">Symbols ranked</span>
            <span className="data-mono">{rows.length}</span>
          </li>
          <li>
            <span className="intel-ops-meta-k">Last channel refresh</span>
            <span className="data-mono">{lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : "—"}</span>
          </li>
          <li>
            <span className="intel-ops-meta-k">Evaluation order</span>
            <span>Composite squeeze score (desc)</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
