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

const fetchFromFmp = async <T>(path: string): Promise<T | null> => {
  const apiKey = getKey();
  if (!apiKey) return null;

  const url = new URL(`${FMP_BASE_URL}${path}`);
  url.searchParams.set("apikey", apiKey);

  try {
    const response = await withTimeout(url);
    if (response.status === 429) {
      console.warn("[fulcrum/live] FMP rate limit reached.");
      return null;
    }
    if (!response.ok) {
      console.warn(`[fulcrum/live] FMP request failed (${response.status}) for ${path}.`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[fulcrum/live] FMP request error for ${path}.`, error);
    return null;
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
  const normalized = symbols.map((x) => x.trim().toUpperCase()).filter(Boolean);
  if (normalized.length === 0) return new Map();

  const payload = await fetchFromFmp<FmpQuote[]>(`/quote/${encodeURIComponent(normalized.join(","))}`);
  if (!Array.isArray(payload) || payload.length === 0) return new Map();

  const rows = payload.map(toMarketState).filter((x): x is FmpMarketState => Boolean(x));
  const map = new Map<string, FmpMarketState>();
  for (const row of rows) map.set(row.symbol, row);
  return map;
}
