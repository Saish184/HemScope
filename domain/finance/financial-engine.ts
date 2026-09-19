import type { BuyerProfile } from "../../types/buyer-profile";
import type { FinancialResult, FinancialSensitivityScenario } from "../../types/financial-result";
import type { Property } from "../../types/property";

const SCENARIO_RATES = [0.025, 0.03, 0.035, 0.04, 0.05] as const;

function validateNonnegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${field} must be a finite, nonnegative number.`);
  }
}

/**
 * Calculates an apartment's monthly cash requirements under v1 training rules.
 * Unknown costs reject the calculation; known zero costs are accepted.
 * No rounding, tax relief, lending approval, or rate prediction is applied.
 */
export function calculateFinancialResult(
  property: Property,
  buyer: BuyerProfile,
): FinancialResult {
  if (property.propertyType !== "apartment") {
    throw new Error("Financial Engine v1 supports apartment properties only.");
  }
  const price = property.purchasePriceSek;
  if (!Number.isFinite(price) || price <= 0) {
    throw new RangeError("purchasePriceSek must be a finite number greater than zero.");
  }
  validateNonnegative(buyer.availableDownPaymentSek, "availableDownPaymentSek");
  if (buyer.availableDownPaymentSek > price) {
    throw new RangeError("availableDownPaymentSek must not exceed purchasePriceSek.");
  }
  validateNonnegative(buyer.assumedAnnualInterestRate, "assumedAnnualInterestRate");
  if (property.monthlyAssociationFeeSek === null) {
    throw new Error("monthlyAssociationFeeSek is unknown; a complete financial result requires a known fee.");
  }
  validateNonnegative(property.monthlyAssociationFeeSek, "monthlyAssociationFeeSek");
  if (property.costProfile == null) {
    throw new Error("costProfile is missing; a complete financial result requires recurring-cost assumptions.");
  }
  const costs = property.costProfile;
  validateNonnegative(costs.monthlyElectricityEstimateSek, "monthlyElectricityEstimateSek");
  validateNonnegative(costs.monthlyInsuranceEstimateSek, "monthlyInsuranceEstimateSek");
  validateNonnegative(costs.monthlyInternetEstimateSek, "monthlyInternetEstimateSek");

  const mortgageAmountSek = price - buyer.availableDownPaymentSek;
  const loanToValueRatio = mortgageAmountSek / price;
  const annualAmortizationRate = loanToValueRatio > 0.7 ? 0.02 : loanToValueRatio > 0.5 ? 0.01 : 0;
  const monthlyAmortizationSek = mortgageAmountSek * annualAmortizationRate / 12;
  const monthlyRecurringPropertyCostsSek = property.monthlyAssociationFeeSek +
    costs.monthlyElectricityEstimateSek + costs.monthlyInsuranceEstimateSek +
    costs.monthlyInternetEstimateSek;

  function calculateScenario(assumedAnnualInterestRate: number): FinancialSensitivityScenario {
    const monthlyInterestSek = mortgageAmountSek * assumedAnnualInterestRate / 12;
    const monthlyRecurringHousingCostSek = monthlyInterestSek + monthlyRecurringPropertyCostsSek;
    const estimatedTotalMonthlyCashRequirementSek = monthlyRecurringHousingCostSek + monthlyAmortizationSek;
    if (!Number.isFinite(estimatedTotalMonthlyCashRequirementSek)) {
      throw new RangeError("Financial calculation exceeds the supported finite numeric range.");
    }
    return {
      assumedAnnualInterestRate,
      monthlyInterestSek,
      monthlyAmortizationSek,
      monthlyRecurringHousingCostSek,
      estimatedTotalMonthlyCashRequirementSek,
    };
  }

  const base = calculateScenario(buyer.assumedAnnualInterestRate);
  return {
    mortgageAmountSek,
    loanToValueRatio,
    annualAmortizationRate,
    monthlyInterestSek: base.monthlyInterestSek,
    monthlyAmortizationSek,
    monthlyRecurringPropertyCostsSek,
    monthlyRecurringHousingCostSek: base.monthlyRecurringHousingCostSek,
    estimatedTotalMonthlyCashRequirementSek: base.estimatedTotalMonthlyCashRequirementSek,
    sensitivityScenarios: SCENARIO_RATES.map(calculateScenario),
  };
}
