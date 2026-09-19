# Financial logic

`calculateFinancialResult(property, buyer)` in `financial-engine.ts` is a pure deterministic function. It uses the existing Property, PropertyCostProfile, BuyerProfile, and FinancialResult contracts. It has no dataset imports, UI, network access, or external dependencies. It calculates scenarios, never recommendations or predictions.

## Inputs and validation

V1 supports apartments treated as bostadsrätter. Other property types are rejected. Purchase price must be finite and greater than zero. Down payment must be finite, nonnegative, and no greater than purchase price. The entire available down payment is assumed to be applied to the purchase. Annual interest rates are nonnegative finite decimal fractions (0.0275 means 2.75%).

A complete result requires a known association fee and all three recurring-cost estimates. A null fee or missing cost profile throws a descriptive error; unknown costs are never replaced by zero and no partial totals are returned. Known zero costs are valid. Each cost must be finite and nonnegative. Invalid numeric values throw RangeError, as does numeric overflow; missing assumptions and unsupported property types throw Error.

## Formulas and outputs

All monetary values are SEK. No intermediate or output rounding occurs; presentation code can round to öre or whole kronor. JavaScript numbers have ordinary floating-point precision; this is a scenario engine, not an accounting ledger.

- Mortgage = purchase price - available down payment.
- Loan-to-value ratio (LTV) = mortgage / purchase price, as a decimal.
- Monthly interest = mortgage × assumed annual interest rate / 12.
- Monthly amortization = mortgage × annual amortization rate / 12.
- Monthly recurring property costs = association fee + electricity + insurance + internet.
- Monthly recurring housing cost = interest + recurring property costs, excluding amortization.
- Estimated monthly cash requirement = recurring housing cost + amortization.

FinancialResult exposes these amounts, LTV, the applied annual amortization rate, and sensitivity scenarios. Amortization is principal repayment: monthly cash requirement must not be described as “true cost.” Interest is gross, before any tax relief. Expense estimates are explicit assumptions, not predictions.

## V1 amortization assumptions

The task's training policy is implemented literally: LTV > 70% uses 2% annual amortization; LTV > 50% and <= 70% uses 1%; LTV <= 50% uses 0%. Exact 70% and 50% boundaries belong to the lower band. There is no income-based additional 1% requirement in this model, and no income is invented. These are project assumptions, not a claim of comprehensive current mortgage regulation or bank approval.

Amortization and interest use the starting mortgage balance. There is no repayment schedule, balance reduction over time, revaluation, or future band transition. A fully cash-funded purchase produces zero interest and amortization. A zero-down-payment scenario can be calculated, but this does not establish its eligibility for a mortgage. No mortgage lending cap is enforced.

## Sensitivity

Five hypothetical annual rates are evaluated independently: 2.5%, 3%, 3.5%, 4%, and 5%. Each FinancialSensitivityScenario contains its decimal rate, monthly interest, unchanged monthly amortization, recurring housing cost, and total monthly cash requirement. Principal, LTV, fees, and cost estimates remain fixed. These are neither probabilities nor expected or predicted future rates. The buyer's base rate is always used for the main result, even when absent from the scenario list.

## Limitations and intentionally omitted features

Cost profiles assume the three expenses are separate from the association fee. Callers must provide a known zero incremental amount for a service already included in the fee, avoiding double counting. Missing data requires clarification by the caller before calculation.

V1 does not include income-based affordability, bank-specific mortgage approval, credit scoring, future property-price prediction, future interest-rate prediction, tax optimization or interest tax deductions, house/småhus property tax, BRF financial-health analysis, selling costs, capital gains tax, ownership-horizon analysis, AI interpretation, financial ranking/scoring, or personalized recommendations. It also does not implement property search, parsing, UI, database access, or APIs.

The training rules and cost assumptions should be reviewed before any real financial use. Future AI may interpret user preferences and explain computed observations; all financial arithmetic stays deterministic.

## Verification

Run `node --test tests/financial-engine.test.mjs`, `node --test tests/*.test.mjs`, `npm run lint`, and `npm run build` on the project's existing Node 24 setup. Tests cover the supplied reference example, exact and adjacent amortization boundaries, all sensitivity rates, missing versus zero costs, validation, cash purchases, zero-rate scenarios, unsupported property types, overflow, determinism, and input immutability.
