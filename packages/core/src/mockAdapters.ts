import { CatalystAdapter, MarketDataAdapter, OptionsAdapter, PositioningAdapter } from "./adapters";
import { CatalystEvent, MarketSnapshot, OptionsSnapshot, PositioningSnapshot } from "./types";

const now = new Date();
const isoAgo = (mins: number) => new Date(now.getTime() - mins * 60_000).toISOString();

const makeSource = (sourceKey: string, sourceType: "market" | "positioning" | "catalyst" | "options", minsOld: number) => ({
  sourceKey,
  sourceType,
  observedAt: isoAgo(minsOld),
  ingestedAt: isoAgo(Math.max(minsOld - 1, 0)),
  freshnessSeconds: minsOld * 60,
  provenance: `${sourceKey} mock feed`
});

export const mockMarketAdapter: MarketDataAdapter = {
  key: "mock-market-v1",
  async fetchMarketSnapshots(): Promise<MarketSnapshot[]> {
    return [
      { securityId: "GME.US", observedAt: isoAgo(2), lastPrice: 43.2, intradayChangePct: 12.1, volume: 88400000, volumeVsAvg: 3.9, sharesFloat: 267000000, venue: "NYSE", source: makeSource("iex-delayed", "market", 2) },
      { securityId: "BTA.L", observedAt: isoAgo(8), lastPrice: 2.58, intradayChangePct: 5.4, volume: 12000000, volumeVsAvg: 2.1, sharesFloat: 1040000000, venue: "LSE", source: makeSource("lse-delayed", "market", 8) },
      { securityId: "AIXA.DE", observedAt: isoAgo(9), lastPrice: 14.9, intradayChangePct: 4.2, volume: 5500000, volumeVsAvg: 2.4, sharesFloat: 480000000, venue: "XETRA", source: makeSource("xetra-delayed", "market", 9) }
    ];
  }
};

export const mockPositioningAdapter: PositioningAdapter = {
  key: "mock-positioning-v1",
  async fetchPositioningSnapshots(): Promise<PositioningSnapshot[]> {
    return [
      { securityId: "GME.US", observedAt: isoAgo(780), shortInterestPctFloat: 20.4, borrowFeeBps: 1660, utilizationPct: 97.5, daysToCover: 3.9, isEstimated: true, source: makeSource("vendor-estimate", "positioning", 780) },
      { securityId: "BTA.L", observedAt: isoAgo(1440), shortInterestPctFloat: 9.8, borrowFeeBps: 420, utilizationPct: 76.3, daysToCover: 2.2, isEstimated: false, source: makeSource("fca-disclosure", "positioning", 1440) },
      { securityId: "AIXA.DE", observedAt: isoAgo(1800), shortInterestPctFloat: 11.2, borrowFeeBps: 540, utilizationPct: 82.1, daysToCover: 2.8, isEstimated: false, source: makeSource("esma-aggregation", "positioning", 1800) }
    ];
  }
};

export const mockOptionsAdapter: OptionsAdapter = {
  key: "mock-options-v1",
  async fetchOptionsSnapshots(): Promise<OptionsSnapshot[]> {
    return [
      { securityId: "GME.US", observedAt: isoAgo(5), callPutVolumeRatio: 3.8, nearTermIvPct: 142, gammaExposureScore: 88, source: makeSource("options-opra", "options", 5) },
      { securityId: "BTA.L", observedAt: isoAgo(40), callPutVolumeRatio: 1.6, nearTermIvPct: 76, gammaExposureScore: 55, source: makeSource("eurex-options", "options", 40) },
      { securityId: "AIXA.DE", observedAt: isoAgo(32), callPutVolumeRatio: 1.9, nearTermIvPct: 83, gammaExposureScore: 61, source: makeSource("eurex-options", "options", 32) }
    ];
  }
};

export const mockCatalystAdapter: CatalystAdapter = {
  key: "mock-catalyst-v1",
  async fetchCatalystEvents(): Promise<CatalystEvent[]> {
    return [
      { securityId: "GME.US", occurredAt: isoAgo(25), category: "filing", title: "8-K partnership announcement", impactScore: 4.2, source: makeSource("sec-filings", "catalyst", 25) },
      { securityId: "GME.US", occurredAt: isoAgo(16), category: "news", title: "Social sentiment spike and analyst note", impactScore: 3.7, source: makeSource("newswire", "catalyst", 16) },
      { securityId: "BTA.L", occurredAt: isoAgo(120), category: "regulatory", title: "FCA short update crossed threshold", impactScore: 2.4, source: makeSource("fca", "catalyst", 120) },
      { securityId: "AIXA.DE", occurredAt: isoAgo(88), category: "earnings", title: "Preliminary margin beat", impactScore: 3.1, source: makeSource("issuer-rns", "catalyst", 88) }
    ];
  }
};
