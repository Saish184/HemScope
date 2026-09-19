import assert from "node:assert/strict";
import test from "node:test";
import { calculateFinancialResult } from "../domain/finance/financial-engine.ts";
import { properties } from "../src/data/properties.ts";

const property = {
  ...properties[0], purchasePriceSek: 4_000_000, monthlyAssociationFeeSek: 4200,
  costProfile: { monthlyElectricityEstimateSek: 450, monthlyInsuranceEstimateSek: 180, monthlyInternetEstimateSek: 300 },
};
const buyer = { availableDownPaymentSek: 600_000, assumedAnnualInterestRate: 0.0275 };
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.005, `${actual} differs from ${expected}`);

test("85% LTV reference example separates recurring costs and cash requirement", () => {
  const result = calculateFinancialResult(property, buyer);
  assert.equal(result.mortgageAmountSek, 3_400_000);
  assert.equal(result.loanToValueRatio, 0.85);
  assert.equal(result.annualAmortizationRate, 0.02);
  close(result.monthlyInterestSek, 7791.6666667);
  close(result.monthlyAmortizationSek, 5666.6666667);
  assert.equal(result.monthlyRecurringPropertyCostsSek, 5130);
  close(result.monthlyRecurringHousingCostSek, 12921.6666667);
  close(result.estimatedTotalMonthlyCashRequirementSek, 18588.3333333);
  assert.equal(result.monthlyRecurringHousingCostSek, result.monthlyInterestSek + result.monthlyRecurringPropertyCostsSek);
  assert.equal(result.estimatedTotalMonthlyCashRequirementSek, result.monthlyRecurringHousingCostSek + result.monthlyAmortizationSek);
  assert.notEqual(result.monthlyInterestSek, 7791.67); // No presentation rounding inside engine.
});

test("exact 70% and 50% boundaries and adjacent bands", () => {
  for (const [downPayment, rate] of [[1_199_999, 0.02], [1_200_000, 0.01], [1_200_001, 0.01], [1_999_999, 0.01], [2_000_000, 0], [2_000_001, 0]]) {
    const result = calculateFinancialResult(property, { ...buyer, availableDownPaymentSek: downPayment });
    assert.equal(result.annualAmortizationRate, rate);
    if (downPayment === 1_200_000) {
      assert.equal(result.loanToValueRatio, 0.7);
      close(result.monthlyAmortizationSek, 2333.3333333);
    }
    if (downPayment === 2_000_000) {
      assert.equal(result.loanToValueRatio, 0.5);
      assert.equal(result.monthlyAmortizationSek, 0);
    }
  }
});

test("sensitivity uses explicit rates, keeping principal repayment unchanged", () => {
  const result = calculateFinancialResult(property, buyer);
  assert.deepEqual(result.sensitivityScenarios.map((s) => s.assumedAnnualInterestRate), [0.025, 0.03, 0.035, 0.04, 0.05]);
  const expectedInterest = [7083.3333333, 8500, 9916.6666667, 11333.3333333, 14166.6666667];
  result.sensitivityScenarios.forEach((scenario, i) => {
    close(scenario.monthlyInterestSek, expectedInterest[i]);
    assert.equal(scenario.monthlyAmortizationSek, result.monthlyAmortizationSek);
    close(scenario.monthlyRecurringHousingCostSek, expectedInterest[i] + 5130);
    close(scenario.estimatedTotalMonthlyCashRequirementSek, expectedInterest[i] + 5130 + 5666.6666667);
  });
  const changedBaseRate = calculateFinancialResult(property, { ...buyer, assumedAnnualInterestRate: 0.05 });
  assert.deepEqual(changedBaseRate.sensitivityScenarios, result.sensitivityScenarios);
  assert.ok(changedBaseRate.monthlyInterestSek > result.monthlyInterestSek);
});

test("rejects invalid price, down payment and rate with field-specific errors", () => {
  for (const value of [0, -1, NaN, Infinity, -Infinity]) {
    assert.throws(() => calculateFinancialResult({ ...property, purchasePriceSek: value }, buyer), /purchasePriceSek/);
  }
  for (const value of [-1, NaN, Infinity, -Infinity, 4_000_001]) {
    assert.throws(() => calculateFinancialResult(property, { ...buyer, availableDownPaymentSek: value }), /availableDownPaymentSek/);
  }
  for (const value of [-0.01, NaN, Infinity, -Infinity]) {
    assert.throws(() => calculateFinancialResult(property, { ...buyer, assumedAnnualInterestRate: value }), /assumedAnnualInterestRate/);
  }
});

test("unknown fee/profile is rejected while known zeros are preserved", () => {
  assert.throws(() => calculateFinancialResult({ ...property, costProfile: undefined }, buyer), /costProfile is missing/);
  assert.throws(() => calculateFinancialResult({ ...property, monthlyAssociationFeeSek: null }, buyer), /monthlyAssociationFeeSek is unknown/);
  const zeroCosts = { ...property, monthlyAssociationFeeSek: 0, costProfile: { monthlyElectricityEstimateSek: 0, monthlyInsuranceEstimateSek: 0, monthlyInternetEstimateSek: 0 } };
  const result = calculateFinancialResult(zeroCosts, buyer);
  assert.equal(result.monthlyRecurringPropertyCostsSek, 0);
  assert.equal(result.monthlyRecurringHousingCostSek, result.monthlyInterestSek);
});

test("recurring costs must be finite and nonnegative, not null or missing", () => {
  for (const value of [-1, NaN, Infinity, undefined]) {
    assert.throws(() => calculateFinancialResult({ ...property, monthlyAssociationFeeSek: value }, buyer), /monthlyAssociationFeeSek/);
  }
  for (const field of Object.keys(property.costProfile)) {
    for (const value of [-1, NaN, Infinity, null, undefined]) {
      assert.throws(() => calculateFinancialResult({ ...property, costProfile: { ...property.costProfile, [field]: value } }, buyer), new RegExp(field));
    }
  }
});

test("cash purchase, zero interest and zero down payment remain valid scenarios", () => {
  const cash = calculateFinancialResult(property, { ...buyer, availableDownPaymentSek: 4_000_000 });
  assert.equal(cash.mortgageAmountSek, 0);
  assert.equal(cash.loanToValueRatio, 0);
  assert.equal(cash.monthlyAmortizationSek, 0);
  assert.equal(cash.monthlyInterestSek, 0);
  assert.equal(cash.estimatedTotalMonthlyCashRequirementSek, 5130);
  assert.ok(cash.sensitivityScenarios.every((s) => s.estimatedTotalMonthlyCashRequirementSek === 5130));
  const zeroRate = calculateFinancialResult(property, { ...buyer, assumedAnnualInterestRate: 0 });
  assert.equal(zeroRate.monthlyInterestSek, 0);
  assert.equal(zeroRate.monthlyRecurringHousingCostSek, 5130);
  const noDeposit = calculateFinancialResult(property, { ...buyer, availableDownPaymentSek: 0 });
  assert.equal(noDeposit.loanToValueRatio, 1); // Calculation, not lending approval.
});

test("rejects unsupported property types and numeric overflow", () => {
  for (const propertyType of ["house", "townhouse"]) {
    assert.throws(() => calculateFinancialResult({ ...property, propertyType }, buyer), /apartment/);
  }
  assert.throws(() => calculateFinancialResult(property, { ...buyer, assumedAnnualInterestRate: Number.MAX_VALUE }), /numeric range/);
});

test("demo calculations are deterministic and do not mutate inputs", () => {
  const before = structuredClone({ properties, buyer });
  for (const demoProperty of properties) {
    const result = calculateFinancialResult(demoProperty, buyer);
    assert.deepEqual(calculateFinancialResult(demoProperty, buyer), result);
    assert.ok(Number.isFinite(result.estimatedTotalMonthlyCashRequirementSek));
  }
  assert.deepEqual({ properties, buyer }, before);
});
