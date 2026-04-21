import { getLiveIntelSnapshot } from "./live";
import { getAlertMemory } from "./history";
import { FulcrumAlert } from "./types";

export const getSymbolIntelDataset = async () => {
  const snapshot = await getLiveIntelSnapshot();
  return snapshot.symbols.slice().sort((a, b) => b.squeezeScore - a.squeezeScore);
};

export const getGeneratedAlerts = async (): Promise<FulcrumAlert[]> => {
  await getSymbolIntelDataset();
  return getAlertMemory(200).map(
    (record): FulcrumAlert => ({
      id: record.id,
      timestamp: record.updatedAt,
      symbol: record.symbol,
      companyName: record.companyName,
      alertType: record.alertType,
      severity: record.severity,
      confidence: record.confidence,
      explanation: record.explanation,
      status: record.status
    })
  );
};
