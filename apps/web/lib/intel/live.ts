import { cache } from "react";

import { buildFulcrumExplanation, computeFulcrumScore } from "./scoring";
import { enrichSqueezeSignals } from "./enrichment";
import { seededSymbols } from "./seed";
import { fetchBorrowFeeSignalWithMeta, type BorrowFeeSignal } from "../providers/borrow";
import {
  fetchBatchMarketStateWithMeta,
  fetchBatchSqueezeSignalsWithMeta,
  hasFmpKey,
  type FmpMarketState,
  type FmpSqueezeSignal
} from "../providers/fmp";
import { fetchOptionSignalsWithMeta, fetchRecentNewsWithMeta, hasFinnhubKey, type FinnhubOptionSignals } from "../providers/finnhub";
import { ProviderFetchMeta } from "../providers/types";
import { CatalystStatus, LiveStatus, SeedSymbolInput, SymbolIntel } from "./types";
import { recordIntelHistory } from "./history";

// V1 cache TTL: 5 minutes to avoid provider over-polling.
const LIVE_CACHE_TTL_MS = 5 * 60_000;

type SnapshotPayload = {
  symbols: SymbolIntel[];
  generatedAt: string;
  mode: "live" | "hybrid-fallback" | "seed";
  status: LiveStatus;
};

let memoryCache: { expiresAt: number; payload: SnapshotPayload } | null = null;

const ALL_LIVE_FIELDS = ["price", "move1D", "updatedAt", "volume", "relativeVolume", "catalystStatus", "catalystSummary"] as const;
const ALL_PROXY_FIELDS = [
  "shortInterestPctFloat",
  "borrowFeePct",
  "optionsVolumeRatio",
  "callPutSkew",
  "floatSharesM",
  "liquidityTightness"
] as const;

type RuntimeProviderStatus = "ok" | "degraded" | "missing_key" | "error";

type ProviderRuntimeState = {
  fmp: RuntimeProviderStatus;
  finnhub: RuntimeProviderStatus;
  notes: string[];
};

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

const inferRegionFromSymbol = (symbol: string): SeedSymbolInput["region"] =>
  symbol.endsWith(".L") || symbol.endsWith(".DE") ? "Europe" : symbol.endsWith(".T") ? "Asia" : "US";

const mapSymbolForExchange = (seed: Pick<SeedSymbolInput, "symbol" | "exchange">): string => {
  if (seed.exchange === "LSE") return `${seed.symbol}.L`;
  if (seed.exchange === "XETRA") return `${seed.symbol}.DE`;
  if (seed.exchange === "TSE") return `${seed.symbol}.T`;
  return seed.symbol;
};

const normalizeProviderStatus = (
  hasKey: boolean,
  meta: ProviderFetchMeta | null
): RuntimeProviderStatus => {
  if (!hasKey) return "missing_key";
  if (!meta) return "degraded";
  if (meta.ok) return "ok";
  if (meta.degraded) return "degraded";
  return "error";
};

const buildCatalyst = async (
  providerSymbol: string,
  fallback: SeedSymbolInput
): Promise<{ catalystStatus: CatalystStatus; catalystSummary: string; hasLiveCatalyst: boolean; meta: ProviderFetchMeta | null }> => {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  const result = await fetchRecentNewsWithMeta(providerSymbol, from.toISOString(), to.toISOString());
  const news = result.data;
  if (news.length === 0) {
    return {
      catalystStatus: fallback.features.catalystStatus,
      catalystSummary: fallback.catalystSummary,
      hasLiveCatalyst: false,
      meta: result.meta
    };
  }

  const strongest = news[0];
  const isActive = news.length >= 2;
  const source = strongest.source ? ` (${strongest.source})` : "";
  return {
    catalystStatus: isActive ? "active" : "watch",
    catalystSummary: `${strongest.headline}${source}`,
    hasLiveCatalyst: true,
    meta: result.meta
  } satisfies { catalystStatus: CatalystStatus; catalystSummary: string; hasLiveCatalyst: boolean; meta: ProviderFetchMeta | null };
};

const normalizeSymbolIntel = async (
  seed: SeedSymbolInput,
  liveMarketMap: Map<string, FmpMarketState>,
  squeezeSignalMap: Map<string, FmpSqueezeSignal>,
  optionSignalMap: Map<string, FinnhubOptionSignals>,
  borrowSignalMap: Map<string, BorrowFeeSignal>,
  runtimeCollector?: { finnhubMetas: Array<ProviderFetchMeta | null> }
): Promise<SymbolIntel> => {
  const providerSymbol = mapSymbolForExchange(seed);
  const fmpSymbol = providerSymbol.toUpperCase();
  const liveMarket = liveMarketMap.get(fmpSymbol) ?? liveMarketMap.get(seed.symbol.toUpperCase());
  const catalyst = await buildCatalyst(providerSymbol, seed);
  runtimeCollector?.finnhubMetas.push(catalyst.meta);

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
  const enrichedSignals =
    hasLiveQuote || hasLiveRelativeVolume
      ? enrichSqueezeSignals(seed, {
          relativeVolume: hasLiveRelativeVolume ? Number(liveMarket?.relativeVolume) : seed.features.relativeVolume,
          move1D: liveMarket?.move1D ?? seed.move1D,
          price: liveMarket?.price ?? seed.price,
          volume: hasLiveVolume ? Number(liveMarket?.volume) : seed.volume,
          catalystStatus: catalyst.catalystStatus,
          directSqueezeSignals: squeezeSignalMap.get(fmpSymbol) ?? squeezeSignalMap.get(seed.symbol.toUpperCase()) ?? null,
          directOptionSignals: optionSignalMap.get(seed.symbol.toUpperCase()) ?? null,
          directBorrowSignal: borrowSignalMap.get(seed.symbol.toUpperCase()) ?? null
        })
      : {
          features: {
            ...seed.features,
            catalystStatus: catalyst.catalystStatus,
            sourceFreshnessMinutes
          },
          provenance: {
            shortInterestPctFloat: "fallback",
            borrowFeePct: "fallback",
            optionsVolumeRatio: "fallback",
            callPutSkew: "fallback",
            floatSharesM: "fallback",
            liquidityTightness: "fallback"
          } as const,
          confidencePenalty: 14,
          qualityLabel: "low" as const
        };

  const scored = computeFulcrumScore(
    {
      ...enrichedSignals.features,
      sourceFreshnessMinutes
    },
    enrichedSignals.provenance
  );

  const confidence = clamp(scored.confidence - completenessPenalty - enrichedSignals.confidencePenalty);

  const explanation = buildFulcrumExplanation({
    symbol: seed.symbol,
    features: enrichedSignals.features,
    breakdown: scored.explainabilityBreakdown,
    squeezeScore: scored.squeezeScore,
    confidence,
    catalystSummary: catalyst.catalystSummary,
    sourceFreshnessMinutes
  });
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
    shortInterestPctFloat: enrichedSignals.features.shortInterestPctFloat,
    borrowFeePct: enrichedSignals.features.borrowFeePct,
    optionsVolumeRatio: enrichedSignals.features.optionsVolumeRatio,
    callPutSkew: enrichedSignals.features.callPutSkew,
    floatSharesM: enrichedSignals.features.floatSharesM,
    catalystStatus: catalyst.catalystStatus,
    catalystSummary: catalyst.catalystSummary,
    liquidityTightness: enrichedSignals.features.liquidityTightness,
    squeezeScore: scored.squeezeScore,
    confidence,
    explainabilityBreakdown: scored.explainabilityBreakdown,
    explanation,
    sourceFreshnessMinutes,
    updatedAt: freshestObservedAt ? freshestObservedAt.toISOString() : seed.updatedAt,
    dataOrigin,
    liveFieldCoverage,
    signalProvenance: enrichedSignals.provenance
  };
};

const fetchSnapshotUncached = async (): Promise<SnapshotPayload> => {
  const runtime: ProviderRuntimeState = { fmp: "degraded", finnhub: "degraded", notes: [] };
  const missingFmp = !hasFmpKey();
  const missingFinnhub = !hasFinnhubKey();
  if (missingFmp && missingFinnhub) {
    console.info("[fulcrum/live] Missing FMP and FINNHUB keys, serving seeded snapshot.");
    const symbols = await Promise.all(seededSymbols.map((seed) => normalizeSymbolIntel(seed, new Map(), new Map(), new Map(), new Map())));
    const generatedAt = new Date().toISOString();
    const sorted = symbols.sort((a, b) => b.squeezeScore - a.squeezeScore);
    recordIntelHistory(sorted, generatedAt);
    runtime.fmp = "missing_key";
    runtime.finnhub = "missing_key";
    runtime.notes.push("Both provider keys are missing; seeded fallback snapshot is active.");
    return {
      symbols: sorted,
      generatedAt,
      mode: "seed",
      status: buildLiveStatus("seed", generatedAt, sorted, runtime, "stale")
    };
  }

  try {
    if (missingFmp) {
      console.info("[fulcrum/live] FMP key missing; market fields falling back to seeded values.");
    }
    if (missingFinnhub) {
      console.info("[fulcrum/live] Finnhub key missing; catalyst enrichment falling back to seeded values.");
    }

    const fmpSymbols = seededSymbols.map((seed) => mapSymbolForExchange(seed));
    const marketResult = missingFmp
      ? { data: new Map<string, FmpMarketState>(), meta: { ok: false, degraded: true, reason: "missing_key" } as ProviderFetchMeta }
      : await fetchBatchMarketStateWithMeta(fmpSymbols);
    const squeezeSignalResult = missingFmp
      ? { data: new Map<string, FmpSqueezeSignal>(), meta: { ok: false, degraded: true, reason: "missing_key" } as ProviderFetchMeta }
      : await fetchBatchSqueezeSignalsWithMeta(fmpSymbols);
    runtime.fmp = normalizeProviderStatus(!missingFmp, marketResult.meta);
    if (!squeezeSignalResult.meta.ok) runtime.notes.push("Direct short/float feed is partially degraded.");
    const liveMarketMap = marketResult.data;
    const squeezeSignalMap = squeezeSignalResult.data;
    const optionResults = await Promise.all(
      seededSymbols.map(async (seed) => ({
        symbol: seed.symbol.toUpperCase(),
        result: missingFinnhub
          ? { data: null, meta: { ok: false, degraded: true, reason: "missing_key" } as ProviderFetchMeta }
          : await fetchOptionSignalsWithMeta(mapSymbolForExchange(seed))
      }))
    );
    const borrowResults = await Promise.all(
      seededSymbols.map(async (seed) => ({
        symbol: seed.symbol.toUpperCase(),
        result: await fetchBorrowFeeSignalWithMeta(seed.symbol)
      }))
    );
    const optionSignalMap = new Map<string, FinnhubOptionSignals>();
    for (const item of optionResults) {
      if (item.result.data) optionSignalMap.set(item.symbol, item.result.data);
    }
    const borrowSignalMap = new Map<string, BorrowFeeSignal>();
    for (const item of borrowResults) {
      if (item.result.data) borrowSignalMap.set(item.symbol, item.result.data);
    }
    if (borrowSignalMap.size === 0) runtime.notes.push("Direct borrow-fee feed unavailable; borrow signal remains proxy-derived.");
    if (!missingFinnhub && optionSignalMap.size === 0) runtime.notes.push("Direct options feed unavailable; options signals remain proxy-derived.");
    const symbols = await Promise.all(
      seededSymbols.map((seed) => normalizeSymbolIntel(seed, liveMarketMap, squeezeSignalMap, optionSignalMap, borrowSignalMap))
    );
    runtime.finnhub = missingFinnhub
      ? "missing_key"
      : symbols.some((row) => row.liveFieldCoverage.includes("catalystStatus"))
        ? "ok"
        : "degraded";
    const mode = symbols.some((row) => row.dataOrigin === "live")
      ? symbols.some((row) => row.dataOrigin !== "live")
        ? "hybrid-fallback"
        : "live"
      : "seed";

    const generatedAt = new Date().toISOString();
    const sorted = symbols.sort((a, b) => b.squeezeScore - a.squeezeScore);
    recordIntelHistory(sorted, generatedAt);
    if (mode === "hybrid-fallback") {
      runtime.notes.push("Partial live coverage active; seeded fallback fields still used for some symbols.");
    }
    if (runtime.fmp !== "ok") runtime.notes.push("Market-state feed is not fully healthy.");
    if (runtime.finnhub !== "ok") runtime.notes.push("Catalyst enrichment feed is not fully healthy.");
    return {
      symbols: sorted,
      generatedAt,
      mode,
      status: buildLiveStatus(mode, generatedAt, sorted, runtime, "stale")
    };
  } catch (error) {
    console.warn("[fulcrum/live] Snapshot generation failed, falling back to seeded mode.", error);
    const symbols = await Promise.all(seededSymbols.map((seed) => normalizeSymbolIntel(seed, new Map(), new Map(), new Map(), new Map())));
    const generatedAt = new Date().toISOString();
    const sorted = symbols.sort((a, b) => b.squeezeScore - a.squeezeScore);
    recordIntelHistory(sorted, generatedAt);
    runtime.fmp = missingFmp ? "missing_key" : "error";
    runtime.finnhub = missingFinnhub ? "missing_key" : "error";
    runtime.notes.push("Live snapshot generation failed; seeded fallback snapshot is active.");
    return {
      symbols: sorted,
      generatedAt,
      mode: "seed",
      status: buildLiveStatus("seed", generatedAt, sorted, runtime, "stale")
    };
  }
};

const buildLiveStatus = (
  mode: SnapshotPayload["mode"],
  generatedAt: string,
  symbols: SymbolIntel[],
  runtime: ProviderRuntimeState,
  cacheStatus: LiveStatus["cacheStatus"]
): LiveStatus => {
  const liveFieldSet = new Set<string>(symbols.flatMap((row) => row.liveFieldCoverage));
  const provenanceStates = ALL_PROXY_FIELDS.reduce<Record<string, "live" | "proxy" | "fallback">>((acc, field) => {
    const values = symbols.map((row) => row.signalProvenance[field as keyof typeof row.signalProvenance]);
    acc[field] = values.every((v) => v === "fallback")
      ? "fallback"
      : values.every((v) => v === "live")
        ? "live"
        : "proxy";
    return acc;
  }, {});
  const liveBacked = ALL_LIVE_FIELDS.filter((field) => liveFieldSet.has(field));
  const proxyDerived = Object.entries(provenanceStates)
    .filter(([, status]) => status === "proxy")
    .map(([field]) => field);
  const fallbackDerived = Object.entries(provenanceStates)
    .filter(([, status]) => status === "fallback")
    .map(([field]) => field);
  const unavailable: string[] = [];
  const overallMode: LiveStatus["overallMode"] = mode === "live" ? "live" : mode === "hybrid-fallback" ? "partial" : "fallback";
  const note = runtime.notes.length > 0 ? runtime.notes.join(" ") : undefined;

  return {
    overallMode,
    fmpStatus: runtime.fmp,
    finnhubStatus: runtime.finnhub,
    cacheStatus,
    generatedAt,
    liveFieldCoverage: {
      liveBacked,
      proxyDerived,
      fallbackDerived,
      unavailable
    },
    note
  };
};

export const getLiveIntelSnapshot = cache(async (): Promise<SnapshotPayload> => {
  const now = Date.now();
  if (memoryCache && memoryCache.expiresAt > now) {
    console.info("[fulcrum/live] serving cached snapshot.");
    return {
      ...memoryCache.payload,
      status: {
        ...memoryCache.payload.status,
        cacheStatus: "fresh"
      }
    };
  }
  const payload = await fetchSnapshotUncached();
  memoryCache = { expiresAt: now + LIVE_CACHE_TTL_MS, payload };
  return {
    ...payload,
    status: {
      ...payload.status,
      cacheStatus: "fresh"
    }
  };
});
