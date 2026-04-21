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
  },
  {
    symbol: "AMC",
    companyName: "AMC Entertainment Holdings, Inc.",
    region: "US",
    exchange: "NYSE",
    sector: "Communication Services",
    priorityTier: "core",
    active: true,
    monitoringRationale: "Recurring retail crowding and borrow stress keep squeeze dynamics persistent.",
    tags: ["retail-flow", "short-crowding", "options-convexity"]
  },
  {
    symbol: "CVNA",
    companyName: "Carvana Co.",
    region: "US",
    exchange: "NYSE",
    sector: "Consumer Discretionary",
    priorityTier: "core",
    active: true,
    monitoringRationale: "High squeeze sensitivity with frequent volatility clusters around narrative shifts.",
    tags: ["short-crowding", "headline-sensitive"]
  },
  {
    symbol: "UPST",
    companyName: "Upstart Holdings, Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Financials",
    priorityTier: "core",
    active: true,
    monitoringRationale: "Options-led repricing and thin liquidity windows create rapid score shifts.",
    tags: ["options-convexity", "liquidity-sensitive"]
  },
  {
    symbol: "SMCI",
    companyName: "Super Micro Computer, Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Technology",
    priorityTier: "core",
    active: true,
    monitoringRationale: "AI-cycle positioning with episodic short-covering bursts and elevated options flow.",
    tags: ["ai-theme", "options-demand", "event-sensitive"]
  },
  {
    symbol: "COIN",
    companyName: "Coinbase Global, Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Financials",
    priorityTier: "core",
    active: true,
    monitoringRationale: "Crypto-beta and derivative activity amplify squeeze-style repricing episodes.",
    tags: ["macro-beta", "options-convexity"]
  },
  {
    symbol: "RIVN",
    companyName: "Rivian Automotive, Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Consumer Discretionary",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Narrative-sensitive EV tape with crowded positioning and event-driven pressure.",
    tags: ["ev-theme", "headline-sensitive"]
  },
  {
    symbol: "LCID",
    companyName: "Lucid Group, Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Consumer Discretionary",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Retail and momentum participation can quickly tighten liquidity under catalysts.",
    tags: ["retail-flow", "liquidity-sensitive"]
  },
  {
    symbol: "RKT",
    companyName: "Rocket Companies, Inc.",
    region: "US",
    exchange: "NYSE",
    sector: "Financials",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Mortgage-sensitive sentiment swings create periodic squeeze test conditions.",
    tags: ["macro-exposed", "borrow-stress"]
  },
  {
    symbol: "IONQ",
    companyName: "IonQ, Inc.",
    region: "US",
    exchange: "NYSE",
    sector: "Technology",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Speculative thematic exposure with frequent abrupt options and volume spikes.",
    tags: ["theme-beta", "options-demand"]
  },
  {
    symbol: "SOUN",
    companyName: "SoundHound AI, Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Technology",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "AI-momentum participation and thin depth make it a useful squeeze watch candidate.",
    tags: ["ai-theme", "liquidity-sensitive"]
  },
  {
    symbol: "AI",
    companyName: "C3.ai, Inc.",
    region: "US",
    exchange: "NYSE",
    sector: "Technology",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "Thematic flow proxy for stress-testing false positives in crowded AI narratives.",
    tags: ["control-name", "theme-beta"]
  },
  {
    symbol: "AUR",
    companyName: "Aurora Innovation, Inc.",
    region: "US",
    exchange: "NASDAQ",
    sector: "Technology",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "Emerging-autonomy tape helps validate low-float and catalyst sensitivity behavior.",
    tags: ["autonomy-theme", "experimental"]
  },
  {
    symbol: "BB",
    companyName: "BlackBerry Limited",
    region: "US",
    exchange: "NYSE",
    sector: "Technology",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "Legacy meme-history name for benchmark squeeze recurrence checks.",
    tags: ["meme-history", "retail-flow"]
  },
  {
    symbol: "RR",
    companyName: "Rolls-Royce Holdings plc",
    region: "Europe",
    exchange: "LSE",
    sector: "Industrials",
    priorityTier: "core",
    active: true,
    monitoringRationale: "High-beta UK industrial with persistent catalyst windows and directional crowding.",
    tags: ["europe-core", "headline-sensitive"]
  },
  {
    symbol: "BARC",
    companyName: "Barclays PLC",
    region: "Europe",
    exchange: "LSE",
    sector: "Financials",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Liquid UK financial for testing squeeze signal calibration versus deeper books.",
    tags: ["control-name", "europe-coverage"]
  },
  {
    symbol: "VOW3",
    companyName: "Volkswagen AG",
    region: "Europe",
    exchange: "XETRA",
    sector: "Consumer Discretionary",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Historic squeeze relevance and recurring auto-sector event risk.",
    tags: ["historic-squeeze", "sector-catalyst"]
  },
  {
    symbol: "RHM",
    companyName: "Rheinmetall AG",
    region: "Europe",
    exchange: "XETRA",
    sector: "Industrials",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Defense-cycle momentum introduces sharp catalyst-linked repricing bursts.",
    tags: ["event-driven", "momentum-beta"]
  },
  {
    symbol: "IFX",
    companyName: "Infineon Technologies AG",
    region: "Europe",
    exchange: "XETRA",
    sector: "Technology",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "Semiconductor proxy for cross-region validation of options-driven pressure.",
    tags: ["semi-theme", "cross-region"]
  },
  {
    symbol: "SAP",
    companyName: "SAP SE",
    region: "Europe",
    exchange: "XETRA",
    sector: "Technology",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "Large-cap control anchor for Europe to benchmark confidence behavior.",
    tags: ["control-name", "liquidity-anchor"]
  },
  {
    symbol: "7203",
    companyName: "Toyota Motor Corporation",
    region: "Asia",
    exchange: "TSE",
    sector: "Consumer Discretionary",
    priorityTier: "core",
    active: true,
    monitoringRationale: "High-liquidity Asia anchor with options and macro sensitivity for baseline stability.",
    tags: ["asia-core", "liquidity-anchor"]
  },
  {
    symbol: "8306",
    companyName: "Mitsubishi UFJ Financial Group, Inc.",
    region: "Asia",
    exchange: "TSE",
    sector: "Financials",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Rates-sensitive bank flow helps capture macro-linked catalyst transitions.",
    tags: ["macro-exposed", "asia-coverage"]
  },
  {
    symbol: "8035",
    companyName: "Tokyo Electron Limited",
    region: "Asia",
    exchange: "TSE",
    sector: "Technology",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Semiconductor cycle and derivatives activity can produce bursty squeeze setups.",
    tags: ["semi-theme", "options-demand"]
  },
  {
    symbol: "7011",
    companyName: "Mitsubishi Heavy Industries, Ltd.",
    region: "Asia",
    exchange: "TSE",
    sector: "Industrials",
    priorityTier: "watch",
    active: true,
    monitoringRationale: "Defense and infrastructure headline windows create event-cluster monitoring value.",
    tags: ["event-driven", "asia-coverage"]
  },
  {
    symbol: "6501",
    companyName: "Hitachi, Ltd.",
    region: "Asia",
    exchange: "TSE",
    sector: "Industrials",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "Diversified industrial control for calibrating model behavior outside crowded names.",
    tags: ["control-name", "cross-sector"]
  },
  {
    symbol: "7974",
    companyName: "Nintendo Co., Ltd.",
    region: "Asia",
    exchange: "TSE",
    sector: "Communication Services",
    priorityTier: "experimental",
    active: true,
    monitoringRationale: "Content-cycle catalysts offer clean event-driven signal validation in Asia.",
    tags: ["catalyst-sensitive", "asia-coverage"]
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
  const sectorBreakdown = activeTracked.reduce<Record<string, number>>((acc, entry) => {
    const sector = entry.sector ?? "Unknown";
    acc[sector] = (acc[sector] ?? 0) + 1;
    return acc;
  }, {});
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
    },
    sectorBreakdown
  };
};
