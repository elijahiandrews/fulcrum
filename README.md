# GSI by Fulcrum Intelligence

See the pressure before the move.

Global Squeeze Intelligence is a squeeze-risk outcome engine for discretionary trading desks, multi-manager teams, and risk operators. It identifies emerging squeeze-risk conditions with explainable scoring and source provenance—so teams can act before consensus reprices, not just browse another data feed.

## Stack

- Next.js + TypeScript frontend (`apps/web`)
- TypeScript ingestion/scoring worker (`apps/worker`)
- PostgreSQL schema + seed pipeline (`packages/db`)
- Modular source adapter and scoring engine (`packages/core`)
- Redis cache for near-real-time score distribution

## Local setup

1. Install dependencies:
   - `npm install`
2. Start infra:
   - `npm run db:up`
3. Run database migration:
   - `npm run db:migrate`
4. Seed demo dataset + alerts:
   - `npm run db:seed`
5. Optional scoring worker cycle:
   - `npm run worker:run`
6. Start the web app:
   - `npm run dev`
7. Open:
   - `http://localhost:3000`

## Local dev: away from the machine, sleep, and port 3000

Treat **`pnpm dev` (or `npm run dev`) as a session** you start when you are at the keyboard and stop when you are done. Local Next.js does not reliably survive **Windows sleep/hibernate**; waking the PC can leave odd network or watcher state.

**Before sleep or stepping away for a long time**

- In the terminal running the app, press **Ctrl+C** to stop the dev server so it does not keep holding **port 3000** or leave orphan `node` processes.

**After wake, or if localhost misbehaves**

1. Start fresh: open a new terminal in the repo root and run `pnpm dev` again.
2. If the log says **port 3000 is in use**, something else is still listening. Do **not** blindly kill every Node process (Cursor and other tools use Node too).
3. On Windows, find the PID: `netstat -ano | findstr :3000` — use **Task Manager → Details** to match the **PID** and end only that process if it is a leftover dev server, or close the terminal that started it.
4. If you only need the product while away from this PC, use the **deployed Vercel URL** instead of relying on a long-running local server.

## Production hosting (persistent cloud access)

Fulcrum's web app is deployable to persistent Next.js hosting (recommended: Vercel) so it remains reachable from phone or any device even when local machines are off.

- Run production build locally before deploy: `pnpm --filter @squeeze/web build`
- Deploy `apps/web` as the Vercel project root (monorepo-aware setup)
- Configure server-side env vars in Vercel:
  - `FMP_API_KEY`
  - `FINNHUB_API_KEY`
  - `FULCRUM_ACCESS_KEY` (required for gated product routes in public deployments)
  - `FULCRUM_ALLOW_STATUS_SIMULATION` (`false` in production)
  - `ORTEX_API_KEY` (optional; enables higher quality direct borrow-fee data)
  - `ORTEX_DEFAULT_MIC` (optional; defaults to `XNYS`)
  - `ORTEX_CTB_PATH_TEMPLATE` (optional; only if ORTEX tenant path differs)

## Public sharing model

- Public routes:
  - `/`
  - `/request-access`
  - `/access` (lightweight access wall)
- Gated routes (protected by `FULCRUM_ACCESS_KEY` + secure cookie):
  - `/platform`
  - `/regional-monitor`
  - `/alerts-center`
  - `/symbol/[id]`
  - `/api/platform`, `/api/regions`, `/api/alerts`, `/api/intel*`, `/api/symbols/*`

## Deployment checklist (public internet)

1. **Build check**
   - Run `pnpm --filter @squeeze/web build` locally and ensure success.
2. **Platform setup**
   - Deploy `apps/web` to Vercel (monorepo-aware project).
3. **Environment variables**
   - Required: `FMP_API_KEY`, `FINNHUB_API_KEY`, `FULCRUM_ACCESS_KEY`
   - Recommended: `FULCRUM_ALLOW_STATUS_SIMULATION=false`
4. **Route behavior validation**
   - Verify `/` and `/request-access` are public.
   - Verify gated pages redirect to `/access` without cookie.
   - Verify authenticated cookie unlocks product pages.
5. **API posture**
   - Confirm protected APIs return `401` without access cookie.
   - Confirm Fulcrum-shaped responses only (no raw provider payload leakage).
6. **Domain**
   - Connect custom domain in Vercel and enforce HTTPS.
7. **Final smoke test**
   - Verify nav links, access flow, fallback behavior with missing provider keys, and basic data render across core pages.

See `docs/cloud-deployment-checklist.md` for the full deploy checklist and architecture boundaries.

## Cloud architecture boundaries (current pass)

- **Persistent now on web host**
  - App pages/routes and APIs
  - Live provider fetch + fallback logic
  - Cached per-instance snapshot generation
- **Not durable yet (in-memory only)**
  - Historical snapshots + alert memory in `apps/web/lib/intel/history.ts`
  - Any in-memory cache/state resets on instance restart/redeploy
- **Needs dedicated infrastructure for always-on intelligence memory**
  - Durable DB persistence for snapshots/alerts
  - Background worker/cron for continuous refresh independent of request traffic
  - Optional Redis/shared cache for multi-instance coherence

## Included MVP deliverables

- Monorepo scaffold for apps/packages
- Production-minded schema for issuers, securities, snapshots, catalyst events, scores, alerts
- Data adapter interfaces and mock adapters
- Explainable scoring engine with sub-scores and confidence
- Dashboard pages:
  - landing page
  - overview (`/platform`)
  - regional monitor (`/region`)
  - symbol intelligence brief (`/symbol/[id]`)
  - alerts center (`/alerts`)
  - request-access onboarding (`/request-access`)
- Seed/demo data for US, UK, and EU symbols
- Branded Fulcrum visual shell and logo placeholder

## Trust and freshness policy

- Every score shows explainability notes and source freshness/provenance.
- Delayed sources are explicitly represented as delayed or regulatory cadence data.
- No "live" claims are made for delayed positioning disclosures.
