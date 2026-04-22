# Fulcrum Cloud Deployment Checklist

Use this checklist to make Fulcrum reachable at a stable public URL even when local development machines are off.

## 0) Design / UI updates — keep Vercel in sync with local

Vercel **only** deploys what is in **Git**. It does not mirror your machine automatically. To put the same design you see locally on the public site:

1. From the **monorepo root**, run a production build: `pnpm --filter @squeeze/web build` and fix any errors.
2. **Commit** the changes and **push** to the branch Vercel uses for **Production** (most teams use `main`). Opening a PR and merging into that branch also triggers a production deploy.
3. Confirm the deployment in **Vercel → Deployments** (status **Ready**, commit SHA matches your work), then open your production URL and spot-check `/` and any routes you changed.
4. Optional: push a **feature branch** first; Vercel creates a **Preview** URL so you can review before merging to production.

If production still looks old, check **Vercel → Project → Settings → Git** (correct repo and production branch) and that you pushed to that branch, not only a local or fork branch.

### When production doesn’t look like `localhost:3000`

`next dev` and the Vercel build are **not identical** (different bundling, caching, fonts). Use this order:

1. **Confirm the same commit is live**  
   - Vercel → **Deployments** → open the production deployment → note the **Git commit** (or in the browser, **Inspect** → `<html>` has `data-deployment-sha="…"`; it should match `git rev-parse HEAD` on the branch you deploy from).  
   - If the SHA differs, you’re not looking at the code you think you shipped.

2. **Rule out stale assets in the browser**  
   - Hard refresh (**Ctrl+Shift+R**), or open the site in a **private/incognito** window. CDNs and the browser cache can show an older CSS/JS bundle.

3. **Match “real” production locally** (closest to Vercel)  
   - From monorepo root: `pnpm --filter @squeeze/web build` then `pnpm --filter @squeeze/web start` and open `http://localhost:3000`.  
   - If **this** matches Vercel but `pnpm dev` does not, differences are dev-server/HMR noise, not the deploy.

4. **Vercel project shape**  
   - **Root Directory** must be **`apps/web`** for this repo layout.  
   - If the root is wrong, you may be deploying an old or partial tree.

5. **Force a clean build on Vercel**  
   - **Deployments** → **⋯** on the latest → **Redeploy** → enable **Clear cache and redeploy** if styles/assets look one deploy behind.

6. **Access gate** (`FULCRUM_ACCESS_KEY`)  
   - Only affects **gated** routes (e.g. `/platform`), **not** the homepage `/`. It won’t change global CSS for `/`.

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
