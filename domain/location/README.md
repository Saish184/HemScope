# Location logic

`location-engine.ts` contains pure functions using shared `Coordinates` and `Location` (POI) types. It imports no dataset, React, Next.js, or HTTP functionality. Callers supply the data.

- `calculateDistanceMeters(a, b)` uses Haversine with a mean Earth radius of 6,371,000 meters, converting WGS84 decimal degrees into radians. It returns unrounded spherical great-circle distance, an approximation of ellipsoidal geodesic distance. The intermediate value is clamped for numerical stability near antipodes.
- `calculatePropertyLocationDistances(property, locations)` returns `{ location, distanceMeters }` results in input order. It only needs the property's `location` field.
- `findNearestLocation(property, locations, amenityType)` filters by type before calculating distance and selects the minimum in a single pass. No matching POI returns `null`; exact ties keep the first matching input. There is no sorting or input mutation. Result objects reference the original POIs.

Coordinates must be finite with latitude in [-90, 90] and longitude in [-180, 180]. Invalid inputs throw `RangeError`. Property coordinates are validated even for an empty collection; nearest lookup validates only matching POIs.

Local reference inputs live in `src/data/`; future external location data access belongs in `server/`. Nearest means nearest within the supplied dataset, not necessarily nearest in the real world. The current POI inventory is incomplete.

Geodesic distance is not walking distance or time and cannot validate `SearchIntent.hardConstraints.maximumWalkingTimeMinutes`. Candidate retrieval rejects this unsupported hard constraint. No walking-time conversion is implemented. Rivers, roads, entrances, and service availability are not modeled.

Run `node --test tests/*.test.mjs` on Node 24 for dataset and location-engine tests; no additional dependencies are required.
