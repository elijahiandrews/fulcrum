export type LiveStatusScenario =
  | "healthy"
  | "missing_fmp"
  | "finnhub_error"
  | "fmp_error"
  | "both_unavailable";

export const parseLiveStatusScenario = (request: Request): LiveStatusScenario | undefined => {
  const scenario = new URL(request.url).searchParams.get("simulate");
  if (
    scenario === "healthy" ||
    scenario === "missing_fmp" ||
    scenario === "finnhub_error" ||
    scenario === "fmp_error" ||
    scenario === "both_unavailable"
  ) {
    return scenario;
  }
  return undefined;
};
