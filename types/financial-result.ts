/** A hypothetical rate scenario, not a forecast. All monetary amounts are SEK. */
export interface FinancialSensitivityScenario {
  /** Annual decimal fraction; 0.025 means 2.5%. */
  assumedAnnualInterestRate: number;
  monthlyInterestSek: number;
  monthlyAmortizationSek: number;
  /** Interest plus recurring property costs; excludes principal repayment. */
  monthlyRecurringHousingCostSek: number;
  estimatedTotalMonthlyCashRequirementSek: number;
}

/** Complete result under explicit assumptions. All monetary amounts are SEK. */
export interface FinancialResult {
  mortgageAmountSek: number;
  /** Decimal fraction; 0.85 means 85%. */
  loanToValueRatio: number;
  /** Annual decimal fraction under the v1 training rules. */
  annualAmortizationRate: number;
  monthlyInterestSek: number;
  monthlyAmortizationSek: number;
  /** Association fee, electricity, insurance, and internet; excludes financing. */
  monthlyRecurringPropertyCostsSek: number;
  /** Interest plus recurring property costs; excludes principal repayment. */
  monthlyRecurringHousingCostSek: number;
  /** Monthly cash outflow, including amortization. */
  estimatedTotalMonthlyCashRequirementSek: number;
  sensitivityScenarios: FinancialSensitivityScenario[];
}
