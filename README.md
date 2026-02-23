# M&M Movie Awards

A private web app for tracking which movies friends have watched together and running end-of-year awards voting.

## Stack

- **Next.js 16** (App Router, React 19)
- **Prisma 7** with Prisma Accelerate (production) / `@prisma/adapter-pg` (local)
- **PostgreSQL 15**
- **Tailwind CSS 4**
- **Vercel** (hosting) — deployments are gated behind CI migrations

## Local Development

### Prerequisites

- Node.js 20+
- Docker (for local postgres)

### Setup

```bash
# 1. Clone and install dependencies
npm install

# 2. Copy the env template and fill in your TMDB key + site password
cp services/.env.local.example .env

# 3. Start the local postgres container
make services/up

# 4. Run migrations and seed the database
make db/setup

# 5. Start the dev server
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Makefile targets

| Target | Description |
|--------|-------------|
| `make services/up` | Start local postgres (port 54321) |
| `make services/down` | Stop local postgres |
| `make db/setup` | Run migrations + seed |
| `make db/migrate` | Run pending migrations only |
| `make db/seed` | Run seed only |
| `make db/reset` | Wipe volume, restart postgres, re-migrate + re-seed |

### Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Direct postgres URL — used at runtime locally (via `@prisma/adapter-pg`) |
| `DB_DATABASE_URL` | Direct postgres URL — used by `prisma migrate deploy` |
| `DB_PRISMA_DATABASE_URL` | Prisma Accelerate URL (`prisma+postgres://...`) — production only; triggers Accelerate path in `lib/prisma.ts` |
| `TMDB_API_KEY` | The Movie Database API key |
| `SITE_PASSWORD` | Password gate for the app |

See `services/.env.local.example` for the full template.

## CI/CD

Pushes to `main` trigger `.github/workflows/deploy.yml`, which:

1. Runs `prisma migrate deploy` against the production database
2. Runs `prisma db seed` (idempotent — uses upserts)
3. Deploys to Vercel with `vercel --prod`

If either the migrate or seed step fails, the Vercel deployment is skipped.

> **Note**: Vercel's Git auto-deploy is disabled on this project. All production deployments go through the CI workflow.

### Required GitHub Actions secrets

| Secret | Where to get it |
|--------|----------------|
| `DB_DATABASE_URL` | Direct postgres URL from production |
| `DB_PRISMA_DATABASE_URL` | Prisma Accelerate URL from production |
| `TMDB_API_KEY` | [themoviedb.org](https://www.themoviedb.org/settings/api) |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `orgId` in `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` in `.vercel/project.json` |
