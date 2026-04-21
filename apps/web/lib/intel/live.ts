import { cache } from "react";

import { computeFulcrumScore } from "./scoring";
import { seededSymbols } from "./seed";
import { fetchBatchMarketState, hasFmpKey, type FmpMarketState } from "../providers/fmp";
import { fetchRecentNews, hasFinnhubKey } from "../providers/finnhub";
import { SeedSymbolInput, SymbolIntel } from "./types";

// V1 cache TTL: 5 minutes to avoid provider over-polling.
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

const mapFmpSymbol = (seed: SeedSymbolInput): string => {
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

const normalizeSymbolIntel = async (
  seed: SeedSymbolInput,
  liveMarketMap: Map<string, FmpMarketState>
): Promise<SymbolIntel> => {
  const finnhubSymbol = mapProviderSymbol(seed);
  const fmpSymbol = mapFmpSymbol(seed).toUpperCase();
  const liveMarket = liveMarketMap.get(fmpSymbol) ?? liveMarketMap.get(seed.symbol.toUpperCase());
  const catalyst = await buildCatalyst(finnhubSymbol, seed);

  const now = new Date();
  const marketUpdatedAt = liveMarket ? new Date(liveMarket.updatedAt) : null;
  const catalystFreshAt = catalyst.hasLiveCatalyst ? now : null;
  const freshestObservedAt = marketUpdatedAt ?? catalystFreshAt;
  const sourceFreshnessMinutes = freshestObservedAt
    ? Math.max(1, Math.floor((now.getTime() - freshestObservedAt.getTime()) / 60_000))
    : seed.features.sourceFreshnessMinutes + 15;

  const hasLiveQuote = Boolean(liveMarket);
  const hasLiveVolume = Boolean(liveMarket && liveMarket.volume > 0);
  const hasLiveRelativeVolume = Boolean(typeof liveMarket?.relativeVolume === "number" && liveMarket.relativeVolume > 0);
  const completenessPenalty = (hasLiveQuote ? 0 : 8) + (hasLiveVolume ? 0 : 4) + (catalyst.hasLiveCatalyst ? 0 : 4);

  const scored = computeFulcrumScore({
    ...seed.features,
    relativeVolume: hasLiveRelativeVolume ? Number((liveMarket?.relativeVolume as number).toFixed(2)) : seed.features.relativeVolume,
    catalystStatus: catalyst.catalystStatus,
    sourceFreshnessMinutes
  });

  const confidence = clamp(scored.confidence - completenessPenalty);
  const symbolRegion = hasLiveQuote ? inferRegionFromSymbol(fmpSymbol) : seed.region;
  const liveFieldCoverage: string[] = [];

  if (hasLiveQuote) liveFieldCoverage.push("price", "move1D", "updatedAt");
  if (hasLiveVolume) liveFieldCoverage.push("volume");
  if (hasLiveRelativeVolume) liveFieldCoverage.push("relativeVolume");
  if (catalyst.hasLiveCatalyst) liveFieldCoverage.push("catalystStatus", "catalystSummary");

  const dataOrigin: SymbolIntel["dataOrigin"] =
    liveFieldCoverage.length === 0 ? "seed" : liveFieldCoverage.length >= 4 ? "live" : "hybrid-fallback";

  return {
    symbol: seed.symbol,
    companyName: liveMarket?.companyName || seed.companyName,
    region: symbolRegion,
    exchange: liveMarket?.exchange || seed.exchange,
    price: liveMarket?.price ?? seed.price,
    move1D: liveMarket?.move1D ?? seed.move1D,
    volume: hasLiveVolume ? (liveMarket?.volume as number) : seed.volume,
    relativeVolume: hasLiveRelativeVolume ? Number((liveMarket?.relativeVolume as number).toFixed(2)) : seed.features.relativeVolume,
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
  const missingFmp = !hasFmpKey();
  const missingFinnhub = !hasFinnhubKey();
  if (missingFmp && missingFinnhub) {
    console.info("[fulcrum/live] Missing FMP and FINNHUB keys, serving seeded snapshot.");
    const symbols = await Promise.all(seededSymbols.map((seed) => normalizeSymbolIntel(seed, new Map())));
    return {
      symbols: symbols.sort((a, b) => b.squeezeScore - a.squeezeScore),
      generatedAt: new Date().toISOString(),
      mode: "seed"
    };
  }

  try {
    if (missingFmp) {
      console.info("[fulcrum/live] FMP key missing; market fields falling back to seeded values.");
    }
    if (missingFinnhub) {
      console.info("[fulcrum/live] Finnhub key missing; catalyst enrichment falling back to seeded values.");
    }

    const fmpSymbols = seededSymbols.map((seed) => mapFmpSymbol(seed));
    const liveMarketMap = missingFmp ? new Map() : await fetchBatchMarketState(fmpSymbols);
    const symbols = await Promise.all(seededSymbols.map((seed) => normalizeSymbolIntel(seed, liveMarketMap)));
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
    const symbols = await Promise.all(seededSymbols.map((seed) => normalizeSymbolIntel(seed, new Map())));
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
