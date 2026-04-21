export interface FinnhubNewsItem {
  headline: string;
  source: string;
  datetime: number;
  summary?: string;
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
