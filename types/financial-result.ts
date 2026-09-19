/** Output contract for the future deterministic engine. All amounts are SEK. */
export interface FinancialResult {
  mortgageAmountSek: number;
  monthlyInterestSek: number;
  monthlyAmortizationSek: number;
  monthlyRecurringPropertyCostsSek: number;
  /** Monthly cash outflow, including amortization. */
  estimatedTotalMonthlyCashRequirementSek: number;
}
