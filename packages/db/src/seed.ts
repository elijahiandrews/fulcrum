import crypto from "node:crypto";
import {
  computeExplainableScore,
  mockCatalystAdapter,
  mockMarketAdapter,
  mockOptionsAdapter,
  mockPositioningAdapter
} from "@squeeze/core";
import { pool } from "./index";

const uuid = () => crypto.randomUUID();

const issuers = [
  { id: "f22d9a5d-dc47-4020-a6ba-6905ac2ecf01", name: "GameStop Corp.", country: "US", region: "US" },
  { id: "1e0c271d-1f8c-4a14-89cd-cd9f81066931", name: "BT Group plc", country: "GB", region: "UK" },
  { id: "2e6f8651-30f9-4a1f-b3eb-ab718de21c31", name: "Aixtron SE", country: "DE", region: "EU" }
];

const securities = [
  { id: "GME.US", issuerId: issuers[0].id, symbol: "GME", isin: "US36467W1099", exchange: "NYSE", currency: "USD" },
  { id: "BTA.L", issuerId: issuers[1].id, symbol: "BT.A", isin: "GB0030913577", exchange: "LSE", currency: "GBP" },
  { id: "AIXA.DE", issuerId: issuers[2].id, symbol: "AIXA", isin: "DE000A0WMPJ6", exchange: "XETRA", currency: "EUR" }
];

async function run(): Promise<void> {
  await pool.query("DELETE FROM alerts");
  await pool.query("DELETE FROM squeeze_scores");
  await pool.query("DELETE FROM catalyst_events");
  await pool.query("DELETE FROM options_snapshots");
  await pool.query("DELETE FROM positioning_snapshots");
  await pool.query("DELETE FROM market_snapshots");
  await pool.query("DELETE FROM securities");
  await pool.query("DELETE FROM issuers");

  for (const issuer of issuers) {
    await pool.query(
      "INSERT INTO issuers (id, name, country_code, region_code) VALUES ($1, $2, $3, $4)",
      [issuer.id, issuer.name, issuer.country, issuer.region]
    );
  }

  for (const security of securities) {
    await pool.query(
      "INSERT INTO securities (id, issuer_id, symbol, isin, primary_exchange, currency) VALUES ($1, $2, $3, $4, $5, $6)",
      [security.id, security.issuerId, security.symbol, security.isin, security.exchange, security.currency]
    );
  }

  const markets = await mockMarketAdapter.fetchMarketSnapshots();
  const positioning = await mockPositioningAdapter.fetchPositioningSnapshots();
  const options = await mockOptionsAdapter.fetchOptionsSnapshots();
  const catalysts = await mockCatalystAdapter.fetchCatalystEvents();

  for (const row of markets) {
    await pool.query(
      `INSERT INTO market_snapshots
      (id, security_id, observed_at, ingested_at, last_price, intraday_change_pct, volume, volume_vs_avg, shares_float, venue, source_key, source_type, freshness_seconds, provenance)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        uuid(),
        row.securityId,
        row.source.observedAt,
        row.source.ingestedAt,
        row.lastPrice,
        row.intradayChangePct,
        row.volume,
        row.volumeVsAvg,
        row.sharesFloat,
        row.venue,
        row.source.sourceKey,
        row.source.sourceType,
        row.source.freshnessSeconds,
        row.source.provenance
      ]
    );
  }

  for (const row of positioning) {
    await pool.query(
      `INSERT INTO positioning_snapshots
      (id, security_id, observed_at, ingested_at, short_interest_pct_float, borrow_fee_bps, utilization_pct, days_to_cover, is_estimated, source_key, source_type, freshness_seconds, provenance)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        uuid(),
        row.securityId,
        row.source.observedAt,
        row.source.ingestedAt,
        row.shortInterestPctFloat,
        row.borrowFeeBps,
        row.utilizationPct,
        row.daysToCover,
        row.isEstimated,
        row.source.sourceKey,
        row.source.sourceType,
        row.source.freshnessSeconds,
        row.source.provenance
      ]
    );
  }

  for (const row of options) {
    await pool.query(
      `INSERT INTO options_snapshots
      (id, security_id, observed_at, ingested_at, call_put_volume_ratio, near_term_iv_pct, gamma_exposure_score, source_key, source_type, freshness_seconds, provenance)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        uuid(),
        row.securityId,
        row.source.observedAt,
        row.source.ingestedAt,
        row.callPutVolumeRatio,
        row.nearTermIvPct,
        row.gammaExposureScore,
        row.source.sourceKey,
        row.source.sourceType,
        row.source.freshnessSeconds,
        row.source.provenance
      ]
    );
  }

  for (const row of catalysts) {
    await pool.query(
      `INSERT INTO catalyst_events
      (id, security_id, occurred_at, ingested_at, category, title, impact_score, source_key, source_type, freshness_seconds, provenance)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        uuid(),
        row.securityId,
        row.occurredAt,
        row.source.ingestedAt,
        row.category,
        row.title,
        row.impactScore,
        row.source.sourceKey,
        row.source.sourceType,
        row.source.freshnessSeconds,
        row.source.provenance
      ]
    );
  }

  for (const security of securities) {
    const market = markets.find((m) => m.securityId === security.id)!;
    const pos = positioning.find((p) => p.securityId === security.id)!;
    const opt = options.find((o) => o.securityId === security.id)!;
    const secCatalysts = catalysts.filter((c) => c.securityId === security.id);
    const score = computeExplainableScore({
      securityId: security.id,
      region: (issuers.find((i) => i.id === security.issuerId)!.region as "US" | "UK" | "EU"),
      market,
      positioning: pos,
      options: opt,
      catalysts: secCatalysts
    });

    const scoreId = uuid();
    await pool.query(
      `INSERT INTO squeeze_scores
      (id, security_id, region_code, computed_at, total_score, confidence, risk_band, market_pressure, positioning_stress, options_accel, catalyst_heat, explanation, source_freshness)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        scoreId,
        score.securityId,
        score.region,
        score.computedAt,
        score.totalScore,
        score.confidence,
        score.riskBand,
        score.subscores.marketPressure,
        score.subscores.positioningStress,
        score.subscores.optionsAccel,
        score.subscores.catalystHeat,
        JSON.stringify(score.explanation),
        JSON.stringify(score.sourceFreshness)
      ]
    );

    if (score.totalScore >= 70) {
      await pool.query(
        "INSERT INTO alerts (id, security_id, score_id, alert_type, severity, message) VALUES ($1,$2,$3,$4,$5,$6)",
        [
          uuid(),
          score.securityId,
          scoreId,
          "squeeze-escalation",
          score.riskBand,
          `${score.securityId} entered ${score.riskBand.toUpperCase()} squeeze band at ${score.totalScore.toFixed(1)}`
        ]
      );
    }
  }

  await pool.end();
  console.log("Seed complete.");
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
