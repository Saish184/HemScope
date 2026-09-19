import type { LocationDistanceResult } from "../domain/location/location-engine";
import type { FinancialResult } from "./financial-result";
import type { AmenityType } from "./location";
import type { Property } from "./property";

/** Deterministic facts under supplied assumptions, without preference interpretation. */
export interface PropertyAnalysis {
  property: Property;
  financial: FinancialResult;
  /**
   * Absent key: not requested. Null: requested, but no matching POI in the dataset.
   * Distances are geodesic meters, not walking distances or times.
   */
  location: Partial<Record<AmenityType, LocationDistanceResult | null>>;
}
