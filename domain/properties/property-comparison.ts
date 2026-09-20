import type { PropertyAnalysis } from "../../types/property-analysis";
import type { PropertyComparison } from "../../types/property-comparison";

/**
 * Packages existing analyses in caller-supplied order without recalculation.
 * Copies the array; analysis objects remain shared references. Duplicates remain.
 */
export function compareProperties(analyses: readonly PropertyAnalysis[]): PropertyComparison {
  return { properties: [...analyses] };
}
