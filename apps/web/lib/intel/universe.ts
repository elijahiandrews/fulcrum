import { TrackedSymbolEntry, TrackedUniverseSummary, UniversePriorityTier } from "./types";

const trackedUniverse: TrackedSymbolEntry[] = [
  {
    symbol: "GME",
    companyName: "GameStop Corp.",
    region: "US",
    exchange: "NYSE",
    sector: "Consumer Discretionary",
    priorityTier: "core",
    active: true,
    monitoringRationale: "Recurring short-pressure and options acceleration across US retail flow.",
    tags: ["short-crowding", "options-convexity", "retail-flow"]
  },
  {
    symbol: "BYND",
    companyName: "Beyond Meat, Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Consumer Staples",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "High short-interest profile with event-driven liquidity dislocations.",
    tags: ["borrow-stress", "headline-sensitive"]
  },
  {
    symbol: "PLUG",
    companyName: "Plug Power Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Industrials",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Repeated policy-linked catalyst windows and unstable short positioning.",
    tags: ["policy-catalyst", "high-beta"]
  },
  {
    symbol: "MBLY",
    companyName: "Mobileye Global Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Technology",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "Useful benchmark for options-led pressure without persistent catalyst support.",
    tags: ["options-watch", "autonomy-theme"]
  },
  {
    symbol: "OCDO",
    companyName: "Ocado Group plc",
    region: "Europe",
    exchange: "LSE",
    sector: "Consumer Staples",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Europe coverage candidate with post-guidance squeeze-style pressure.",
    tags: ["europe-coverage", "news-sensitive"]
  },
  {
    symbol: "AAL",
    companyName: "Anglo American plc",
    region: "Europe",
    exchange: "LSE",
    sector: "Materials",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "M&A and commodity narrative can create episodic short repricing conditions.",
    tags: ["m&a-watch", "macro-exposed"]
  },
  {
    symbol: "SIE",
    companyName: "Siemens AG",
    region: "Europe",
    exchange: "XETRA",
    sector: "Industrials",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "Lower-risk regional control name for detecting false-positive squeeze signals.",
    tags: ["control-name", "liquidity-anchor"]
  },
  {
    symbol: "9984",
    companyName: "SoftBank Group Corp.",
    region: "Asia",
    exchange: "TSE",
    sector: "Financials",
    priorityTier: "core",
    active: true,
    monitoringRationale: "Gamma-sensitive exposure with recurring cross-market pressure behavior.",
    tags: ["gamma-sensitive", "asia-core"]
  },
  {
    symbol: "6758",
    companyName: "Sony Group Corporation",
    region: "Asia",
    exchange: "TSE",
    sector: "Consumer Discretionary",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Event-window options demand supports Asia catalyst monitoring.",
    tags: ["earnings-window", "options-demand"]
  },
  {
    symbol: "HIMS",
    companyName: "Hims & Hers Health, Inc.",
    region: "US",
    exchange: "NYSE",
    sector: "Healthcare",
    priorityTier: "core",
    active: true,
    monitoringRationale: "Frequent social + advertising catalysts with crowded short positioning.",
    tags: ["social-momentum", "short-crowding"]
  }
];

export const getTrackedUniverse = (): TrackedSymbolEntry[] => trackedUniverse;

export const getActiveTrackedSymbols = (): TrackedSymbolEntry[] => trackedUniverse.filter((entry) => entry.active);

export const getTrackedSymbolsByRegion = (region: TrackedSymbolEntry["region"]): TrackedSymbolEntry[] =>
  getActiveTrackedSymbols().filter((entry) => entry.region === region);

export const getTrackedSymbolsByPriority = (priorityTier: UniversePriorityTier): TrackedSymbolEntry[] =>
  getActiveTrackedSymbols().filter((entry) => entry.priorityTier === priorityTier);

export const getTrackedSymbolByTicker = (symbol: string): TrackedSymbolEntry | undefined =>
  trackedUniverse.find((entry) => entry.symbol.toLowerCase() === symbol.toLowerCase());

export const getTrackedUniverseSummary = (): TrackedUniverseSummary => {
  const allTracked = getTrackedUniverse();
  const activeTracked = getActiveTrackedSymbols();
  return {
    totalTrackedSymbols: allTracked.length,
    activeTrackedSymbols: activeTracked.length,
    regionBreakdown: {
      US: activeTracked.filter((entry) => entry.region === "US").length,
      Europe: activeTracked.filter((entry) => entry.region === "Europe").length,
      Asia: activeTracked.filter((entry) => entry.region === "Asia").length
    },
    priorityBreakdown: {
      core: activeTracked.filter((entry) => entry.priorityTier === "core").length,
      watch: activeTracked.filter((entry) => entry.priorityTier === "watch").length,
      experimental: activeTracked.filter((entry) => entry.priorityTier === "experimental").length
    }
  };
};
