import type { Coordinates } from "./location";
import type { PropertyCostProfile } from "./property-cost-profile";

export type PropertyType = "apartment" | "house" | "townhouse";

export interface Property {
  id: string;
  address: string;
  /** Explicit city name; distinct from neighborhood and metropolitan region. */
  city: string;
  /** Neighborhood or district, not floor area. */
  area: string;
  purchasePriceSek: number;
  rooms: number;
  sizeSqm: number;
  /** Null when unknown or not applicable; zero means a known zero fee. */
  monthlyAssociationFeeSek: number | null;
  propertyType: PropertyType;
  location: Coordinates;
  /** Missing means assumptions are unavailable, not zero recurring costs. */
  costProfile?: PropertyCostProfile;
}
