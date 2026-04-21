import { cache } from "react";

import { computeFulcrumScore } from "./scoring";
import { seededSymbols } from "./seed";
import { fetchDailyCandleMetrics, fetchQuote, fetchRecentNews, hasFinnhubKey } from "../providers/finnhub";
import { SeedSymbolInput, SymbolIntel } from "./types";

const LIVE_CACHE_TTL_MS = 5 * 60_000;

type SnapshotPayload = {
  symbols: SymbolIntel[];
  generatedAt: string;
  mode: "live" | "hybrid-fallback" | "seed";
};

let memoryCache: { expiresAt: number; payload: SnapshotPayload } | null = null;

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

const inferRegionFromSymbol = (symbol: string): SeedSymbolInput["region"] =>
  symbol.endsWith(".L") || symbol.endsWith(".DE") ? "Europe" : symbol.endsWith(".T") ? "Asia" : "US";

const mapProviderSymbol = (seed: SeedSymbolInput): string => {
  if (seed.exchange === "LSE") return `${seed.symbol}.L`;
  if (seed.exchange === "XETRA") return `${seed.symbol}.DE`;
  if (seed.exchange === "TSE") return `${seed.symbol}.T`;
  return seed.symbol;
};

const buildCatalyst = async (providerSymbol: string, fallback: SeedSymbolInput) => {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  const news = await fetchRecentNews(providerSymbol, from.toISOString(), to.toISOString());
  if (news.length === 0) {
    return {
      catalystStatus: fallback.features.catalystStatus,
      catalystSummary: fallback.catalystSummary,
      hasLiveCatalyst: false
    };
  }

  const strongest = news[0];
  const isActive = news.length >= 2;
  const source = strongest.source ? ` (${strongest.source})` : "";
  return {
    catalystStatus: isActive ? "active" : "watch",
    catalystSummary: `${strongest.headline}${source}`,
    hasLiveCatalyst: true
  };
};

const normalizeSymbolIntel = async (seed: SeedSymbolInput): Promise<SymbolIntel> => {
  const providerSymbol = mapProviderSymbol(seed);
  const [liveQuote, liveCandles] = await Promise.all([fetchQuote(providerSymbol), fetchDailyCandleMetrics(providerSymbol)]);
  const catalyst = await buildCatalyst(providerSymbol, seed);

  const now = new Date();
  const liveUpdatedAt = liveQuote ? new Date(liveQuote.timestamp * 1000) : null;
  const volumeUpdatedAt = liveCandles ? new Date(liveCandles.latestTimestamp * 1000) : null;
  const freshestObservedAt = liveUpdatedAt ?? volumeUpdatedAt;
  const sourceFreshnessMinutes = freshestObservedAt
    ? Math.max(1, Math.floor((now.getTime() - freshestObservedAt.getTime()) / 60_000))
    : seed.features.sourceFreshnessMinutes + 15;

  const completenessPenalty = (liveQuote ? 0 : 8) + (liveCandles ? 0 : 4) + (catalyst.hasLiveCatalyst ? 0 : 4);

  const scored = computeFulcrumScore({
    ...seed.features,
    relativeVolume: liveCandles ? Number(liveCandles.relativeVolume.toFixed(2)) : seed.features.relativeVolume,
    catalystStatus: catalyst.catalystStatus,
    sourceFreshnessMinutes
  });

  const confidence = clamp(scored.confidence - completenessPenalty);
  const symbolRegion = liveQuote ? inferRegionFromSymbol(providerSymbol) : seed.region;
  const liveFieldCoverage: string[] = [];

  if (liveQuote) liveFieldCoverage.push("price", "move1D", "updatedAt");
  if (liveCandles) liveFieldCoverage.push("volume", "relativeVolume");
  if (catalyst.hasLiveCatalyst) liveFieldCoverage.push("catalystStatus", "catalystSummary");

  const dataOrigin: SymbolIntel["dataOrigin"] =
    liveFieldCoverage.length === 0 ? "seed" : liveFieldCoverage.length >= 4 ? "live" : "hybrid-fallback";

  return {
    symbol: seed.symbol,
    companyName: seed.companyName,
    region: symbolRegion,
    exchange: seed.exchange,
    price: liveQuote?.currentPrice ?? seed.price,
    move1D: liveQuote?.percentChange ?? seed.move1D,
    volume: liveCandles?.latestVolume ?? seed.volume,
    relativeVolume: liveCandles ? Number(liveCandles.relativeVolume.toFixed(2)) : seed.features.relativeVolume,
    shortInterestPctFloat: seed.features.shortInterestPctFloat,
    borrowFeePct: seed.features.borrowFeePct,
    optionsVolumeRatio: seed.features.optionsVolumeRatio,
    callPutSkew: seed.features.callPutSkew,
    floatSharesM: seed.features.floatSharesM,
    catalystStatus: catalyst.catalystStatus,
    catalystSummary: catalyst.catalystSummary,
    liquidityTightness: seed.features.liquidityTightness,
    squeezeScore: scored.squeezeScore,
    confidence,
    explainabilityBreakdown: scored.explainabilityBreakdown,
    explanation: `${seed.symbol} scores ${scored.squeezeScore.toFixed(1)} with ${confidence.toFixed(
      0
    )}% confidence. Live coverage: ${liveFieldCoverage.length > 0 ? liveFieldCoverage.join(", ") : "none"}; fallback data remains for positioning and options factors.`,
    sourceFreshnessMinutes,
    updatedAt: freshestObservedAt ? freshestObservedAt.toISOString() : seed.updatedAt,
    dataOrigin,
    liveFieldCoverage
  };
};

const fetchSnapshotUncached = async (): Promise<SnapshotPayload> => {
  if (!hasFinnhubKey()) {
    console.info("[fulcrum/live] FINNHUB_API_KEY missing, serving seeded snapshot.");
    const symbols = await Promise.all(seededSymbols.map((seed) => normalizeSymbolIntel(seed)));
    return {
      symbols: symbols.sort((a, b) => b.squeezeScore - a.squeezeScore),
      generatedAt: new Date().toISOString(),
      mode: "seed"
    };
  }

  try {
    const symbols = await Promise.all(seededSymbols.map((seed) => normalizeSymbolIntel(seed)));
    const mode = symbols.some((row) => row.dataOrigin === "live")
      ? symbols.some((row) => row.dataOrigin !== "live")
        ? "hybrid-fallback"
        : "live"
      : "seed";

    return {
      symbols: symbols.sort((a, b) => b.squeezeScore - a.squeezeScore),
      generatedAt: new Date().toISOString(),
      mode
    };
  } catch (error) {
    console.warn("[fulcrum/live] Snapshot generation failed, falling back to seeded mode.", error);
    const symbols = await Promise.all(seededSymbols.map((seed) => normalizeSymbolIntel(seed)));
    return {
      symbols: symbols.sort((a, b) => b.squeezeScore - a.squeezeScore),
      generatedAt: new Date().toISOString(),
      mode: "seed"
    };
  }
};

export const getLiveIntelSnapshot = cache(async (): Promise<SnapshotPayload> => {
  const now = Date.now();
  if (memoryCache && memoryCache.expiresAt > now) {
    console.info("[fulcrum/live] serving cached snapshot.");
    return memoryCache.payload;
  }
  const payload = await fetchSnapshotUncached();
  memoryCache = { expiresAt: now + LIVE_CACHE_TTL_MS, payload };
  return payload;
});
