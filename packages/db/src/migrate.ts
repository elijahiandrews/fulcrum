import { pool } from "./index";

const sql = `
CREATE TABLE IF NOT EXISTS issuers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  region_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS securities (
  id TEXT PRIMARY KEY,
  issuer_id UUID NOT NULL REFERENCES issuers(id),
  symbol TEXT NOT NULL,
  isin TEXT,
  primary_exchange TEXT NOT NULL,
  currency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_snapshots (
  id UUID PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id),
  observed_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL,
  last_price NUMERIC NOT NULL,
  intraday_change_pct NUMERIC NOT NULL,
  volume BIGINT NOT NULL,
  volume_vs_avg NUMERIC NOT NULL,
  shares_float BIGINT NOT NULL,
  venue TEXT NOT NULL,
  source_key TEXT NOT NULL,
  source_type TEXT NOT NULL,
  freshness_seconds INTEGER NOT NULL,
  provenance TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS positioning_snapshots (
  id UUID PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id),
  observed_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL,
  short_interest_pct_float NUMERIC NOT NULL,
  borrow_fee_bps NUMERIC NOT NULL,
  utilization_pct NUMERIC NOT NULL,
  days_to_cover NUMERIC NOT NULL,
  is_estimated BOOLEAN NOT NULL,
  source_key TEXT NOT NULL,
  source_type TEXT NOT NULL,
  freshness_seconds INTEGER NOT NULL,
  provenance TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS options_snapshots (
  id UUID PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id),
  observed_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL,
  call_put_volume_ratio NUMERIC NOT NULL,
  near_term_iv_pct NUMERIC NOT NULL,
  gamma_exposure_score NUMERIC NOT NULL,
  source_key TEXT NOT NULL,
  source_type TEXT NOT NULL,
  freshness_seconds INTEGER NOT NULL,
  provenance TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS catalyst_events (
  id UUID PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id),
  occurred_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  impact_score NUMERIC NOT NULL,
  source_key TEXT NOT NULL,
  source_type TEXT NOT NULL,
  freshness_seconds INTEGER NOT NULL,
  provenance TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS squeeze_scores (
  id UUID PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id),
  region_code TEXT NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL,
  total_score NUMERIC NOT NULL,
  confidence NUMERIC NOT NULL,
  risk_band TEXT NOT NULL,
  market_pressure NUMERIC NOT NULL,
  positioning_stress NUMERIC NOT NULL,
  options_accel NUMERIC NOT NULL,
  catalyst_heat NUMERIC NOT NULL,
  explanation JSONB NOT NULL,
  source_freshness JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY,
  security_id TEXT NOT NULL REFERENCES securities(id),
  score_id UUID NOT NULL REFERENCES squeeze_scores(id),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ
);
`;

async function run(): Promise<void> {
  await pool.query(sql);
  await pool.end();
  console.log("Migration complete.");
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
