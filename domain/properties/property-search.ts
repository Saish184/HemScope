import { calculateFinancialResult } from "../finance/financial-engine.ts";
import type { BuyerProfile } from "../../types/buyer-profile";
import type { Property } from "../../types/property";
import type { SearchIntent } from "../../types/search-intent";

function validateNonnegative(value: number | undefined, field: string): void {
  if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
    throw new RangeError(`${field} must be a finite, nonnegative number.`);
  }
}

function normalizeCity(city: string): string {
  return city.trim().normalize("NFC").toLowerCase();
}

/**
 * Enforces explicit hard constraints with AND semantics, preserving input order.
 * Returns original property objects in a new array; preferences never filter.
 * Throws if a supplied hard constraint cannot be evaluated (no partial results).
 */
export function searchProperties(properties: readonly Property[], intent: SearchIntent): Property[] {
  const hard = intent.hardConstraints ?? {};
  if (hard.maximumWalkingTimeMinutes !== undefined) {
    throw new Error("maximumWalkingTimeMinutes cannot be evaluated: walking-time routing is not implemented.");
  }
  validateNonnegative(hard.maximumPurchasePriceSek, "maximumPurchasePriceSek");
  validateNonnegative(hard.minimumRooms, "minimumRooms");
  validateNonnegative(hard.maximumMonthlyCashRequirementSek, "maximumMonthlyCashRequirementSek");
  if (hard.city !== undefined && (typeof hard.city !== "string" || normalizeCity(hard.city) === "")) {
    throw new Error("city must be a nonempty string when supplied.");
  }
  const city = hard.city === undefined ? undefined : normalizeCity(hard.city);
  let buyer: BuyerProfile | undefined;
  const monthlyLimit = hard.maximumMonthlyCashRequirementSek;
  if (monthlyLimit !== undefined) {
    const financial = intent.financialPreferences;
    if (financial?.availableDownPaymentSek === undefined || financial.assumedAnnualInterestRate === undefined) {
      throw new Error("A monthly cash constraint requires availableDownPaymentSek and assumedAnnualInterestRate.");
    }
    validateNonnegative(financial.availableDownPaymentSek, "availableDownPaymentSek");
    validateNonnegative(financial.assumedAnnualInterestRate, "assumedAnnualInterestRate");
    buyer = {
      availableDownPaymentSek: financial.availableDownPaymentSek,
      assumedAnnualInterestRate: financial.assumedAnnualInterestRate,
    };
  }

  return properties.filter((property) => {
    if (city !== undefined && normalizeCity(property.city) !== city) return false;
    if (hard.maximumPurchasePriceSek !== undefined && property.purchasePriceSek > hard.maximumPurchasePriceSek) return false;
    if (hard.minimumRooms !== undefined && property.rooms < hard.minimumRooms) return false;
    if (monthlyLimit !== undefined && buyer !== undefined) {
      // Propagate missing costs, unsupported types, and invalid financing explicitly.
      const result = calculateFinancialResult(property, buyer);
      if (result.estimatedTotalMonthlyCashRequirementSek > monthlyLimit) return false;
    }
    return true;
  });
}
