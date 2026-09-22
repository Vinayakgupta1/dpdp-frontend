# DPDP Sentinel — Frontend Showcase

A standalone copy of the DPDP Sentinel frontend that demonstrates the full UI
using **sample data generated in the browser**. The site itself runs without a
backend, except for one live path: the **Start a review** form on the Landing
page, which uploads a name, email, and APK to a small Cloudflare Worker that
stores the submission in Cloudflare R2 (see [Intake worker](#apk-intake-cloudflare-worker--r2)).

## What is included

- All 10 pages: Landing, How it Works, Dashboard / Portfolio, New Scan,
  Report (all 6 tabs), Reports, Audit Trails, Admin Labels, SDK Threats, Settings
- Hindi/English language toggle, dark cyber-themed design system
- Offline "audit-trail PDF" export (a valid PDF is generated client-side)
- Simulated scan pipeline on the **New Scan** page (upload → static → rules →
  AI → report) that lands on a populated demo report page
- Live APK intake form on the **Landing** page (name + email + APK →
  Cloudflare Worker → R2)

## What is NOT included

- No real APK scanning, DPDP rule engine, or machine-learning inference
  (all other `src/services/api.ts` calls are mocked)
- No automated workflow after an APK is received — intake only stores the
  submission for a review team to pick up

## Quick start

```bash
cd frontend-showcase
npm install
npm start
```

Open http://localhost:3000 and explore. No environment variables are required —
the intake form shows a clear error until `REACT_APP_INTAKE_URL` is configured.

## APK intake (Cloudflare Worker + R2)

The Landing form POSTs multipart `FormData` (name, email, apk) to
`process.env.REACT_APP_INTAKE_URL`. The worker in `worker/` validates the
request and stores one JSON metadata document plus the APK per submission in R2.

```bash
# 0. Prereqs: Node 18+, wrangler logged in, and an R2 bucket created:
#    wrangler r2 bucket create dpdp-sentinel-submissions

# 1. Set the frontend URL
cp .env.example .env
# edit .env → REACT_APP_INTAKE_URL

# 2. Build the frontend
npm run build

# 3. Deploy the worker (from worker/)
cd worker
wrangler deploy

# 4. Deploy the static site to Cloudflare Pages
cd ..
npx wrangler pages deploy build/
```

Uploads are limited to 100 MB and must be `.apk` files. Submissions land in the
`SUBMISSIONS_BUCKET` R2 bucket under `submissions/<id>/` (`metadata.json` +
the APK), and the worker returns `201 { id, status, createdAt, apkName, apkSize, apkKey }`.

## Production build

```bash
npm run build
```

Deploy the `build/` folder to any static host (or use the included `Dockerfile`/`nginx.conf`).

## How it works

- `src/mocks/demo.ts` — deterministic sample data (apps, findings, DPDP reports,
  runtime/GNN results, SDK threats, feedback records).
- `src/services/api.ts` — exports the same API surface as the real frontend,
  but resolves promises with demo data plus a short simulated latency.
- `src/lib/demoPdf.ts` — tiny client-side PDF generator for the export buttons.
- `worker/src/index.js` + `worker/wrangler.toml` — the live intake endpoint.

New-scan simulation lives in `src/services/api.ts` (`activeScans` map), advancing
the UI through `upload → mobsf → rules → ai → report` as the page polls.