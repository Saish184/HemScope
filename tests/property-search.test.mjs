import assert from "node:assert/strict";
import test from "node:test";
import { searchProperties } from "../domain/properties/property-search.ts";
import { calculateFinancialResult } from "../domain/finance/financial-engine.ts";
import { properties } from "../src/data/properties.ts";

const financialPreferences = { availableDownPaymentSek: 600_000, assumedAnnualInterestRate: 0.0275 };
const ids = (results) => results.map((p) => p.id);

test("no constraints returns all properties in a new array with original objects", () => {
  const result = searchProperties(properties, {});
  assert.deepEqual(result, properties);
  assert.notEqual(result, properties);
  assert.equal(result[0], properties[0]);
  assert.deepEqual(searchProperties([], {}), []);
});

test("price and room boundaries are inclusive and combine with AND", () => {
  const fixture = [
    { ...properties[0], id: "both", purchasePriceSek: 3_000_000, rooms: 3 },
    { ...properties[0], id: "expensive", purchasePriceSek: 3_000_001, rooms: 4 },
    { ...properties[0], id: "small", purchasePriceSek: 2_000_000, rooms: 2 },
  ];
  assert.deepEqual(ids(searchProperties(fixture, { hardConstraints: { maximumPurchasePriceSek: 3_000_000 } })), ["both", "small"]);
  assert.deepEqual(ids(searchProperties(fixture, { hardConstraints: { minimumRooms: 3 } })), ["both", "expensive"]);
  assert.deepEqual(ids(searchProperties(fixture, { hardConstraints: { maximumPurchasePriceSek: 3_000_000, minimumRooms: 3 } })), ["both"]);
});

test("city uses explicit city data, with case/whitespace normalization only", () => {
  assert.equal(searchProperties(properties, { hardConstraints: { city: " Göteborg " } }).length, 11);
  assert.deepEqual(ids(searchProperties(properties, { hardConstraints: { city: "MÖLNDAL", minimumRooms: 4, maximumPurchasePriceSek: 3_495_000 } })), ["demo-property-11"]);
  assert.deepEqual(searchProperties(properties, { hardConstraints: { city: "Linné" } }), []);
  assert.deepEqual(searchProperties(properties, { hardConstraints: { city: "Gothenburg" } }), []);
});

test("location, comfort and trade-off preferences do not exclude or reorder", () => {
  for (const preference of [
    { locationPreferences: { desiredNearbyAmenities: ["shopping", "public_transport"] } },
    { financialPreferences: { preferredMonthlyCashRequirementSek: 1 } },
    { financialPreferences },
    { tradeOffPreferences: { willingToPayMoreForLocation: true } },
    { tradeOffPreferences: { willingToPayMoreForLocation: false } },
  ]) assert.deepEqual(searchProperties(properties, preference), properties);
});

test("monthly constraint matches financial-engine results, including the exact boundary", () => {
  const limit = calculateFinancialResult(properties[0], financialPreferences).estimatedTotalMonthlyCashRequirementSek;
  const intent = { hardConstraints: { maximumMonthlyCashRequirementSek: limit }, financialPreferences };
  const expected = properties.filter((p) => calculateFinancialResult(p, financialPreferences).estimatedTotalMonthlyCashRequirementSek <= limit);
  assert.deepEqual(searchProperties(properties, intent), expected);
  assert.ok(expected.length > 0 && expected.length < properties.length);
  assert.deepEqual(searchProperties([properties[0]], intent), [properties[0]]);
  assert.deepEqual(searchProperties([properties[0]], { ...intent, hardConstraints: { maximumMonthlyCashRequirementSek: limit - 0.01 } }), []);
});

test("missing financing inputs reject monthly constraints even for empty datasets", () => {
  for (const financial of [undefined, {}, { availableDownPaymentSek: 600_000 }, { assumedAnnualInterestRate: 0.03 }]) {
    assert.throws(() => searchProperties([], { hardConstraints: { maximumMonthlyCashRequirementSek: 20_000 }, financialPreferences: financial }), /requires availableDownPaymentSek and assumedAnnualInterestRate/);
  }
});

test("financial evaluation errors propagate, with no invented costs or deposit clamping", () => {
  const intent = { hardConstraints: { maximumMonthlyCashRequirementSek: 20_000 }, financialPreferences };
  assert.throws(() => searchProperties([{ ...properties[0], costProfile: undefined }], intent), /costProfile/);
  assert.throws(() => searchProperties([{ ...properties[0], monthlyAssociationFeeSek: null }], intent), /unknown/);
  assert.throws(() => searchProperties([{ ...properties[0], propertyType: "house" }], intent), /apartment/);
  assert.throws(() => searchProperties(properties, { ...intent, financialPreferences: { ...financialPreferences, availableDownPaymentSek: 10_000_000 } }), /must not exceed/);
  assert.deepEqual(searchProperties([{ ...properties[0], costProfile: undefined }], { hardConstraints: { maximumPurchasePriceSek: 1 } }), []);
});

test("unsupported walking-time hard constraints are never silently ignored", () => {
  assert.throws(() => searchProperties(properties, { hardConstraints: { maximumWalkingTimeMinutes: 10 } }), /routing is not implemented/);
});

test("invalid active numeric constraints and empty city fail explicitly", () => {
  for (const field of ["maximumPurchasePriceSek", "minimumRooms", "maximumMonthlyCashRequirementSek"]) {
    for (const value of [-1, NaN, Infinity]) {
      assert.throws(() => searchProperties(properties, { hardConstraints: { [field]: value } }), new RegExp(field));
    }
  }
  assert.throws(() => searchProperties(properties, { hardConstraints: { city: " " } }), /city/);
  assert.throws(() => searchProperties([], { hardConstraints: { maximumMonthlyCashRequirementSek: 0 }, financialPreferences: { ...financialPreferences, assumedAnnualInterestRate: -1 } }), /assumedAnnualInterestRate/);
});

test("zero financing inputs are present, not mistaken for missing", () => {
  assert.equal(searchProperties(properties, { hardConstraints: { maximumMonthlyCashRequirementSek: 100_000 }, financialPreferences: { availableDownPaymentSek: 0, assumedAnnualInterestRate: 0 } }).length, 12);
});

test("repeated searches preserve input arrays, objects and intent", () => {
  const intent = { hardConstraints: { minimumRooms: 3, maximumMonthlyCashRequirementSek: 20_000 }, financialPreferences };
  const before = structuredClone({ properties, intent });
  assert.deepEqual(searchProperties(properties, intent), searchProperties(properties, intent));
  assert.deepEqual({ properties, intent }, before);
});
