export interface FinnhubQuote {
  currentPrice: number;
  percentChange: number;
  timestamp: number;
}

export interface FinnhubNewsItem {
  headline: string;
  source: string;
  datetime: number;
  summary?: string;
}

export interface FinnhubCandleMetrics {
  latestVolume: number;
  averageVolume20D: number;
  relativeVolume: number;
  latestTimestamp: number;
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

const fetchFromFinnhub = async <T>(path: string, params: Record<string, string>): Promise<T | null> => {
  const apiKey = getKey();
  if (!apiKey) return null;

  const url = new URL(`${FINNHUB_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("token", apiKey);

  try {
    const response = await withTimeout(url);
    if (response.status === 429) {
      console.warn("[fulcrum/live] Finnhub rate limit reached.");
      return null;
    }
    if (!response.ok) {
      console.warn(`[fulcrum/live] Finnhub request failed (${response.status}) for ${path}.`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[fulcrum/live] Finnhub request error for ${path}.`, error);
    return null;
  }
};

export const hasFinnhubKey = (): boolean => Boolean(getKey());

export async function fetchQuote(symbol: string): Promise<FinnhubQuote | null> {
  const payload = await fetchFromFinnhub<{ c?: number; dp?: number; t?: number }>("/quote", { symbol });
  if (!payload || typeof payload.c !== "number" || payload.c <= 0) return null;
  return {
    currentPrice: payload.c,
    percentChange: typeof payload.dp === "number" ? payload.dp : 0,
    timestamp: typeof payload.t === "number" && payload.t > 0 ? payload.t : Math.floor(Date.now() / 1000)
  };
}

export async function fetchRecentNews(symbol: string, fromISO: string, toISO: string): Promise<FinnhubNewsItem[]> {
  const payload = await fetchFromFinnhub<Array<{ headline?: string; source?: string; datetime?: number; summary?: string }>>(
    "/company-news",
    {
      symbol,
      from: fromISO.slice(0, 10),
      to: toISO.slice(0, 10)
    }
  );

  if (!Array.isArray(payload)) return [];

  return payload
    .filter((item) => typeof item.headline === "string" && item.headline.length > 0)
    .slice(0, 4)
    .map((item) => ({
      headline: item.headline as string,
      source: typeof item.source === "string" ? item.source : "newswire",
      datetime: typeof item.datetime === "number" ? item.datetime : Math.floor(Date.now() / 1000),
      summary: item.summary
    }));
}

export async function fetchDailyCandleMetrics(symbol: string): Promise<FinnhubCandleMetrics | null> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const fromSeconds = nowSeconds - 35 * 24 * 60 * 60;
  const payload = await fetchFromFinnhub<{
    s?: string;
    t?: number[];
    v?: number[];
  }>("/stock/candle", {
    symbol,
    resolution: "D",
    from: String(fromSeconds),
    to: String(nowSeconds)
  });

  if (!payload || payload.s !== "ok" || !Array.isArray(payload.v) || !Array.isArray(payload.t)) return null;
  if (payload.v.length < 2 || payload.t.length !== payload.v.length) return null;

  const latestVolume = payload.v[payload.v.length - 1];
  const latestTimestamp = payload.t[payload.t.length - 1];
  if (typeof latestVolume !== "number" || latestVolume <= 0 || typeof latestTimestamp !== "number") return null;

  const lookback = payload.v.slice(-21, -1).filter((x) => typeof x === "number" && x > 0);
  if (lookback.length === 0) return null;
  const averageVolume20D = lookback.reduce((sum, x) => sum + x, 0) / lookback.length;
  const relativeVolume = averageVolume20D > 0 ? latestVolume / averageVolume20D : 1;

  return {
    latestVolume,
    averageVolume20D,
    relativeVolume,
    latestTimestamp
  };
}
