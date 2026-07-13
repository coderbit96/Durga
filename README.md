# PujoPath Kolkata

A production-ready Next.js foundation for discovering Durga Puja pandals in
Kolkata, planning route stops, saving favorites, and browsing suggested routes.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- Mongoose
- Zod environment validation
- Zustand-ready state layer
- dnd-kit drag and drop
- Vitest and Testing Library

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

The server-only map key is validated in `src/lib/env.ts` and must not be imported
from client components. Client-safe values live in `src/lib/public-env.ts`.

| Variable | Notes |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string for future persistence. |
| `NEXT_PUBLIC_APP_URL` | Public app origin. Defaults to `http://localhost:3000`. |
| `MAP_PROVIDER` | `mock`, `osm`, `none`, `google`, or `mapbox`. Defaults to `mock`. |
| `MAPS_SERVER_API_KEY` | Server-only map key. Never expose to browser code. |
| `NEXT_PUBLIC_MAPS_BROWSER_KEY` | Browser-safe map key when maps are enabled. |
| `SHARED_PLAN_TTL_HOURS` | Shared plan expiration window. Defaults to `72`. |
| `NEXT_PUBLIC_DEFAULT_PUJA_YEAR` | Default Puja year shown by client code. |
| `NEXT_PUBLIC_MAX_PLAN_STOPS` | Client route stop limit. Defaults to `8`. |

Optional map values can be omitted during local development, so non-map pages
continue to render while map integrations are unfinished.

## Map Providers

Map logic is provider-independent under `src/lib/maps`. The common interface
supports geocoding, reverse geocoding, routing, distance matrix, and external
navigation URLs.

Set `MAP_PROVIDER` to switch providers:

```bash
MAP_PROVIDER=mock
MAP_PROVIDER=osm
```

`mock` is deterministic and used for tests. `osm` uses OpenStreetMap/Nominatim
for geocoding and normalized mock routing/distance fallbacks. Provider-specific
response shapes stay inside adapters. Server API keys belong only in
`MAPS_SERVER_API_KEY`; browser display keys, when introduced, must be restricted
to the app domain before deployment.

## Scripts

```bash
npm run lint
npm run test
npm run test:ci
npm run build
npm run data:validate
npm run data:seed
npm run data:import-csv -- path/to/pujas.csv data/pujas-import.json
```

## Annual Data Workflow

This project intentionally uses a no-admin workflow for festival data. Update
versioned files, validate them, and seed MongoDB through scripts.

1. Copy the previous year's files in `data/` to the new year, for example
   `data/pujas-2026.json` and `data/routes-2026.json`.
2. Mark draft records as unverified until source checks are complete. The bundled
   2026 records are `[SAMPLE]` development examples and are not verified
   current-year theme information.
3. Run validation before any database write:

```bash
npm run data:validate
```

4. Seed with upsert by `slug` and `year`:

```bash
npm run data:seed
```

5. To import a working CSV into JSON:

```bash
npm run data:import-csv -- path/to/pujas.csv data/pujas-import.json
```

The CSV importer writes valid JSON records and reports invalid rows. It expects
columns such as `slug`, `year`, `name_en`, `name_bn`, `zone`, `locality`,
`categories`, `tags`, `address_en`, `address_bn`, `latitude`, `longitude`,
`themeTitle_en`, and `themeDescription_en`.

The seed script never deletes production data by default. The optional
`--replace` path is guarded and only removes records present in the input files:

```bash
npm run data:seed -- --replace --confirm-replace
```

Public APIs hide unverified pujas by default. During development only, pass
`includeUnverified=true` to inspect draft/sample data.

## Privacy and Safety

Location is requested only after a user action. Exact current location is kept in
session/client state for route estimates, is not stored in MongoDB by default,
and is excluded from shared plans unless explicitly included by the user. Do not
send coordinates to analytics. Festival route results are estimates; traffic,
barricades, police instructions, and temporary access rules can change quickly.

## Routes

- `/`
- `/pujas/north-kolkata`
- `/pujas/south-kolkata`
- `/puja/[slug]`
- `/plan`
- `/favorites`
- `/routes`
- `/routes/[slug]`
- `/about`

## API Routes

- `GET /api/pujas`
- `GET /api/pujas/[slug]`
- `GET /api/routes`
- `GET /api/routes/[slug]`
- `POST /api/route`
- `POST /api/shared-plans`
- `GET /api/shared-plans/[shareCode]`

`GET /api/pujas` supports `zone`, `year`, `search`, `category`, `tag`,
`featured`, `nearLat`, `nearLng`, `radiusKm`, `sort`, `page`, and `limit`.
Map route and shared-plan endpoints validate payloads with Zod, apply basic
rate limits, and avoid exposing server-side map keys.

## Language Support

The interface includes English and Bengali dictionaries with a persistent
language switcher. Puja content uses bilingual fields and falls back to English
when a localized value is missing. URLs stay language-neutral and stable.

## Notes

Authentication and admin screens are intentionally out of scope for this base.
The visual direction uses warm paper surfaces, sindoor red, tram teal, marigold
accents, and subtle alpana-inspired background patterning.
