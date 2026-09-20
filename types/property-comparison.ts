import type { PropertyAnalysis } from "./property-analysis";

/** An ordered collection of analyzed facts, with no scores or recommendations. */
export interface PropertyComparison {
  properties: PropertyAnalysis[];
}
