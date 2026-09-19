# HemScope

Gothenburg property intelligence. This foundation provides a landing page and minimal TypeScript domain contracts. Search is visibly disabled; text entered in the page is not submitted or persisted.

## Development

Run `npm install`, then `npm run dev` and open http://localhost:3000.

Validation: `npm run lint` and `npm run build`.

The project uses Next.js 16.3.5, React 19, TypeScript, Tailwind CSS 4, and the App Router. Read the installed Next.js guides in `node_modules/next/dist/docs/` before changing framework code. System fonts avoid external font downloads.

## Architecture

| Path | Responsibility |
| --- | --- |
| `app/` | Routes, layouts, metadata, and global styles |
| `components/` | UI components, currently a server-rendered search input |
| `types/` | Shared property, cost-profile, coordinate, POI, buyer, search, and financial contracts |
| `src/data/` | Local synthetic properties and sourced POIs; see its README for calibration and provenance |
| `domain/properties/` | Deterministic hard-constraint candidate retrieval |
| `domain/finance/` | Deterministic apartment financing, recurring costs, and interest-rate scenarios |
| `domain/location/` | Pure Haversine distances and nearest-amenity lookup |
| `utils/` | Future domain-independent helpers |
| `server/` | Future server orchestration and data/integration access |
| `app/api/<feature>/route.ts` | Convention for future HTTP endpoints; none created yet |

Unimplemented folders contain short responsibility notes, not stub implementations. The location engine accepts coordinates and POIs from its caller. UI consumes shared types and eventual domain outputs; domain code remains independent of React, Next.js, and integrations. Server code will coordinate data access and domain functions.

AI is reserved for language interpretation and explanations. Database queries, filtering, distance and financial calculations, comparisons, and validation must use deterministic software.

## Contract conventions

- Monetary fields explicitly use SEK; size uses square meters; walking time uses minutes.
- Interest rates are annual decimal fractions (`0.04` means 4%).
- `Property.area` means neighborhood/district. `Property.location` holds latitude and longitude in decimal degrees.
- Association fees may be `null` when unknown or inapplicable; do not interpret null as zero.
- Search requirements are optional because a user may leave them unspecified.
- FinancialResult separates recurring housing costs from monthly cash requirements including amortization. V1 training rules and missing-cost handling are documented in `domain/finance/README.md`; rounding belongs at presentation boundaries.
- Types are compile-time contracts, not runtime validation. Validate external data when integrations are added.

The local demo dataset and domain engines are not connected to the UI. There is no database, authentication, parser, LLM integration, or map API. Add these only in separately scoped development tasks.
