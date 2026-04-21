import { ProviderFetchMeta } from "./types";

export interface FmpQuote {
  symbol: string;
  name?: string;
  exchange?: string;
  price?: number;
  changesPercentage?: number;
  volume?: number;
  avgVolume?: number;
  timestamp?: number;
}

export interface FmpMarketState {
  symbol: string;
  companyName?: string;
  exchange?: string;
  price: number;
  move1D: number;
  volume: number;
  relativeVolume?: number;
  updatedAt: string;
}

export interface FmpSqueezeSignal {
  symbol: string;
  shortInterestPctFloat?: number;
  floatSharesM?: number;
}

const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";
const REQUEST_TIMEOUT_MS = 10_000;

const getKey = (): string | undefined => process.env.FMP_API_KEY?.trim() || undefined;

const withTimeout = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
};

export const hasFmpKey = (): boolean => Boolean(getKey());

const fetchFromFmp = async <T>(path: string): Promise<{ payload: T | null; meta: ProviderFetchMeta }> => {
  const apiKey = getKey();
  if (!apiKey) {
    return { payload: null, meta: { ok: false, degraded: true, reason: "missing_key" } };
  }

  const url = new URL(`${FMP_BASE_URL}${path}`);
  url.searchParams.set("apikey", apiKey);

  try {
    const response = await withTimeout(url);
    if (response.status === 429) {
      console.warn("[fulcrum/live] FMP rate limit reached.");
      return { payload: null, meta: { ok: false, degraded: true, reason: "rate_limited" } };
    }
    if (!response.ok) {
      console.warn(`[fulcrum/live] FMP request failed (${response.status}) for ${path}.`);
      return { payload: null, meta: { ok: false, degraded: false, reason: `http_${response.status}` } };
    }
    return { payload: (await response.json()) as T, meta: { ok: true, degraded: false } };
  } catch (error) {
    console.warn(`[fulcrum/live] FMP request error for ${path}.`, error);
    return { payload: null, meta: { ok: false, degraded: false, reason: "network_error" } };
  }
};

const toMarketState = (quote: FmpQuote): FmpMarketState | null => {
  if (typeof quote.symbol !== "string" || !quote.symbol) return null;
  if (typeof quote.price !== "number" || quote.price <= 0) return null;

  const volume = typeof quote.volume === "number" && quote.volume > 0 ? quote.volume : 0;
  const avgVolume = typeof quote.avgVolume === "number" && quote.avgVolume > 0 ? quote.avgVolume : undefined;
  const relativeVolume = avgVolume && volume > 0 ? volume / avgVolume : undefined;
  const timestamp = typeof quote.timestamp === "number" && quote.timestamp > 0 ? quote.timestamp : Math.floor(Date.now() / 1000);

  return {
    symbol: quote.symbol.toUpperCase(),
    companyName: quote.name,
    exchange: quote.exchange,
    price: quote.price,
    move1D: typeof quote.changesPercentage === "number" ? quote.changesPercentage : 0,
    volume,
    relativeVolume,
    updatedAt: new Date(timestamp * 1000).toISOString()
  };
};

export async function fetchBatchMarketState(symbols: string[]): Promise<Map<string, FmpMarketState>> {
  const result = await fetchBatchMarketStateWithMeta(symbols);
  return result.data;
}

interface FmpQuoteShortRow {
  symbol?: string;
  shortOutStandingPercent?: number;
  sharesFloat?: number;
}

const toSqueezeSignal = (row: FmpQuoteShortRow): FmpSqueezeSignal | null => {
  const symbol = typeof row.symbol === "string" && row.symbol.length > 0 ? row.symbol.toUpperCase() : null;
  if (!symbol) return null;
  const shortInterestPctFloat =
    typeof row.shortOutStandingPercent === "number" && Number.isFinite(row.shortOutStandingPercent)
      ? row.shortOutStandingPercent * 100
      : undefined;
  const floatSharesM =
    typeof row.sharesFloat === "number" && Number.isFinite(row.sharesFloat) && row.sharesFloat > 0
      ? row.sharesFloat / 1_000_000
      : undefined;
  return { symbol, shortInterestPctFloat, floatSharesM };
};

export async function fetchBatchSqueezeSignalsWithMeta(
  symbols: string[]
): Promise<{ data: Map<string, FmpSqueezeSignal>; meta: ProviderFetchMeta }> {
  const normalized = symbols.map((x) => x.trim().toUpperCase()).filter(Boolean);
  if (normalized.length === 0) return { data: new Map(), meta: { ok: false, degraded: true, reason: "empty_symbol_set" } };
  const { payload, meta } = await fetchFromFmp<FmpQuoteShortRow[]>(`/quote-short/${encodeURIComponent(normalized.join(","))}`);
  if (!Array.isArray(payload) || payload.length === 0) {
    return { data: new Map(), meta: meta.ok ? { ok: false, degraded: true, reason: "empty_payload" } : meta };
  }
  const map = new Map<string, FmpSqueezeSignal>();
  for (const row of payload) {
    const parsed = toSqueezeSignal(row);
    if (parsed) map.set(parsed.symbol, parsed);
  }
  return {
    data: map,
    meta: map.size > 0 ? { ok: true, degraded: false } : { ok: false, degraded: true, reason: "no_valid_rows" }
  };
}

export async function fetchBatchMarketStateWithMeta(
  symbols: string[]
): Promise<{ data: Map<string, FmpMarketState>; meta: ProviderFetchMeta }> {
  const normalized = symbols.map((x) => x.trim().toUpperCase()).filter(Boolean);
  if (normalized.length === 0) return { data: new Map(), meta: { ok: false, degraded: true, reason: "empty_symbol_set" } };

  const { payload, meta } = await fetchFromFmp<FmpQuote[]>(`/quote/${encodeURIComponent(normalized.join(","))}`);
  if (!Array.isArray(payload) || payload.length === 0) {
    return {
      data: new Map(),
      meta: meta.ok ? { ok: false, degraded: true, reason: "empty_payload" } : meta
    };
  }

  const rows = payload.map(toMarketState).filter((x): x is FmpMarketState => Boolean(x));
  const map = new Map<string, FmpMarketState>();
  for (const row of rows) map.set(row.symbol, row);
  return {
    data: map,
    meta: rows.length > 0 ? { ok: true, degraded: false } : { ok: false, degraded: true, reason: "no_valid_rows" }
  };
}
