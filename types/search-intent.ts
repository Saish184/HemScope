import type { AmenityType } from "./location";

/** Omitted requirements are unspecified, not zero. */
export interface SearchIntent {
  city?: string;
  maximumPurchasePriceSek?: number;
  minimumRooms?: number;
  maximumMonthlyCostSek?: number;
  desiredNearbyAmenities?: AmenityType[];
  /**
   * Desired walking-time limit to each requested amenity. Requires future routing
   * data; straight-line/geodesic distance cannot validate this requirement.
   */
  maximumWalkingTimeMinutes?: number;
}
