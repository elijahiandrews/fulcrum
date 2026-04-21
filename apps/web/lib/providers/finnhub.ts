import { ProviderFetchMeta } from "./types";

export interface FinnhubNewsItem {
  headline: string;
  source: string;
  datetime: number;
  summary?: string;
}

export interface FinnhubOptionSignals {
  symbol: string;
  optionsVolumeRatio?: number;
  callPutSkew?: number;
}

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const REQUEST_TIMEOUT_MS = 10_000;

const getKey = (): string | undefined => process.env.FINNHUB_API_KEY?.trim() || undefined;

const withTimeout = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
};

const fetchFromFinnhub = async <T>(
  path: string,
  params: Record<string, string>
): Promise<{ payload: T | null; meta: ProviderFetchMeta }> => {
  const apiKey = getKey();
  if (!apiKey) {
    return { payload: null, meta: { ok: false, degraded: true, reason: "missing_key" } };
  }

  const url = new URL(`${FINNHUB_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("token", apiKey);

  try {
    const response = await withTimeout(url);
    if (response.status === 429) {
      console.warn("[fulcrum/live] Finnhub rate limit reached.");
      return { payload: null, meta: { ok: false, degraded: true, reason: "rate_limited" } };
    }
    if (!response.ok) {
      console.warn(`[fulcrum/live] Finnhub request failed (${response.status}) for ${path}.`);
      return { payload: null, meta: { ok: false, degraded: false, reason: `http_${response.status}` } };
    }
    return { payload: (await response.json()) as T, meta: { ok: true, degraded: false } };
  } catch (error) {
    console.warn(`[fulcrum/live] Finnhub request error for ${path}.`, error);
    return { payload: null, meta: { ok: false, degraded: false, reason: "network_error" } };
  }
};

export const hasFinnhubKey = (): boolean => Boolean(getKey());

export async function fetchRecentNews(symbol: string, fromISO: string, toISO: string): Promise<FinnhubNewsItem[]> {
  const result = await fetchRecentNewsWithMeta(symbol, fromISO, toISO);
  return result.data;
}

export async function fetchRecentNewsWithMeta(
  symbol: string,
  fromISO: string,
  toISO: string
): Promise<{ data: FinnhubNewsItem[]; meta: ProviderFetchMeta }> {
  const { payload, meta } = await fetchFromFinnhub<Array<{ headline?: string; source?: string; datetime?: number; summary?: string }>>(
    "/company-news",
    {
      symbol,
      from: fromISO.slice(0, 10),
      to: toISO.slice(0, 10)
    }
  );

  if (!Array.isArray(payload)) return { data: [], meta };

  const data = payload
    .filter((item) => typeof item.headline === "string" && item.headline.length > 0)
    .slice(0, 4)
    .map((item) => ({
      headline: item.headline as string,
      source: typeof item.source === "string" ? item.source : "newswire",
      datetime: typeof item.datetime === "number" ? item.datetime : Math.floor(Date.now() / 1000),
      summary: item.summary
    }));

  return {
    data,
    meta: data.length > 0 ? { ok: true, degraded: false } : meta.ok ? { ok: false, degraded: true, reason: "empty_payload" } : meta
  };
}

type FinnhubOptionChainRow = {
  optionType?: "call" | "put";
  volume?: number;
  openInterest?: number;
};

type FinnhubOptionChainPayload = {
  code?: string;
  data?: FinnhubOptionChainRow[];
};

export async function fetchOptionSignalsWithMeta(
  symbol: string
): Promise<{ data: FinnhubOptionSignals | null; meta: ProviderFetchMeta }> {
  const { payload, meta } = await fetchFromFinnhub<FinnhubOptionChainPayload>("/stock/option-chain", { symbol });
  if (!payload || !Array.isArray(payload.data) || payload.data.length === 0) {
    return { data: null, meta: meta.ok ? { ok: false, degraded: true, reason: "empty_payload" } : meta };
  }

  let callVolume = 0;
  let putVolume = 0;
  let callOi = 0;
  let putOi = 0;
  for (const row of payload.data) {
    const isCall = row.optionType === "call";
    const volume = typeof row.volume === "number" && Number.isFinite(row.volume) ? Math.max(0, row.volume) : 0;
    const oi = typeof row.openInterest === "number" && Number.isFinite(row.openInterest) ? Math.max(0, row.openInterest) : 0;
    if (isCall) {
      callVolume += volume;
      callOi += oi;
    } else {
      putVolume += volume;
      putOi += oi;
    }
  }

  const totalVolume = callVolume + putVolume;
  const totalOi = callOi + putOi;
  if (totalVolume <= 0 || totalOi <= 0) {
    return { data: null, meta: { ok: false, degraded: true, reason: "insufficient_option_depth" } };
  }

  const optionsVolumeRatio = totalVolume / totalOi;
  const callPutSkew = callVolume / Math.max(1, putVolume);
  return {
    data: {
      symbol,
      optionsVolumeRatio,
      callPutSkew
    },
    meta: { ok: true, degraded: false }
  };
}
