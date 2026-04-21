import { CatalystEvent, MarketSnapshot, OptionsSnapshot, PositioningSnapshot } from "./types";

export interface AdapterHealth {
  adapterKey: string;
  healthy: boolean;
  lastSuccessfulFetchAt?: string;
  message?: string;
}

export interface MarketDataAdapter {
  key: string;
  fetchMarketSnapshots(): Promise<MarketSnapshot[]>;
}

export interface PositioningAdapter {
  key: string;
  fetchPositioningSnapshots(): Promise<PositioningSnapshot[]>;
}

export interface CatalystAdapter {
  key: string;
  fetchCatalystEvents(): Promise<CatalystEvent[]>;
}

export interface OptionsAdapter {
  key: string;
  fetchOptionsSnapshots(): Promise<OptionsSnapshot[]>;
}
