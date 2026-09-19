import type { AmenityType } from "./location";

/** Omitted requirements are unspecified, not zero. */
export interface SearchIntent {
  hardConstraints?: {
    city?: string;
    maximumPurchasePriceSek?: number;
    minimumRooms?: number;
    /** Inclusive exclusion boundary, unlike the preferred comfort level below. */
    maximumMonthlyCashRequirementSek?: number;
    /** Unsupported until routing exists; candidate search rejects this constraint. */
    maximumWalkingTimeMinutes?: number;
  };
  locationPreferences?: {
    desiredNearbyAmenities?: AmenityType[];
  };
  financialPreferences?: {
    availableDownPaymentSek?: number;
    /** Comfort preference only; does not exclude properties. */
    preferredMonthlyCashRequirementSek?: number;
    /** Annual decimal fraction; 0.04 means 4%. */
    assumedAnnualInterestRate?: number;
  };
  tradeOffPreferences?: {
    /** Explicit willingness, not a numerical premium or a ranking instruction. */
    willingToPayMoreForLocation?: boolean;
  };
}
