import { SeedSymbolInput } from "./types";

/**
 * Canonical Fulcrum / GSI mock dataset (raw inputs → scoring layer → SymbolIntel).
 * Replace this array (or swap the provider behind `getLiveIntelSnapshot`) for live feeds.
 */
export const FULCRUM_SEED_DATASET: SeedSymbolInput[] = [
  {
    symbol: "GME",
    companyName: "GameStop Corp.",
    region: "US",
    exchange: "NYSE",
    price: 43.2,
    move1D: 12.1,
    volume: 88_400_000,
    catalystSummary: "8-K partnership update plus elevated retail-directed flow into weekly calls.",
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
  {
    symbol: "BYND",
    companyName: "Beyond Meat, Inc.",
    region: "US",
    exchange: "NASDAQ",
    price: 8.36,
    move1D: 7.4,
    volume: 12_600_000,
    catalystSummary: "Borrow desk tightness and sector headline risk keeping two-way flow unstable.",
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
  {
    symbol: "PLUG",
    companyName: "Plug Power Inc.",
    region: "US",
    exchange: "NASDAQ",
    price: 4.22,
    move1D: 5.8,
    volume: 51_200_000,
    catalystSummary: "Policy headline window overlapping persistent short demand on the name.",
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
  {
    symbol: "HIMS",
    companyName: "Hims & Hers Health, Inc.",
    region: "US",
    exchange: "NYSE",
    price: 17.76,
    move1D: 9.8,
    volume: 24_600_000,
    catalystSummary: "Paid acquisition push plus social velocity created a clean catalyst spike into calls.",
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
  },
  {
    symbol: "MBLY",
    companyName: "Mobileye Global Inc.",
    region: "US",
    exchange: "NASDAQ",
    price: 24.89,
    move1D: 2.6,
    volume: 6_400_000,
    catalystSummary: "Options demand rose without a fresh, confirmed fundamental catalyst on tape.",
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
  {
    symbol: "OCDO",
    companyName: "Ocado Group plc",
    region: "Europe",
    exchange: "LSE",
    price: 3.14,
    move1D: 6.1,
    volume: 9_600_000,
    catalystSummary: "Guidance-related repricing with measurable offer-side depth erosion post headline.",
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
  {
    symbol: "AAL",
    companyName: "Anglo American plc",
    region: "Europe",
    exchange: "LSE",
    price: 23.48,
    move1D: 3.3,
    volume: 7_300_000,
    catalystSummary: "M&A / commodity narrative keeping a live catalyst watch on London flow.",
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
  {
    symbol: "SIE",
    companyName: "Siemens AG",
    region: "Europe",
    exchange: "XETRA",
    price: 192.1,
    move1D: 1.7,
    volume: 2_800_000,
    catalystSummary: "Deep book liquidity; used internally as a European false-positive control.",
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
  {
    symbol: "9984",
    companyName: "SoftBank Group Corp.",
    region: "Asia",
    exchange: "TSE",
    price: 73.5,
    move1D: 4.5,
    volume: 15_400_000,
    catalystSummary: "Structured-product hedging lifting gamma sensitivity around crowded strikes.",
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
  {
    symbol: "6758",
    companyName: "Sony Group Corporation",
    region: "Asia",
    exchange: "TSE",
    price: 98.14,
    move1D: 2.1,
    volume: 8_900_000,
    catalystSummary: "Event-window options interest rising ahead of the next earnings cycle.",
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
  {
    symbol: "RIVN",
    companyName: "Rivian Automotive, Inc.",
    region: "US",
    exchange: "NASDAQ",
    price: 14.85,
    move1D: 4.2,
    volume: 22_100_000,
    catalystSummary: "Delivery cadence headlines intersecting with elevated weekly call open interest.",
    updatedAt: "2026-04-21T13:15:00Z",
    previousScore: 61.0,
    previousConfidence: 62,
    features: {
      shortInterestPctFloat: 18.2,
      borrowFeePct: 7.4,
      relativeVolume: 2.8,
      optionsVolumeRatio: 2.4,
      callPutSkew: 1.19,
      floatSharesM: 956,
      catalystStatus: "watch",
      liquidityTightness: "moderate",
      sourceFreshnessMinutes: 9
    }
  }
];

export const FULCRUM_DATASET_SYMBOL_COUNT = FULCRUM_SEED_DATASET.length;

/** Only these names flow through the mock-to-real pipeline in V1 product surfaces. */
export const seededSymbols: SeedSymbolInput[] = FULCRUM_SEED_DATASET;
