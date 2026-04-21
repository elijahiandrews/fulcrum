import { SeedSymbolInput } from "./types";
import { getActiveTrackedSymbols } from "./universe";

const seedBySymbol: Record<string, Omit<SeedSymbolInput, "symbol" | "companyName" | "region" | "exchange">> = {
  GME: {
    price: 43.2,
    move1D: 12.1,
    volume: 88400000,
    catalystSummary: "8-K partnership update and sustained social-flow momentum.",
    updatedAt: "2026-04-21T13:41:00Z",
    previousScore: 88.2,
    previousConfidence: 82,
    features: {
      shortInterestPctFloat: 20.4,
      borrowFeePct: 16.6,
      relativeVolume: 3.9,
      optionsVolumeRatio: 3.8,
      callPutSkew: 1.45,
      floatSharesM: 267,
      catalystStatus: "active",
      liquidityTightness: "tight",
      sourceFreshnessMinutes: 3
    }
  },
  BYND: {
    price: 8.36,
    move1D: 7.4,
    volume: 12600000,
    catalystSummary: "Sector chatter and borrow tightening keep tape unstable.",
    updatedAt: "2026-04-21T13:37:00Z",
    previousScore: 73.4,
    previousConfidence: 74,
    features: {
      shortInterestPctFloat: 34.1,
      borrowFeePct: 12.3,
      relativeVolume: 4.9,
      optionsVolumeRatio: 2.7,
      callPutSkew: 1.28,
      floatSharesM: 71,
      catalystStatus: "watch",
      liquidityTightness: "tight",
      sourceFreshnessMinutes: 7
    }
  },
  PLUG: {
    price: 4.22,
    move1D: 5.8,
    volume: 51200000,
    catalystSummary: "Hydrogen policy headline risk meets persistent short demand.",
    updatedAt: "2026-04-21T13:29:00Z",
    previousScore: 70.6,
    previousConfidence: 66,
    features: {
      shortInterestPctFloat: 25.8,
      borrowFeePct: 9.1,
      relativeVolume: 3.8,
      optionsVolumeRatio: 2.3,
      callPutSkew: 1.22,
      floatSharesM: 788,
      catalystStatus: "watch",
      liquidityTightness: "moderate",
      sourceFreshnessMinutes: 11
    }
  },
  MBLY: {
    price: 24.89,
    move1D: 2.6,
    volume: 6400000,
    catalystSummary: "Options demand increased without a fresh confirmed catalyst.",
    updatedAt: "2026-04-21T13:21:00Z",
    previousScore: 66.1,
    previousConfidence: 71,
    features: {
      shortInterestPctFloat: 9.8,
      borrowFeePct: 3.7,
      relativeVolume: 2.9,
      optionsVolumeRatio: 2.4,
      callPutSkew: 1.13,
      floatSharesM: 804,
      catalystStatus: "none",
      liquidityTightness: "moderate",
      sourceFreshnessMinutes: 21
    }
  },
  OCDO: {
    price: 3.14,
    move1D: 6.1,
    volume: 9600000,
    catalystSummary: "Guidance-related repricing with thinning offer-side depth.",
    updatedAt: "2026-04-21T13:34:00Z",
    previousScore: 69.3,
    previousConfidence: 68,
    features: {
      shortInterestPctFloat: 14.6,
      borrowFeePct: 7.2,
      relativeVolume: 3.2,
      optionsVolumeRatio: 1.9,
      callPutSkew: 1.11,
      floatSharesM: 822,
      catalystStatus: "active",
      liquidityTightness: "moderate",
      sourceFreshnessMinutes: 14
    }
  },
  AAL: {
    price: 23.48,
    move1D: 3.3,
    volume: 7300000,
    catalystSummary: "M&A narrative keeps catalyst watch live across London flow.",
    updatedAt: "2026-04-21T13:15:00Z",
    previousScore: 58.1,
    previousConfidence: 62,
    features: {
      shortInterestPctFloat: 7.4,
      borrowFeePct: 2.6,
      relativeVolume: 2.2,
      optionsVolumeRatio: 1.6,
      callPutSkew: 1.08,
      floatSharesM: 1260,
      catalystStatus: "watch",
      liquidityTightness: "loose",
      sourceFreshnessMinutes: 28
    }
  },
  SIE: {
    price: 192.1,
    move1D: 1.7,
    volume: 2800000,
    catalystSummary: "Liquidity remains deep; event risk is currently low.",
    updatedAt: "2026-04-21T13:11:00Z",
    previousScore: 41.2,
    previousConfidence: 64,
    features: {
      shortInterestPctFloat: 2.2,
      borrowFeePct: 0.9,
      relativeVolume: 1.4,
      optionsVolumeRatio: 1.2,
      callPutSkew: 0.99,
      floatSharesM: 759,
      catalystStatus: "none",
      liquidityTightness: "loose",
      sourceFreshnessMinutes: 38
    }
  },
  "9984": {
    price: 73.5,
    move1D: 4.5,
    volume: 15400000,
    catalystSummary: "Structured-product hedging amplifies gamma-sensitive moves.",
    updatedAt: "2026-04-21T13:28:00Z",
    previousScore: 67.5,
    previousConfidence: 63,
    features: {
      shortInterestPctFloat: 10.5,
      borrowFeePct: 4.1,
      relativeVolume: 3.6,
      optionsVolumeRatio: 2.5,
      callPutSkew: 1.2,
      floatSharesM: 1402,
      catalystStatus: "watch",
      liquidityTightness: "moderate",
      sourceFreshnessMinutes: 16
    }
  },
  "6758": {
    price: 98.14,
    move1D: 2.1,
    volume: 8900000,
    catalystSummary: "Event-window options interest rising into earnings cycle.",
    updatedAt: "2026-04-21T13:12:00Z",
    previousScore: 55.2,
    previousConfidence: 68,
    features: {
      shortInterestPctFloat: 3.9,
      borrowFeePct: 1.4,
      relativeVolume: 2.7,
      optionsVolumeRatio: 2.1,
      callPutSkew: 1.15,
      floatSharesM: 1234,
      catalystStatus: "watch",
      liquidityTightness: "loose",
      sourceFreshnessMinutes: 24
    }
  },
  HIMS: {
    price: 17.76,
    move1D: 9.8,
    volume: 24600000,
    catalystSummary: "Advertising push and social virality triggered squeeze repricing.",
    updatedAt: "2026-04-21T13:39:00Z",
    previousScore: 76.8,
    previousConfidence: 72,
    features: {
      shortInterestPctFloat: 28.9,
      borrowFeePct: 14.4,
      relativeVolume: 5.2,
      optionsVolumeRatio: 3.1,
      callPutSkew: 1.37,
      floatSharesM: 202,
      catalystStatus: "active",
      liquidityTightness: "tight",
      sourceFreshnessMinutes: 4
    }
  }
};

const regionBasePrice: Record<SeedSymbolInput["region"], number> = {
  US: 24,
  Europe: 31,
  Asia: 52
};

const tierProfile = {
  core: { score: 79, confidence: 76, relVol: 3.8, short: 21, borrow: 9.5, options: 2.8, skew: 1.27, floatM: 420 },
  watch: { score: 66, confidence: 69, relVol: 2.9, short: 14, borrow: 6.1, options: 2.1, skew: 1.14, floatM: 690 },
  experimental: { score: 53, confidence: 63, relVol: 2.1, short: 8.2, borrow: 3.2, options: 1.7, skew: 1.05, floatM: 980 }
} as const;

const hashSymbol = (symbol: string): number =>
  symbol
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

const buildGeneratedSeed = (input: {
  symbol: string;
  region: SeedSymbolInput["region"];
  priorityTier: "core" | "watch" | "experimental";
  monitoringRationale: string;
}): Omit<SeedSymbolInput, "symbol" | "companyName" | "region" | "exchange"> => {
  const hash = hashSymbol(input.symbol);
  const profile = tierProfile[input.priorityTier];
  const freshness = 4 + (hash % 24);
  const scoreDrift = (hash % 8) - 3;
  const confidenceDrift = (hash % 7) - 3;
  const relVolDrift = ((hash % 6) - 2) * 0.2;

  const price = Number((regionBasePrice[input.region] + (hash % 35) + (hash % 100) / 100).toFixed(2));
  const move1D = Number((((hash % 12) - 4) * 0.9).toFixed(1));
  const volume = Math.max(900_000, 1_200_000 + (hash % 80) * 850_000);
  const previousScore = Number((profile.score + scoreDrift).toFixed(1));
  const previousConfidence = Math.max(48, Math.min(92, Math.round(profile.confidence + confidenceDrift)));
  const relativeVolume = Number(Math.max(1.3, profile.relVol + relVolDrift).toFixed(1));
  const catalystStatus = input.priorityTier === "core" ? "watch" : input.priorityTier === "watch" ? "watch" : "none";
  const liquidityTightness = input.priorityTier === "core" ? "tight" : input.priorityTier === "watch" ? "moderate" : "loose";

  return {
    price,
    move1D,
    volume,
    catalystSummary: input.monitoringRationale,
    updatedAt: new Date(Date.now() - freshness * 60_000).toISOString(),
    previousScore,
    previousConfidence,
    features: {
      shortInterestPctFloat: Number((profile.short + (hash % 5)).toFixed(1)),
      borrowFeePct: Number((profile.borrow + (hash % 4) * 0.6).toFixed(1)),
      relativeVolume,
      optionsVolumeRatio: Number((profile.options + (hash % 4) * 0.2).toFixed(1)),
      callPutSkew: Number((profile.skew + (hash % 3) * 0.06).toFixed(2)),
      floatSharesM: Number((profile.floatM + (hash % 220)).toFixed(0)),
      catalystStatus,
      liquidityTightness,
      sourceFreshnessMinutes: freshness
    }
  };
};

export const seededSymbols: SeedSymbolInput[] = getActiveTrackedSymbols()
  .map((tracked) => {
    const defaults =
      seedBySymbol[tracked.symbol] ??
      buildGeneratedSeed({
        symbol: tracked.symbol,
        region: tracked.region,
        priorityTier: tracked.priorityTier,
        monitoringRationale: tracked.monitoringRationale
      });
    return {
      symbol: tracked.symbol,
      companyName: tracked.companyName,
      region: tracked.region,
      exchange: tracked.exchange,
      ...defaults
    };
  });
