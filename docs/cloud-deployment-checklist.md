# Fulcrum Cloud Deployment Checklist

Use this checklist to make Fulcrum reachable at a stable public URL even when local development machines are off.

## 1) Repo + Host Setup

- [ ] Push latest `main` to GitHub
- [ ] Create Vercel project from GitHub repo
- [ ] Set root directory to `apps/web`
- [ ] Confirm framework is detected as Next.js
- [ ] Keep build command default (`next build`) or monorepo equivalent

## 2) Environment Variables (Vercel Project Settings)

Required for best live intelligence:

- [ ] `FMP_API_KEY`
- [ ] `FINNHUB_API_KEY`

Optional but recommended for stronger borrow-fee credibility:

- [ ] `ORTEX_API_KEY`
- [ ] `ORTEX_DEFAULT_MIC` (default `XNYS` is acceptable)
- [ ] `ORTEX_CTB_PATH_TEMPLATE` (only if your ORTEX tenant path differs)

Notes:

- Secrets must be server-side only (Vercel project env vars). Do not expose as `NEXT_PUBLIC_*`.
- Fulcrum runs in fallback mode if keys are missing, but confidence and provenance will reflect weaker data quality.

## 3) Production Verification

- [ ] Deploy and open public URL from desktop
- [ ] Open same URL from phone over cellular (not local Wi-Fi only)
- [ ] Verify key pages load:
  - [ ] `/platform`
  - [ ] `/symbol/gme` (or another tracked symbol)
  - [ ] `/alerts-center`
- [ ] Verify APIs return 200:
  - [ ] `/api/intel`
  - [ ] `/api/platform`
  - [ ] `/api/alerts`
- [ ] Confirm provider status/provenance behaves as expected (live/proxy/fallback)

## 4) Domain + Always-Accessible URL

- [ ] Attach custom domain in Vercel
- [ ] Configure DNS and HTTPS
- [ ] Set canonical URL in product docs/comms

## 5) What Is Persistent Today vs Later

Persistent now (with Vercel deploy):

- Next.js app routes/pages
- API routes and on-demand data fetch path
- Public URL uptime (independent of local machine)

Not durable yet (resets on instance restart/redeploy):

- In-memory historical snapshots
- In-memory alert-memory event history
- Per-instance in-memory cache

## 6) Minimal Additional Infra for True Always-On Intelligence Memory

For durable memory and continuous intelligence even with zero traffic:

- [ ] Managed Postgres for snapshot/alert persistence
- [ ] Scheduled worker/cron (Vercel Cron or separate worker service) for periodic refresh
- [ ] Optional Redis for shared cache/rate protection across instances

This is the minimum path from "always reachable app" to "always-on persistent intelligence system."
