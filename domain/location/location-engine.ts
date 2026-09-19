import type { AmenityType, Coordinates, Location } from "../../types/location";
import type { Property } from "../../types/property";

/** Distance to a POI within the supplied dataset, not a walking-route result. */
export interface LocationDistanceResult {
  location: Location;
  distanceMeters: number;
}

const EARTH_RADIUS_METERS = 6_371_000;
const DEGREES_TO_RADIANS = Math.PI / 180;

function validateCoordinates(point: Coordinates): void {
  if (
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude) ||
    point.latitude < -90 || point.latitude > 90 ||
    point.longitude < -180 || point.longitude > 180
  ) {
    throw new RangeError("Coordinates must be finite WGS84 degrees: latitude [-90, 90], longitude [-180, 180].");
  }
}

/**
 * Haversine great-circle distance in meters using a spherical Earth approximation.
 * Accepts WGS84 decimal degrees. Returns unrounded distance, not walking distance.
 * Throws RangeError for non-finite or out-of-range coordinates.
 */
export function calculateDistanceMeters(a: Coordinates, b: Coordinates): number {
  validateCoordinates(a);
  validateCoordinates(b);

  const latitudeDelta = (b.latitude - a.latitude) * DEGREES_TO_RADIANS;
  const longitudeDelta = (b.longitude - a.longitude) * DEGREES_TO_RADIANS;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(a.latitude * DEGREES_TO_RADIANS) *
    Math.cos(b.latitude * DEGREES_TO_RADIANS) *
    Math.sin(longitudeDelta / 2) ** 2;
  // Floating-point error near antipodes can otherwise put the value above 1.
  const clamped = Math.max(0, Math.min(1, haversine));
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped));
}

/** Returns one result per POI in input order, without modifying either input. */
export function calculatePropertyLocationDistances(
  property: Pick<Property, "location">,
  locations: readonly Location[],
): LocationDistanceResult[] {
  validateCoordinates(property.location);
  return locations.map((location) => ({
    location,
    distanceMeters: calculateDistanceMeters(property.location, location),
  }));
}

/**
 * Finds the nearest matching POI in the supplied dataset, or null if none match.
 * Exact ties keep the first matching POI in input order. Only matching POIs are
 * evaluated; invalid coordinates in those POIs throw RangeError.
 */
export function findNearestLocation(
  property: Pick<Property, "location">,
  locations: readonly Location[],
  amenityType: AmenityType,
): LocationDistanceResult | null {
  validateCoordinates(property.location);
  let nearest: LocationDistanceResult | null = null;
  for (const location of locations) {
    if (location.type !== amenityType) continue;
    const distanceMeters = calculateDistanceMeters(property.location, location);
    if (nearest === null || distanceMeters < nearest.distanceMeters) {
      nearest = { location, distanceMeters };
    }
  }
  return nearest;
}
