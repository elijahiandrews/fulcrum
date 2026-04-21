import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgres://squeeze:squeeze@localhost:5432/squeezeintel"
});

export interface ScoreRow {
  security_id: string;
  symbol: string;
  primary_exchange: string;
  region_code: string;
  total_score: number;
  confidence: number;
  risk_band: "low" | "elevated" | "high" | "critical";
  computed_at: string;
  explanation: string[];
  source_freshness: Array<{ sourceKey: string; freshnessSeconds: number; provenance: string }>;
}

export async function getLatestScores(region?: string): Promise<ScoreRow[]> {
  const where = region ? "WHERE ss.region_code = $1" : "";
  const params = region ? [region] : [];
  const q = `
    SELECT DISTINCT ON (ss.security_id)
      ss.security_id, sec.symbol, sec.primary_exchange, ss.region_code,
      ss.total_score::float, ss.confidence::float, ss.risk_band, ss.computed_at::text,
      ss.explanation, ss.source_freshness
    FROM squeeze_scores ss
    JOIN securities sec ON sec.id = ss.security_id
    ${where}
    ORDER BY ss.security_id, ss.computed_at DESC
  `;
  const { rows } = await pool.query<ScoreRow>(q, params);
  return rows;
}

export async function getAlerts() {
  const { rows } = await pool.query(
    `SELECT a.id, a.security_id, a.severity, a.message, a.created_at::text
     FROM alerts a ORDER BY a.created_at DESC LIMIT 50`
  );
  return rows;
}
