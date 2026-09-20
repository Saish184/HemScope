# Property logic

`searchProperties(properties, intent)` in `property-search.ts` is a pure deterministic candidate filter. It accepts a readonly property array and a structured SearchIntent and returns the matching original Property objects in a new array, preserving input order. It imports the financial engine, not React, a database, a dataset, or an API.

## SearchIntent v1

All four sections and their fields are optional; `{}` is a valid intent.

- `hardConstraints`: city, maximumPurchasePriceSek, minimumRooms, maximumMonthlyCashRequirementSek, maximumWalkingTimeMinutes. These describe **what must be true**.
- `locationPreferences`: desiredNearbyAmenities. These describe **what the user would like**.
- `financialPreferences`: availableDownPaymentSek, assumedAnnualInterestRate, preferredMonthlyCashRequirementSek. The first two are calculation inputs; the last is a comfort preference, not an exclusion boundary.
- `tradeOffPreferences`: willingToPayMoreForLocation. This records **what the user is willing to sacrifice to gain something else**, without inventing a numerical premium.

Preferences and trade-offs remain untouched on the caller's intent for later analysis. They never filter or rank properties. The hard maximum monthly cash requirement and preferred monthly cash requirement intentionally have different semantics. BuyerProfile remains the financial engine's required-input contract; search explicitly projects the two supplied financing assumptions into it when needed.

## Supported constraints

City, maximum purchase price, minimum rooms, and evaluable maximum monthly cash requirement combine with AND semantics. Numeric boundaries are inclusive. Active numeric constraints must be finite and nonnegative; a supplied city must not be blank. No constraints returns all supplied valid properties. This module assumes Property objects satisfy the domain contract; it is not a general external-data ingestion validator.

Property.city is explicit factual data, separate from Property.area (neighborhood). City matching trims whitespace, normalizes Unicode to NFC, and lowercases. It performs exact matching afterward: no fuzzy matching, metropolitan-region expansion, aliases, or translation. Use `Göteborg` for the demo data; `Gothenburg` is not an automatic alias. The Mölndal example has city `Mölndal`.

Walking-time constraints are explicitly unsupported: supplying maximumWalkingTimeMinutes throws, even for an empty dataset. Geodesic distance is not substituted for walking time. Desired amenities stay separate for location analysis.

## Financial constraint policy

A monthly hard maximum requires both availableDownPaymentSek and assumedAnnualInterestRate; missing or invalid inputs throw before filtering, including for an empty array. No default rate or deposit is invented. Without a monthly hard constraint, no financial calculation is needed.

After city, price and room constraints pass, search calls `calculateFinancialResult(property, buyer)` and compares its unrounded estimatedTotalMonthlyCashRequirementSek to the inclusive maximum. Financial formulas are not duplicated. The main assumed-rate result is used, not sensitivity scenarios.

If a remaining candidate has unknown costs, an unsupported property type, or invalid financing (including a down payment larger than its price), the financial engine's error propagates and the entire search throws. There are no partial results or silently omitted unevaluable candidates. Properties already excluded by city/price/rooms do not require financial evaluation. Callers must resolve these errors before presenting matches as satisfying all hard constraints.

## Verification and scope

Run `node --test tests/property-search.test.mjs`, `node --test tests/*.test.mjs`, `npm run lint`, and `npm run build`. TypeScript's allowImportingTsExtensions is enabled with the existing noEmit setting so the direct financial-engine import also runs under Node's native TypeScript test support.

The property domain layer, including Property Comparison, does not perform AI interpretation, natural-language parsing, scoring, ranking, recommendations, routing, or UI integration. HemScope's server-side AI intent parser is implemented separately in `server/ai/`.

## Property analysis

Property Search answers: "Which properties satisfy the user's explicit hard constraints?"
Property Analysis answers: "What objective facts can we calculate about this candidate property?"

`analyzeProperty(property, buyerProfile, locations, requestedAmenities)` in `property-analysis.ts` composes the existing engines into the shared `PropertyAnalysis` type:

- `property`: the original Property object, without duplicating its fields.
- `financial`: the complete result of `calculateFinancialResult`, including sensitivity scenarios.
- `location`: a map keyed only by requested AmenityType values, each holding the existing `LocationDistanceResult` or `null`.

For example, request `["shopping", "public_transport"]` for both supported categories. An empty array requests no location analysis; no categories are assumed by default. Duplicate requests are evaluated once, preserving first-request order. An omitted key means unrequested; a null value means requested with no matching POI in the supplied dataset.

Financial calculations run first; `findNearestLocation` then supplies each requested geographic result, preserving the location engine's filtering, tie handling, validation, and unrounded meter values. Both engines' errors propagate unchanged; no partial result or invented default is returned. Location coordinates are evaluated only when an amenity is requested, following the existing engine behavior.

Inputs are not mutated. Returned property and matched POI objects retain their original references, so callers should treat these as shared data. The analysis is deterministic under the provided financing assumptions and geographic inputs, not a forecast. Nearest refers only to the supplied POI inventory; distance is geodesic, not walking distance or time.

This layer combines property, financial, and geographic facts as input for a future AI analysis layer. It does not interpret preferences, enforce search constraints, score, rank, or recommend properties. There is no additional calculation logic, dataset import, UI, API, or dependency.

Run `node --test tests/property-analysis.test.mjs` for composition tests and `node --test tests/*.test.mjs` for all domain tests, followed by lint and build.

## Property comparison

The architectural responsibilities remain separate:

- Property Search: "Which properties satisfy hard constraints?"
- Property Analysis: "What objective facts can we calculate about each property?"
- Property Comparison: "How do those objective facts differ between candidates?"
- AI Analyst (future): "What do those differences mean given the user's preferences?"

`compareProperties(analyses)` in `property-comparison.ts` returns a `PropertyComparison` containing only `{ properties: PropertyAnalysis[] }`. The analyses expose property dimensions, complete financial results and sensitivity scenarios, and requested geographic facts for comparison. No fields or calculations are duplicated. No derived differences are added at this stage.

The function accepts a readonly array, creates a shallow array copy, and preserves the supplied order, duplicate entries, and original analysis-object references. Empty and single-property collections are valid. Editing the returned array does not alter the input array; nested objects are shared and should be treated as shared data, not an independent snapshot.

Comparison neither reads nor recalculates financial/location values, and does not sort, rank, score, choose a winner, or infer preferences. Missing POI matches remain null and unrequested amenities remain omitted. It trusts the supplied analyses and does not verify that they used identical buyer assumptions or POI inventories; callers should supply consistent assumptions where comparisons require them.

A future consumer can receive SearchIntent alongside PropertyComparison to interpret these facts. No AI, UI, network access, dependencies, or recommendation logic is introduced here.

Run `node --test tests/property-comparison.test.mjs` for comparison tests, then all domain tests, lint, build, and `git diff --check`.
