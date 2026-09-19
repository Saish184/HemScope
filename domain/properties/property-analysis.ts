import { calculateFinancialResult } from "../finance/financial-engine.ts";
import { findNearestLocation } from "../location/location-engine.ts";
import type { BuyerProfile } from "../../types/buyer-profile";
import type { AmenityType, Location } from "../../types/location";
import type { Property } from "../../types/property";
import type { PropertyAnalysis } from "../../types/property-analysis";

/**
 * Combines existing engine outputs; does not filter, rank, or interpret preferences.
 * The caller explicitly selects amenities (an empty list requests no location facts).
 * Underlying engine errors propagate unchanged; no partial analysis is returned.
 */
export function analyzeProperty(
  property: Property,
  buyerProfile: BuyerProfile,
  locations: readonly Location[],
  requestedAmenities: readonly AmenityType[],
): PropertyAnalysis {
  const financial = calculateFinancialResult(property, buyerProfile);
  const location: PropertyAnalysis["location"] = {};
  for (const amenity of new Set(requestedAmenities)) {
    location[amenity] = findNearestLocation(property, locations, amenity);
  }
  return { property, financial, location };
}
