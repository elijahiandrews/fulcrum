import {
  AlertMemoryRecord,
  FulcrumAlert,
  SnapshotChangeEvent,
  SnapshotChangeType,
  SymbolIntel,
  SymbolSnapshot
} from "./types";

const MAX_SNAPSHOTS_PER_SYMBOL = 48;
const ALERT_HISTORY_LIMIT = 400;
const SNAPSHOT_MIN_INTERVAL_MS = 10 * 60_000;

const CHANGE_THRESHOLDS = {
  scoreMaterial: 6,
  confidenceMaterial: 7,
  relativeVolumeSpike: 1.2,
  driverShift: 4,
  scoreAlertThreshold: 80,
  confidenceDeltaAlert: 6,
  resolveScoreFloor: 72,
  resolveVolumeFloor: 3.2
} as const;

type AlertStatus = AlertMemoryRecord["status"];

const snapshotStore = new Map<string, SymbolSnapshot[]>();
const alertHistory: AlertMemoryRecord[] = [];
const activeAlertIndex = new Map<string, string>();
const changeEvents: SnapshotChangeEvent[] = [];

const toAlertKey = (symbol: string, type: FulcrumAlert["alertType"]): string =>
  `${symbol.toLowerCase()}::${type}`;

const toBandSeverity = (score: number): FulcrumAlert["severity"] =>
  score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "elevated" : "low";

const clampHistory = <T>(rows: T[], max: number): T[] => (rows.length <= max ? rows : rows.slice(rows.length - max));

const formatNum = (value: number): string => value.toFixed(1);

export const toSymbolSnapshot = (intel: SymbolIntel, capturedAt = new Date().toISOString()): SymbolSnapshot => ({
  symbol: intel.symbol,
  capturedAt,
  squeezeScore: intel.squeezeScore,
  confidence: intel.confidence,
  price: intel.price,
  move1D: intel.move1D,
  volume: intel.volume,
  relativeVolume: intel.relativeVolume,
  catalystStatus: intel.catalystStatus,
  catalystSummary: intel.catalystSummary,
  explainabilityBreakdown: intel.explainabilityBreakdown,
  sourceFreshnessMinutes: intel.sourceFreshnessMinutes,
  dataOrigin: intel.dataOrigin
});

export const appendSnapshot = (snapshot: SymbolSnapshot): SymbolSnapshot[] => {
  const bucket = snapshotStore.get(snapshot.symbol) ?? [];
  const next = clampHistory([...bucket, snapshot], MAX_SNAPSHOTS_PER_SYMBOL);
  snapshotStore.set(snapshot.symbol, next);
  return next;
};

export const getRecentSnapshots = (symbol: string, limit = 10): SymbolSnapshot[] => {
  const bucket = snapshotStore.get(symbol) ?? [];
  return [...bucket].slice(-Math.max(1, limit)).reverse();
};

export const getLatestSnapshot = (symbol: string): SymbolSnapshot | undefined => {
  const bucket = snapshotStore.get(symbol);
  return bucket?.[bucket.length - 1];
};

export const getSnapshotDiff = (
  previous?: SymbolSnapshot,
  current?: SymbolSnapshot
): {
  scoreDelta: number;
  confidenceDelta: number;
  relativeVolumeDelta: number;
  catalystChanged: boolean;
  dataOriginChanged: boolean;
} | null => {
  if (!previous || !current) return null;
  return {
    scoreDelta: current.squeezeScore - previous.squeezeScore,
    confidenceDelta: current.confidence - previous.confidence,
    relativeVolumeDelta: current.relativeVolume - previous.relativeVolume,
    catalystChanged:
      previous.catalystStatus !== current.catalystStatus || previous.catalystSummary !== current.catalystSummary,
    dataOriginChanged: previous.dataOrigin !== current.dataOrigin
  };
};

const dominantDriverLabel = (snapshot: SymbolSnapshot): string => {
  const entries: Array<[string, number]> = [
    ["short", snapshot.explainabilityBreakdown.shortPressure],
    ["options", snapshot.explainabilityBreakdown.optionsPressure],
    ["volume", snapshot.explainabilityBreakdown.volumePressure],
    ["catalyst", snapshot.explainabilityBreakdown.catalystPressure],
    ["liquidity", snapshot.explainabilityBreakdown.liquidityPressure]
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
};

const driverScore = (snapshot: SymbolSnapshot, driver: string): number => {
  switch (driver) {
    case "short":
      return snapshot.explainabilityBreakdown.shortPressure;
    case "options":
      return snapshot.explainabilityBreakdown.optionsPressure;
    case "volume":
      return snapshot.explainabilityBreakdown.volumePressure;
    case "catalyst":
      return snapshot.explainabilityBreakdown.catalystPressure;
    case "liquidity":
      return snapshot.explainabilityBreakdown.liquidityPressure;
    default:
      return 0;
  }
};

export const detectSnapshotChanges = (
  previous: SymbolSnapshot | undefined,
  current: SymbolSnapshot
): SnapshotChangeEvent[] => {
  if (!previous) return [];
  const events: SnapshotChangeEvent[] = [];
  const scoreDelta = current.squeezeScore - previous.squeezeScore;
  const confidenceDelta = current.confidence - previous.confidence;
  const relVolDelta = current.relativeVolume - previous.relativeVolume;
  const previousDriver = dominantDriverLabel(previous);
  const currentDriver = dominantDriverLabel(current);

  if (scoreDelta >= CHANGE_THRESHOLDS.scoreMaterial) {
    events.push({
      symbol: current.symbol,
      type: "score-increase",
      message: `${current.symbol} squeeze score rose materially (${formatNum(previous.squeezeScore)} -> ${formatNum(current.squeezeScore)}).`,
      previousValue: formatNum(previous.squeezeScore),
      currentValue: formatNum(current.squeezeScore),
      magnitude: Number(scoreDelta.toFixed(2)),
      capturedAt: current.capturedAt
    });
  } else if (scoreDelta <= -CHANGE_THRESHOLDS.scoreMaterial) {
    events.push({
      symbol: current.symbol,
      type: "score-decrease",
      message: `${current.symbol} squeeze score cooled materially (${formatNum(previous.squeezeScore)} -> ${formatNum(current.squeezeScore)}).`,
      previousValue: formatNum(previous.squeezeScore),
      currentValue: formatNum(current.squeezeScore),
      magnitude: Number(Math.abs(scoreDelta).toFixed(2)),
      capturedAt: current.capturedAt
    });
  }

  if (Math.abs(confidenceDelta) >= CHANGE_THRESHOLDS.confidenceMaterial) {
    events.push({
      symbol: current.symbol,
      type: "confidence-change",
      message: `${current.symbol} confidence shifted ${confidenceDelta > 0 ? "up" : "down"} (${formatNum(previous.confidence)}% -> ${formatNum(current.confidence)}%).`,
      previousValue: formatNum(previous.confidence),
      currentValue: formatNum(current.confidence),
      magnitude: Number(Math.abs(confidenceDelta).toFixed(2)),
      capturedAt: current.capturedAt
    });
  }

  if (previous.catalystStatus !== current.catalystStatus || previous.catalystSummary !== current.catalystSummary) {
    events.push({
      symbol: current.symbol,
      type: "catalyst-change",
      message: `${current.symbol} catalyst shifted from ${previous.catalystStatus} to ${current.catalystStatus}.`,
      previousValue: `${previous.catalystStatus}: ${previous.catalystSummary}`,
      currentValue: `${current.catalystStatus}: ${current.catalystSummary}`,
      capturedAt: current.capturedAt
    });
  }

  if (Math.abs(relVolDelta) >= CHANGE_THRESHOLDS.relativeVolumeSpike) {
    events.push({
      symbol: current.symbol,
      type: "relative-volume-spike",
      message: `${current.symbol} relative volume changed sharply (${formatNum(previous.relativeVolume)}x -> ${formatNum(current.relativeVolume)}x).`,
      previousValue: formatNum(previous.relativeVolume),
      currentValue: formatNum(current.relativeVolume),
      magnitude: Number(Math.abs(relVolDelta).toFixed(2)),
      capturedAt: current.capturedAt
    });
  }

  if (
    previousDriver !== currentDriver &&
    Math.abs(driverScore(previous, previousDriver) - driverScore(current, currentDriver)) >= CHANGE_THRESHOLDS.driverShift
  ) {
    events.push({
      symbol: current.symbol,
      type: "driver-shift",
      message: `${current.symbol} dominant driver shifted from ${previousDriver} pressure to ${currentDriver} pressure.`,
      previousValue: previousDriver,
      currentValue: currentDriver,
      capturedAt: current.capturedAt
    });
  }

  return events;
};

const shouldAppendSnapshot = (previous: SymbolSnapshot | undefined, current: SymbolSnapshot): boolean => {
  if (!previous) return true;
  const diff = getSnapshotDiff(previous, current);
  if (!diff) return true;
  if (
    Math.abs(diff.scoreDelta) >= 1 ||
    Math.abs(diff.confidenceDelta) >= 1 ||
    Math.abs(diff.relativeVolumeDelta) >= 0.1 ||
    diff.catalystChanged ||
    diff.dataOriginChanged
  ) {
    return true;
  }
  const elapsed = new Date(current.capturedAt).getTime() - new Date(previous.capturedAt).getTime();
  return elapsed >= SNAPSHOT_MIN_INTERVAL_MS;
};

const upsertAlertMemory = (params: {
  symbol: string;
  companyName: string;
  alertType: FulcrumAlert["alertType"];
  severity: FulcrumAlert["severity"];
  confidence: number;
  explanation: string;
  timestamp: string;
  status?: AlertStatus;
}): AlertMemoryRecord => {
  const key = toAlertKey(params.symbol, params.alertType);
  const existingId = activeAlertIndex.get(key);
  const existing = existingId ? alertHistory.find((row) => row.id === existingId) : undefined;

  if (existing) {
    existing.updatedAt = params.timestamp;
    existing.severity = params.severity;
    existing.confidence = params.confidence;
    existing.explanation = params.explanation;
    existing.status = params.status ?? "active";
    if (existing.status === "active") {
      delete existing.resolvedAt;
    } else {
      existing.resolvedAt = params.timestamp;
      activeAlertIndex.delete(key);
    }
    return existing;
  }

  const id = `${params.symbol.toLowerCase()}-${params.alertType.replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
  const created: AlertMemoryRecord = {
    id,
    symbol: params.symbol,
    companyName: params.companyName,
    alertType: params.alertType,
    severity: params.severity,
    confidence: params.confidence,
    explanation: params.explanation,
    status: params.status ?? "active",
    createdAt: params.timestamp,
    updatedAt: params.timestamp,
    resolvedAt: params.status && params.status !== "active" ? params.timestamp : undefined
  };
  alertHistory.push(created);
  if (created.status === "active") {
    activeAlertIndex.set(key, id);
  }
  while (alertHistory.length > ALERT_HISTORY_LIMIT) {
    const removed = alertHistory.shift();
    if (removed) {
      activeAlertIndex.delete(toAlertKey(removed.symbol, removed.alertType));
    }
  }
  return created;
};

const resolveAlertIfActive = (symbol: string, type: FulcrumAlert["alertType"], timestamp: string): void => {
  const key = toAlertKey(symbol, type);
  const existingId = activeAlertIndex.get(key);
  if (!existingId) return;
  const existing = alertHistory.find((row) => row.id === existingId);
  if (!existing) return;
  existing.status = "resolved";
  existing.updatedAt = timestamp;
  existing.resolvedAt = timestamp;
  activeAlertIndex.delete(key);
};

const syncAlertMemoryFromIntel = (
  previous: SymbolSnapshot | undefined,
  current: SymbolSnapshot,
  intel: SymbolIntel
): void => {
  const timestamp = current.capturedAt;
  const scoreDelta = previous ? current.squeezeScore - previous.squeezeScore : 0;
  const confidenceDelta = previous ? current.confidence - previous.confidence : 0;

  if (current.squeezeScore >= CHANGE_THRESHOLDS.scoreAlertThreshold && (!previous || previous.squeezeScore < CHANGE_THRESHOLDS.scoreAlertThreshold)) {
    upsertAlertMemory({
      symbol: intel.symbol,
      companyName: intel.companyName,
      alertType: "score threshold crossed",
      severity: toBandSeverity(current.squeezeScore),
      confidence: Math.round(current.confidence),
      explanation: `${intel.symbol} crossed score trigger (${formatNum(previous?.squeezeScore ?? current.squeezeScore)} -> ${formatNum(current.squeezeScore)}) with short pressure ${intel.explainabilityBreakdown.shortPressure.toFixed(1)} and options pressure ${intel.explainabilityBreakdown.optionsPressure.toFixed(1)}.`,
      timestamp
    });
  } else if (current.squeezeScore < CHANGE_THRESHOLDS.resolveScoreFloor) {
    resolveAlertIfActive(intel.symbol, "score threshold crossed", timestamp);
  } else if (scoreDelta !== 0 && current.squeezeScore >= CHANGE_THRESHOLDS.scoreAlertThreshold) {
    upsertAlertMemory({
      symbol: intel.symbol,
      companyName: intel.companyName,
      alertType: "score threshold crossed",
      severity: toBandSeverity(current.squeezeScore),
      confidence: Math.round(current.confidence),
      explanation: `${intel.symbol} remains above trigger at ${formatNum(current.squeezeScore)}; short pressure ${intel.explainabilityBreakdown.shortPressure.toFixed(1)}, options pressure ${intel.explainabilityBreakdown.optionsPressure.toFixed(1)}.`,
      timestamp
    });
  }

  if (current.relativeVolume >= 4) {
    upsertAlertMemory({
      symbol: intel.symbol,
      companyName: intel.companyName,
      alertType: "abnormal volume spike",
      severity: toBandSeverity(current.squeezeScore),
      confidence: Math.round(current.confidence),
      explanation: `${intel.symbol} prints ${formatNum(current.relativeVolume)}x relative volume (${intel.move1D.toFixed(1)}% move).`,
      timestamp
    });
  } else if (current.relativeVolume < CHANGE_THRESHOLDS.resolveVolumeFloor) {
    resolveAlertIfActive(intel.symbol, "abnormal volume spike", timestamp);
  }

  if (intel.optionsVolumeRatio >= 2.8 || intel.callPutSkew >= 1.35) {
    upsertAlertMemory({
      symbol: intel.symbol,
      companyName: intel.companyName,
      alertType: "options acceleration",
      severity: toBandSeverity(current.squeezeScore),
      confidence: Math.round(current.confidence),
      explanation: `${intel.symbol} options acceleration persists (${intel.optionsVolumeRatio.toFixed(1)}x ratio, ${intel.callPutSkew.toFixed(2)} skew).`,
      timestamp
    });
  } else {
    resolveAlertIfActive(intel.symbol, "options acceleration", timestamp);
  }

  if (current.catalystStatus === "active") {
    upsertAlertMemory({
      symbol: intel.symbol,
      companyName: intel.companyName,
      alertType: "catalyst detected",
      severity: toBandSeverity(current.squeezeScore),
      confidence: Math.round(current.confidence),
      explanation: current.catalystSummary,
      timestamp
    });
  } else {
    resolveAlertIfActive(intel.symbol, "catalyst detected", timestamp);
  }

  if (Math.abs(confidenceDelta) >= CHANGE_THRESHOLDS.confidenceDeltaAlert) {
    upsertAlertMemory({
      symbol: intel.symbol,
      companyName: intel.companyName,
      alertType: confidenceDelta > 0 ? "confidence upgrade" : "confidence downgrade",
      severity: toBandSeverity(current.squeezeScore),
      confidence: Math.round(current.confidence),
      explanation: `${intel.symbol} confidence moved ${confidenceDelta > 0 ? "up" : "down"} to ${formatNum(current.confidence)}%.`,
      timestamp,
      status: confidenceDelta < 0 ? "downgraded" : "active"
    });
  }
};

export const recordIntelHistory = (intelRows: SymbolIntel[], capturedAt = new Date().toISOString()): void => {
  for (const intel of intelRows) {
    const current = toSymbolSnapshot(intel, capturedAt);
    const previous = getLatestSnapshot(intel.symbol);
    const shouldAppend = shouldAppendSnapshot(previous, current);
    if (!shouldAppend) continue;

    const detected = detectSnapshotChanges(previous, current);
    for (const event of detected) {
      changeEvents.push(event);
    }
    while (changeEvents.length > ALERT_HISTORY_LIMIT) {
      changeEvents.shift();
    }

    appendSnapshot(current);
    syncAlertMemoryFromIntel(previous, current, intel);
  }
};

export const getCurrentVsPreviousSnapshot = (symbol: string): { current?: SymbolSnapshot; previous?: SymbolSnapshot; diff: ReturnType<typeof getSnapshotDiff> } => {
  const bucket = snapshotStore.get(symbol) ?? [];
  const current = bucket[bucket.length - 1];
  const previous = bucket[bucket.length - 2];
  return {
    current,
    previous,
    diff: getSnapshotDiff(previous, current)
  };
};

export const getAlertMemory = (limit = 100): AlertMemoryRecord[] =>
  [...alertHistory].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, Math.max(1, limit));

export const getAlertMemoryForSymbol = (symbol: string, limit = 20): AlertMemoryRecord[] =>
  getAlertMemory(ALERT_HISTORY_LIMIT)
    .filter((row) => row.symbol.toLowerCase() === symbol.toLowerCase())
    .slice(0, Math.max(1, limit));

export const getRecentChangeEvents = (opts?: { symbol?: string; type?: SnapshotChangeType; limit?: number }): SnapshotChangeEvent[] => {
  const limit = Math.max(1, opts?.limit ?? 20);
  return [...changeEvents]
    .filter((event) => (opts?.symbol ? event.symbol.toLowerCase() === opts.symbol.toLowerCase() : true))
    .filter((event) => (opts?.type ? event.type === opts.type : true))
    .sort((a, b) => +new Date(b.capturedAt) - +new Date(a.capturedAt))
    .slice(0, limit);
};
