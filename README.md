# Fulcrum

See the pressure before the move.

Fulcrum is a web-based squeeze-intelligence platform focused on identifying emerging squeeze-risk conditions with explainable scoring and source provenance.

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
