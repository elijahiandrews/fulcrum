import { ProviderFetchMeta } from "./types";

export interface BorrowFeeSignal {
  symbol: string;
  borrowFeePct?: number;
  provider: "ortex" | "iborrowdesk";
  asOf?: string;
}

const ORTEX_BASE_URL = "https://api.ortex.com";
const IBORROWDESK_BASE_URL = "https://iborrowdesk.com/api/ticker";
const REQUEST_TIMEOUT_MS = 10_000;
const BORROW_CACHE_TTL_MS = 15 * 60_000;

const borrowCache = new Map<string, { expiresAt: number; value: BorrowFeeSignal | null }>();

const withTimeout = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
};

const getOrtexKey = (): string | undefined => process.env.ORTEX_API_KEY?.trim() || undefined;

const tryFetchFromOrtex = async (symbol: string): Promise<{ data: BorrowFeeSignal | null; meta: ProviderFetchMeta }> => {
  const apiKey = getOrtexKey();
  if (!apiKey) {
    return { data: null, meta: { ok: false, degraded: true, reason: "missing_key" } };
  }

  // NOTE: endpoint path and MIC are configurable so this adapter can be swapped cleanly.
  const mic = process.env.ORTEX_DEFAULT_MIC?.trim() || "XNYS";
  const pathTemplate = process.env.ORTEX_CTB_PATH_TEMPLATE?.trim() || "/api/v1/stock/{mic}/{ticker}/ctb/all?limit=1";
  const path = pathTemplate.replace("{mic}", encodeURIComponent(mic)).replace("{ticker}", encodeURIComponent(symbol.toUpperCase()));
  const url = new URL(path, ORTEX_BASE_URL);

  try {
    const response = await withTimeout(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (response.status === 401 || response.status === 403) {
      return { data: null, meta: { ok: false, degraded: false, reason: `auth_${response.status}` } };
    }
    if (response.status === 429) {
      return { data: null, meta: { ok: false, degraded: true, reason: "rate_limited" } };
    }
    if (!response.ok) {
      return { data: null, meta: { ok: false, degraded: false, reason: `http_${response.status}` } };
    }
    const payload = (await response.json()) as { results?: Array<{ costToBorrowAll?: number; date?: string }> };
    const record = payload.results?.[0];
    if (!record || typeof record.costToBorrowAll !== "number") {
      return { data: null, meta: { ok: false, degraded: true, reason: "empty_payload" } };
    }
    return {
      data: {
        symbol: symbol.toUpperCase(),
        borrowFeePct: record.costToBorrowAll,
        provider: "ortex",
        asOf: record.date
      },
      meta: { ok: true, degraded: false }
    };
  } catch {
    return { data: null, meta: { ok: false, degraded: false, reason: "network_error" } };
  }
};

const tryFetchFromIBorrowDesk = async (symbol: string): Promise<{ data: BorrowFeeSignal | null; meta: ProviderFetchMeta }> => {
  const url = `${IBORROWDESK_BASE_URL}/${encodeURIComponent(symbol.toUpperCase())}`;
  try {
    const response = await withTimeout(url, { headers: { "User-Agent": "Fulcrum-GSI/1.0" } });
    if (response.status === 429) return { data: null, meta: { ok: false, degraded: true, reason: "rate_limited" } };
    if (!response.ok) return { data: null, meta: { ok: false, degraded: false, reason: `http_${response.status}` } };
    const payload = (await response.json()) as { daily?: Array<{ date?: string; fee?: number }> };
    const latest = payload.daily?.[payload.daily.length - 1];
    if (!latest || typeof latest.fee !== "number") {
      return { data: null, meta: { ok: false, degraded: true, reason: "empty_payload" } };
    }
    return {
      data: {
        symbol: symbol.toUpperCase(),
        borrowFeePct: latest.fee,
        provider: "iborrowdesk",
        asOf: latest.date
      },
      meta: { ok: true, degraded: false }
    };
  } catch {
    return { data: null, meta: { ok: false, degraded: false, reason: "network_error" } };
  }
};

export async function fetchBorrowFeeSignalWithMeta(
  symbol: string
): Promise<{ data: BorrowFeeSignal | null; meta: ProviderFetchMeta }> {
  const normalized = symbol.trim().toUpperCase();
  if (!normalized) return { data: null, meta: { ok: false, degraded: true, reason: "empty_symbol" } };
  const cached = borrowCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      data: cached.value,
      meta: cached.value ? { ok: true, degraded: false } : { ok: false, degraded: true, reason: "cached_empty" }
    };
  }

  const ortex = await tryFetchFromOrtex(normalized);
  if (ortex.meta.ok && ortex.data?.borrowFeePct) {
    borrowCache.set(normalized, { expiresAt: Date.now() + BORROW_CACHE_TTL_MS, value: ortex.data });
    return ortex;
  }

  const ib = await tryFetchFromIBorrowDesk(normalized);
  borrowCache.set(normalized, { expiresAt: Date.now() + BORROW_CACHE_TTL_MS, value: ib.data });
  return ib;
}
