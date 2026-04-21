import Redis from "ioredis";
import {
  computeExplainableScore,
  mockCatalystAdapter,
  mockMarketAdapter,
  mockOptionsAdapter,
  mockPositioningAdapter
} from "@squeeze/core";

async function runCycle(): Promise<void> {
  const market = await mockMarketAdapter.fetchMarketSnapshots();
  const positioning = await mockPositioningAdapter.fetchPositioningSnapshots();
  const options = await mockOptionsAdapter.fetchOptionsSnapshots();
  const catalysts = await mockCatalystAdapter.fetchCatalystEvents();

  const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

  for (const sec of market.map((m) => m.securityId)) {
    const score = computeExplainableScore({
      securityId: sec,
      region: sec.endsWith(".US") ? "US" : sec.endsWith(".L") ? "UK" : "EU",
      market: market.find((m) => m.securityId === sec)!,
      positioning: positioning.find((p) => p.securityId === sec)!,
      options: options.find((o) => o.securityId === sec)!,
      catalysts: catalysts.filter((c) => c.securityId === sec)
    });
    await redis.set(`score:${sec}`, JSON.stringify(score), "EX", 600);
  }

  await redis.quit();
  console.log("Worker scoring cycle complete.");
}

runCycle().catch((e) => {
  console.error(e);
  process.exit(1);
});
